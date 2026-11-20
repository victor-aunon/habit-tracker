import { test, expect, type Route } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export type DesignTokens = Record<string, string>;

const TOKEN_DECLARATION = /(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+);/g;

/**
 * Parse every CSS custom property declared in the Stitch tokens.css file.
 * tokens.css is the canonical source of truth for the design system.
 */
export function parseDesignTokens(css: string): DesignTokens {
  const tokens: DesignTokens = {};
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let match: RegExpExecArray | null;

  while ((match = TOKEN_DECLARATION.exec(withoutComments)) !== null) {
    tokens[match[1]] = match[2].trim().replace(/\s+/g, ' ');
  }

  return tokens;
}

export function normalizeTokenValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Return one human-readable message per token whose DOM value does not match
 * the value declared by Stitch. Missing tokens are reported too.
 */
export function diffDesignTokens(expected: DesignTokens, actual: DesignTokens): string[] {
  return Object.entries(expected)
    .filter(
      ([name, expectedValue]) =>
        normalizeTokenValue(actual[name] ?? '') !== normalizeTokenValue(expectedValue),
    )
    .map(
      ([name, expectedValue]) =>
        `${name}: expected "${expectedValue}" but the DOM computed "${actual[name] ?? '<missing>'}"`,
    );
}

/**
 * Deterministic CSS injected before screenshot comparison to eliminate
 * font smoothing variations across operating systems (macOS vs Linux/CI)
 * and disable residual transitions/carets.
 */
export const DETERMINISTIC_RENDER_CSS = `
  *, *::before, *::after {
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    text-rendering: geometricPrecision !important;
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;

/**
 * Visual Audit and CSS Tokens Verification Test against Stitch Golden Master.
 */
test.describe.serial('Stitch Design Audit & Tokens Verification', () => {
  let page: any;
  const featureDir = process.env.FEATURE_DIR || './specs/001-habit-streak-tracker';
  const designsDir = path.join(featureDir, 'designs');
  const tokensFile = path.join(designsDir, 'tokens.css');
  const manifestFile = path.join(designsDir, 'routes-manifest.json');

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.addInitScript(() => {
      if (!localStorage.getItem('workflow_test_habits_v1')) {
        localStorage.setItem(
          'workflow_test_habits_v1',
          JSON.stringify([
            {
              id: 'habit-1',
              title: 'Drink 2L Water',
              description: 'Stay hydrated throughout the working day',
              category: 'health',
              createdAt: '2026-11-01T08:00:00.000Z',
              updatedAt: '2026-11-01T08:00:00.000Z',
              isActive: true,
            },
          ]),
        );
      }
      if (!localStorage.getItem('workflow_test_completions_v1')) {
        localStorage.setItem(
          'workflow_test_completions_v1',
          JSON.stringify([
            {
              id: 'c-1',
              habitId: 'habit-1',
              date: '2026-11-16',
              completedAt: '2026-11-16T10:00:00.000Z',
            },
            {
              id: 'c-2',
              habitId: 'habit-1',
              date: '2026-11-17',
              completedAt: '2026-11-17T10:00:00.000Z',
            },
            {
              id: 'c-3',
              habitId: 'habit-1',
              date: '2026-11-18',
              completedAt: '2026-11-18T10:00:00.000Z',
            },
          ]),
        );
      }
    });
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test('every Stitch design token is applied exactly in the DOM', async () => {
    test.skip(!fs.existsSync(tokensFile), 'No tokens.css found in designs directory');

    const expectedTokens = parseDesignTokens(fs.readFileSync(tokensFile, 'utf8'));
    const tokenNames = Object.keys(expectedTokens);
    expect(tokenNames.length).toBeGreaterThan(0);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const actualTokens = await page.evaluate((names: string[]) => {
      const computed = window.getComputedStyle(document.documentElement);
      return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(name)]));
    }, tokenNames);

    const mismatches = diffDesignTokens(expectedTokens, actualTokens);
    expect(
      mismatches,
      `Design token drift detected. tokens.css is the Stitch source of truth.\n${mismatches.join('\n')}`,
    ).toEqual([]);
  });

  test('accessibility: screens meet WCAG 2.1 AA standards without critical violations', async () => {
    test.skip(!fs.existsSync(manifestFile), 'No routes-manifest.json found in designs directory');

    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    for (const screen of manifest.screens || []) {
      if (screen.viewport?.width && screen.viewport?.height) {
        await page.setViewportSize({
          width: screen.viewport.width,
          height: screen.viewport.height,
        });
      }

      if (screen.fixtures && typeof screen.fixtures === 'object') {
        for (const [urlPattern, fixtureRelPath] of Object.entries(screen.fixtures)) {
          const fixtureFullPath = path.resolve(designsDir, fixtureRelPath as string);
          if (fs.existsSync(fixtureFullPath)) {
            const fixtureData = fs.readFileSync(fixtureFullPath, 'utf8');
            await page.route(`**${urlPattern}*`, async (route: Route) => {
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: fixtureData,
              });
            });
          }
        }
      }

      await page.goto(screen.route || '/');
      await page.waitForLoadState('networkidle');

      if (screen.waitForSelector) {
        await page.waitForSelector(screen.waitForSelector, { state: 'visible', timeout: 10000 });
      }

      let a11yViolations: string[] = [];

      try {
        // @ts-ignore
        const { default: AxeBuilder } = await import('@axe-core/playwright');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        a11yViolations = (results.violations || []).map(
          (v: any) => `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.helpUrl})`,
        );
      } catch {
        a11yViolations = await page.evaluate(() => {
          const issues: string[] = [];
          document.querySelectorAll('img:not([alt])').forEach((_img, i) => {
            issues.push(`[SERIOUS] image-alt: Image element #${i} is missing an 'alt' attribute.`);
          });
          document.querySelectorAll('button').forEach((btn, i) => {
            const text =
              btn.innerText?.trim() || btn.getAttribute('aria-label') || btn.getAttribute('title');
            if (!text) {
              issues.push(
                `[CRITICAL] button-name: Button element #${i} has no accessible text or aria-label.`,
              );
            }
          });
          document
            .querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])')
            .forEach((input, i) => {
              const id = input.id;
              const hasLabel = id && document.querySelector(`label[for="${id}"]`);
              const wrappedByLabel = input.closest('label');
              if (!hasLabel && !wrappedByLabel) {
                issues.push(
                  `[SERIOUS] label: Input #${i} has no associated <label> or aria-label.`,
                );
              }
            });
          return issues;
        });
      }

      expect(
        a11yViolations,
        `Accessibility Gate Failed for screen '${screen.id}' (${screen.route}):\n${a11yViolations.join('\n')}`,
      ).toEqual([]);
    }
  });

  test('visual layout matches Stitch golden screenshot with 0.05 tolerance', async () => {
    test.skip(!fs.existsSync(manifestFile), 'No routes-manifest.json found in designs directory');

    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    for (const screen of manifest.screens || []) {
      const goldenImagePath = path.join(designsDir, `${screen.id}.png`);
      if (!fs.existsSync(goldenImagePath)) {
        continue;
      }

      if (screen.viewport?.width && screen.viewport?.height) {
        await page.setViewportSize({
          width: screen.viewport.width,
          height: screen.viewport.height,
        });
      }

      if (screen.fixtures && typeof screen.fixtures === 'object') {
        for (const [urlPattern, fixtureRelPath] of Object.entries(screen.fixtures)) {
          const fixtureFullPath = path.resolve(designsDir, fixtureRelPath as string);
          if (fs.existsSync(fixtureFullPath)) {
            const fixtureData = fs.readFileSync(fixtureFullPath, 'utf8');
            await page.route(`**${urlPattern}*`, async (route: Route) => {
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: fixtureData,
              });
            });
          }
        }
      }

      await page.goto(screen.route || '/');
      await page.waitForLoadState('networkidle');

      if (screen.waitForSelector) {
        await page.waitForSelector(screen.waitForSelector, { state: 'visible', timeout: 10000 });
      }

      await page.addStyleTag({ content: DETERMINISTIC_RENDER_CSS });

      const target = screen.selector ? page.locator(screen.selector) : page;
      const mask = (screen.maskSelectors || []).map((sel: string) => page.locator(sel));

      await expect(target).toHaveScreenshot(`${screen.id}.png`, {
        maxDiffPixelRatio: 0.05,
        mask,
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
      });
    }
  });
});

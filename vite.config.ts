import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: ['@shadcn/lint'],
    rules: {
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
      'shadcn/no-restyle': ['error', { allow: ['layout'] }],
      'shadcn/no-raw-colors': 'error',
      'shadcn/no-arbitrary-values': 'error',
      'shadcn/no-inline-styles': 'error',
    },
    overrides: [
      {
        files: [
          '**/*.test.{ts,tsx,js,jsx}',
          '**/*.spec.{ts,tsx,js,jsx}',
          '**/tests/**',
          '**/test/**',
        ],
        rules: {
          'max-lines-per-function': 'off',
          complexity: 'off',
          'max-depth': 'off',
        },
      },

      {
        files: ['**/src/**/domain/**', '**/src/core/domain/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: [
                    '**/application/**',
                    '**/infrastructure/**',
                    '**/ui/**',
                    '**/src/**/application/**',
                    '**/src/**/infrastructure/**',
                    '**/src/**/ui/**',
                  ],
                  message:
                    'Clean Architecture Violation: Domain cannot depend on Application, Infrastructure, or UI (vertical slice rule).',
                },
              ],
            },
          ],
        },
      },
      {
        files: ['**/src/**/application/**', '**/src/core/application/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: [
                    '**/infrastructure/**',
                    '**/ui/**',
                    '**/src/**/infrastructure/**',
                    '**/src/**/ui/**',
                  ],
                  message:
                    'Clean Architecture Violation: Application cannot depend on Infrastructure or UI (vertical slice rule).',
                },
              ],
            },
          ],
        },
      },
      {
        files: ['**/src/**/infrastructure/**', '**/src/infrastructure/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['**/ui/**', '**/src/**/ui/**'],
                  message:
                    'Clean Architecture Violation: Infrastructure cannot depend on UI (vertical slice rule).',
                },
              ],
            },
          ],
        },
      },
      {
        files: ['**/src/**/ui/**', '**/src/ui/**', '**/src/App.tsx'],
        rules: {
          'max-lines-per-function': 'off',
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['**/infrastructure/**', '**/src/**/infrastructure/**'],
                  message:
                    'Clean Architecture Violation: UI cannot directly import Infrastructure adapters (vertical slice rule).',
                },
              ],
            },
          ],
        },
      },
    ],
  },
  fmt: {
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    tabWidth: 2,
    printWidth: 100,
  },
});

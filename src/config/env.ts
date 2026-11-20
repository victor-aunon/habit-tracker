/**
 * Typed environment configuration.
 *
 * This is the ONLY module allowed to read environment variables.
 * Application and feature code must import from here, never read process.env
 * or import.meta.env directly. The quality gate enforces this rule.
 */

export interface Env {
  readonly APP_ENV: 'development' | 'test' | 'production';
  readonly API_BASE_URL: string;
  readonly ENABLE_ANALYTICS: boolean;
}

function parseAppEnv(val: unknown): 'development' | 'test' | 'production' {
  if (val === 'production' || val === 'test') {
    return val;
  }
  return 'development';
}

function parseApiBaseUrl(val: unknown): string {
  if (typeof val === 'string' && val.trim().length > 0) {
    return val;
  }
  return '/api';
}

function parseEnableAnalytics(val: unknown): boolean {
  return val !== 'false';
}

const rawMode =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE
    ? import.meta.env.MODE
    : 'development';

const rawApiUrl =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';

const rawAnalytics =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_ENABLE_ANALYTICS
    : true;

export const env: Env = {
  APP_ENV: parseAppEnv(rawMode),
  API_BASE_URL: parseApiBaseUrl(rawApiUrl),
  ENABLE_ANALYTICS: parseEnableAnalytics(rawAnalytics),
} satisfies Env;

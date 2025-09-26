/**
 * Configuration for Coolify API Client
 * Store your API credentials here
 */

export interface CoolifyConfiguration {
  baseUrl: string;
  apiToken: string;
  timeout?: number;
}

// Your Coolify configuration
export const COOLIFY_CONFIG: CoolifyConfiguration = {
  baseUrl: 'http://192.168.0.10:8000', // Direct local access bypassing Cloudflare Access
  apiToken: '1|sZUBdHr8NQgYJSuLKa3AL9F6lQ83lb9DkTgJNxLR4d7f6916',
  timeout: 30000
};

// Alternative: Load from environment variables if available
export function getConfigFromEnv(): CoolifyConfiguration | null {
  const baseUrl = process.env.COOLIFY_BASE_URL;
  const apiToken = process.env.COOLIFY_API_TOKEN;

  if (!baseUrl || !apiToken) {
    return null;
  }

  return {
    baseUrl,
    apiToken,
    timeout: process.env.COOLIFY_TIMEOUT ? parseInt(process.env.COOLIFY_TIMEOUT) : 30000
  };
}

// Get configuration with fallback to hardcoded values
export function getCoolifyConfig(): CoolifyConfiguration {
  const envConfig = getConfigFromEnv();
  return envConfig || COOLIFY_CONFIG;
}
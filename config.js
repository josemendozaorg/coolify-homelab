"use strict";
/**
 * Configuration for Coolify API Client
 * Store your API credentials here
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOLIFY_CONFIG = void 0;
exports.getConfigFromEnv = getConfigFromEnv;
exports.getCoolifyConfig = getCoolifyConfig;
// Your Coolify configuration
exports.COOLIFY_CONFIG = {
    baseUrl: 'http://192.168.0.10:8000', // Direct local access bypassing Cloudflare Access
    apiToken: '1|sZUBdHr8NQgYJSuLKa3AL9F6lQ83lb9DkTgJNxLR4d7f6916',
    timeout: 30000
};
// Alternative: Load from environment variables if available
function getConfigFromEnv() {
    var baseUrl = process.env.COOLIFY_BASE_URL;
    var apiToken = process.env.COOLIFY_API_TOKEN;
    if (!baseUrl || !apiToken) {
        return null;
    }
    return {
        baseUrl: baseUrl,
        apiToken: apiToken,
        timeout: process.env.COOLIFY_TIMEOUT ? parseInt(process.env.COOLIFY_TIMEOUT) : 30000
    };
}
// Get configuration with fallback to hardcoded values
function getCoolifyConfig() {
    var envConfig = getConfigFromEnv();
    return envConfig || exports.COOLIFY_CONFIG;
}

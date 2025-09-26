/**
 * Configuration for Coolify API Client
 * Store your API credentials here
 */
export interface CoolifyConfiguration {
    baseUrl: string;
    apiToken: string;
    timeout?: number;
}
export declare const COOLIFY_CONFIG: CoolifyConfiguration;
export declare function getConfigFromEnv(): CoolifyConfiguration | null;
export declare function getCoolifyConfig(): CoolifyConfiguration;
//# sourceMappingURL=config.d.ts.map
/**
 * Coolify API Client
 * A TypeScript client for interacting with Coolify's REST API
 */
interface CoolifyConfig {
    baseUrl: string;
    apiToken: string;
    timeout?: number;
}
interface Application {
    id: number;
    name: string;
    description?: string;
    git_repository?: string;
    git_branch?: string;
    build_pack?: string;
    status: string;
    fqdn?: string;
    environment_id: number;
    created_at: string;
    updated_at: string;
}
interface Environment {
    id: number;
    name: string;
    description?: string;
    project_id: number;
    created_at: string;
    updated_at: string;
}
interface Project {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}
interface Database {
    id: number;
    name: string;
    type: string;
    status: string;
    environment_id: number;
    created_at: string;
    updated_at: string;
}
interface Service {
    id: number;
    name: string;
    description?: string;
    status: string;
    environment_id: number;
    created_at: string;
    updated_at: string;
}
interface DeploymentLog {
    id: number;
    application_id: number;
    status: string;
    started_at: string;
    finished_at?: string;
    commit_sha?: string;
    branch: string;
}
export declare class CoolifyAPI {
    private config;
    private headers;
    constructor(config: CoolifyConfig);
    private request;
    getProjects(): Promise<Project[]>;
    getProject(id: number): Promise<Project>;
    createProject(data: {
        name: string;
        description?: string;
    }): Promise<Project>;
    updateProject(id: number, data: {
        name?: string;
        description?: string;
    }): Promise<Project>;
    deleteProject(id: number): Promise<void>;
    getEnvironments(projectId: number): Promise<Environment[]>;
    getEnvironment(projectId: number, envId: number): Promise<Environment>;
    createEnvironment(projectId: number, data: {
        name: string;
        description?: string;
    }): Promise<Environment>;
    getApplications(): Promise<Application[]>;
    getApplication(id: number): Promise<Application>;
    createApplication(data: {
        name: string;
        description?: string;
        git_repository: string;
        git_branch?: string;
        build_pack?: string;
        environment_id: number;
    }): Promise<Application>;
    updateApplication(id: number, data: Partial<Application>): Promise<Application>;
    deleteApplication(id: number): Promise<void>;
    deployApplication(id: number, options?: {
        force_rebuild?: boolean;
    }): Promise<{
        message: string;
    }>;
    stopApplication(id: number): Promise<{
        message: string;
    }>;
    restartApplication(id: number): Promise<{
        message: string;
    }>;
    getApplicationLogs(id: number, lines?: number): Promise<{
        logs: string;
    }>;
    getDeploymentLogs(applicationId: number, deploymentId?: number): Promise<DeploymentLog[]>;
    getDatabases(): Promise<Database[]>;
    getDatabase(id: number): Promise<Database>;
    createDatabase(data: {
        name: string;
        type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';
        environment_id: number;
    }): Promise<Database>;
    startDatabase(id: number): Promise<{
        message: string;
    }>;
    stopDatabase(id: number): Promise<{
        message: string;
    }>;
    restartDatabase(id: number): Promise<{
        message: string;
    }>;
    getServices(): Promise<Service[]>;
    getService(id: number): Promise<Service>;
    startService(id: number): Promise<{
        message: string;
    }>;
    stopService(id: number): Promise<{
        message: string;
    }>;
    restartService(id: number): Promise<{
        message: string;
    }>;
    getSystemInfo(): Promise<any>;
    getVersion(): Promise<{
        version: string;
    }>;
    healthCheck(): Promise<{
        status: string;
    }>;
    getAllResources(): Promise<{
        projects: Project[];
        applications: Application[];
        databases: Database[];
        services: Service[];
    }>;
    getApplicationsByProject(projectId: number): Promise<Application[]>;
}
export declare function exampleCoolifyUsage(): Promise<void>;
export default CoolifyAPI;
//# sourceMappingURL=coolify-api-client.d.ts.map
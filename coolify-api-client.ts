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

export class CoolifyAPI {
  private config: CoolifyConfig;
  private headers: Record<string, string>;

  constructor(config: CoolifyConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
    
    this.headers = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}/api/v1${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Check if it's a Cloudflare Access redirect (common case)
        if (response.status === 302) {
          const location = response.headers.get('location');
          if (location && location.includes('cloudflareaccess.com')) {
            throw new Error(`Cloudflare Access protection detected. API calls are being redirected to authentication. Please configure Cloudflare Access to allow API token access, or access Coolify from a different endpoint.`);
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      
      // Check if response is HTML (common when hitting a web page instead of API)
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        throw new Error('API returned HTML instead of JSON. Check if the API endpoint is correct and accessible.');
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`Coolify API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: { name: string; description?: string }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(id: number, data: { name?: string; description?: string }): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: number): Promise<void> {
    await this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  // Environments
  async getEnvironments(projectId: number): Promise<Environment[]> {
    return this.request<Environment[]>(`/projects/${projectId}/environments`);
  }

  async getEnvironment(projectId: number, envId: number): Promise<Environment> {
    return this.request<Environment>(`/projects/${projectId}/environments/${envId}`);
  }

  async createEnvironment(projectId: number, data: { name: string; description?: string }): Promise<Environment> {
    return this.request<Environment>(`/projects/${projectId}/environments`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Applications
  async getApplications(): Promise<Application[]> {
    return this.request<Application[]>('/applications');
  }

  async getApplication(id: number): Promise<Application> {
    return this.request<Application>(`/applications/${id}`);
  }

  async createApplication(data: {
    name: string;
    description?: string;
    git_repository: string;
    git_branch?: string;
    build_pack?: string;
    environment_id: number;
  }): Promise<Application> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateApplication(id: number, data: Partial<Application>): Promise<Application> {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteApplication(id: number): Promise<void> {
    await this.request(`/applications/${id}`, { method: 'DELETE' });
  }

  // Application Deployments
  async deployApplication(id: number, options?: { force_rebuild?: boolean }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    });
  }

  async stopApplication(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${id}/stop`, {
      method: 'POST'
    });
  }

  async restartApplication(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${id}/restart`, {
      method: 'POST'
    });
  }

  async getApplicationLogs(id: number, lines: number = 100): Promise<{ logs: string }> {
    return this.request<{ logs: string }>(`/applications/${id}/logs?lines=${lines}`);
  }

  async getDeploymentLogs(applicationId: number, deploymentId?: number): Promise<DeploymentLog[]> {
    const endpoint = deploymentId 
      ? `/applications/${applicationId}/deployments/${deploymentId}/logs`
      : `/applications/${applicationId}/deployments/logs`;
    return this.request<DeploymentLog[]>(endpoint);
  }

  // Databases
  async getDatabases(): Promise<Database[]> {
    return this.request<Database[]>('/databases');
  }

  async getDatabase(id: number): Promise<Database> {
    return this.request<Database>(`/databases/${id}`);
  }

  async createDatabase(data: {
    name: string;
    type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';
    environment_id: number;
  }): Promise<Database> {
    return this.request<Database>('/databases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async startDatabase(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${id}/start`, {
      method: 'POST'
    });
  }

  async stopDatabase(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${id}/stop`, {
      method: 'POST'
    });
  }

  async restartDatabase(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${id}/restart`, {
      method: 'POST'
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/services');
  }

  async getService(id: number): Promise<Service> {
    return this.request<Service>(`/services/${id}`);
  }

  async startService(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${id}/start`, {
      method: 'POST'
    });
  }

  async stopService(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${id}/stop`, {
      method: 'POST'
    });
  }

  async restartService(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${id}/restart`, {
      method: 'POST'
    });
  }

  // System Information
  async getSystemInfo(): Promise<any> {
    return this.request<any>('/system');
  }

  async getVersion(): Promise<{ version: string }> {
    return this.request<{ version: string }>('/version');
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.request<{ status: string }>('/health');
      return response;
    } catch (error: any) {
      // Handle case where health endpoint returns plain text "OK"
      if (error.message && error.message.includes('Invalid JSON response: OK')) {
        return { status: 'OK' };
      }
      throw error;
    }
  }

  // Utility methods
  async getAllResources() {
    const [projects, applications, databases, services] = await Promise.all([
      this.getProjects(),
      this.getApplications(),
      this.getDatabases(),
      this.getServices()
    ]);

    return {
      projects,
      applications,
      databases,
      services
    };
  }

  async getApplicationsByProject(projectId: number): Promise<Application[]> {
    const environments = await this.getEnvironments(projectId);
    const applications = await this.getApplications();
    
    const envIds = environments.map(env => env.id);
    return applications.filter(app => envIds.includes(app.environment_id));
  }
}

// Example usage
export async function exampleCoolifyUsage() {
  const coolify = new CoolifyAPI({
    baseUrl: 'https://your-coolify-instance.com', // Replace with your Coolify URL
    apiToken: 'your-api-token-here' // Replace with your API token
  });

  try {
    // Health check
    const health = await coolify.healthCheck();
    console.log('Coolify Health:', health);

    // Get all projects
    const projects = await coolify.getProjects();
    console.log('Projects:', projects);

    // Get all applications
    const applications = await coolify.getApplications();
    console.log('Applications:', applications);

    // Deploy an application
    if (applications.length > 0) {
      const deployment = await coolify.deployApplication(applications[0].id);
      console.log('Deployment started:', deployment);
    }

    // Get system information
    const systemInfo = await coolify.getSystemInfo();
    console.log('System Info:', systemInfo);

  } catch (error) {
    console.error('Error using Coolify API:', error);
  }
}

export default CoolifyAPI;
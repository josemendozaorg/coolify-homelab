# Coolify Homelab API Client

A TypeScript client for interacting with your Coolify server API in your homelab environment.

## Features

- 🚀 Complete Coolify API client with TypeScript support
- 📱 Interactive CLI for managing your Coolify instance
- 🔧 Full CRUD operations for projects, applications, databases, and services
- 📊 System monitoring and health checks
- 🛠️ Deployment management and log viewing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

You'll need:
- Your Coolify server URL (e.g., `https://coolify.yourdomain.com`)
- An API token from your Coolify instance

To get an API token:
1. Log into your Coolify dashboard
2. Go to Settings → API Tokens
3. Create a new token with appropriate permissions

### 3. Run the CLI

```bash
npm start
```

Follow the prompts to enter your Coolify URL and API token.

## Usage Examples

### Using the API Client Directly

```typescript
import { CoolifyAPI } from './coolify-api-client';

const coolify = new CoolifyAPI({
  baseUrl: 'https://your-coolify-instance.com',
  apiToken: 'your-api-token-here'
});

// List all applications
const applications = await coolify.getApplications();
console.log('Applications:', applications);

// Deploy an application
await coolify.deployApplication(1);

// Get application logs
const logs = await coolify.getApplicationLogs(1, 100);
console.log('Logs:', logs.logs);
```

### Available API Methods

#### Projects
- `getProjects()` - List all projects
- `getProject(id)` - Get project details
- `createProject(data)` - Create new project
- `updateProject(id, data)` - Update project
- `deleteProject(id)` - Delete project

#### Applications
- `getApplications()` - List all applications
- `getApplication(id)` - Get application details
- `createApplication(data)` - Create new application
- `updateApplication(id, data)` - Update application
- `deleteApplication(id)` - Delete application
- `deployApplication(id, options?)` - Deploy application
- `stopApplication(id)` - Stop application
- `restartApplication(id)` - Restart application
- `getApplicationLogs(id, lines?)` - Get application logs

#### Databases
- `getDatabases()` - List all databases
- `getDatabase(id)` - Get database details
- `createDatabase(data)` - Create new database
- `startDatabase(id)` - Start database
- `stopDatabase(id)` - Stop database
- `restartDatabase(id)` - Restart database

#### Services
- `getServices()` - List all services
- `getService(id)` - Get service details
- `startService(id)` - Start service
- `stopService(id)` - Stop service
- `restartService(id)` - Restart service

#### System
- `getSystemInfo()` - Get system information
- `getVersion()` - Get Coolify version
- `healthCheck()` - Check API health
- `getAllResources()` - Get overview of all resources

## CLI Features

The interactive CLI provides menus for:

1. **Projects Management**
   - List, view, create, update, and delete projects
   - View project environments

2. **Applications Management**
   - List all applications with status
   - Deploy, stop, and restart applications
   - View application logs
   - Create new applications from Git repositories

3. **Database Management**
   - Manage PostgreSQL, MySQL, MariaDB, MongoDB, and Redis databases
   - Start, stop, and restart database instances
   - Create new database instances

4. **Service Management**
   - Manage additional services
   - Control service lifecycle

5. **System Information**
   - View Coolify version and health status
   - Get resource summaries
   - System diagnostics

## Development

### Build the project

```bash
npm run build
```

### Development mode with auto-reload

```bash
npm run dev
```

### Run tests

```bash
npm test
```

## Configuration Options

The `CoolifyAPI` constructor accepts these options:

```typescript
interface CoolifyConfig {
  baseUrl: string;        // Your Coolify server URL
  apiToken: string;       // Your API token
  timeout?: number;       // Request timeout in ms (default: 30000)
}
```

## Error Handling

The client includes comprehensive error handling:

- Network errors are caught and logged
- HTTP error status codes are converted to descriptive errors
- API responses are validated
- The CLI handles errors gracefully with user-friendly messages

## API Token Permissions

Make sure your API token has the necessary permissions for the operations you want to perform:

- **Read**: List and view resources
- **Write**: Create and update resources
- **Deploy**: Deploy applications
- **Delete**: Remove resources

## Common Use Cases

### Automated Deployments

```typescript
// Deploy all applications in a project
const project = await coolify.getProject(1);
const apps = await coolify.getApplicationsByProject(project.id);

for (const app of apps) {
  await coolify.deployApplication(app.id);
  console.log(`Deployed ${app.name}`);
}
```

### Health Monitoring

```typescript
// Check system health and get resource status
const health = await coolify.healthCheck();
const resources = await coolify.getAllResources();

console.log(`Health: ${health.status}`);
console.log(`Applications: ${resources.applications.length}`);
console.log(`Databases: ${resources.databases.length}`);
```

### Log Aggregation

```typescript
// Get logs from multiple applications
const apps = await coolify.getApplications();
const logs = await Promise.all(
  apps.map(app => coolify.getApplicationLogs(app.id, 50))
);
```

## Troubleshooting

### Connection Issues
- Verify your Coolify URL is correct and accessible
- Check that your API token is valid and has the right permissions
- Ensure your Coolify instance is running and healthy

### API Errors
- Check the Coolify server logs for detailed error information
- Verify the API endpoint exists in your Coolify version
- Some features may require specific Coolify versions

### CLI Issues
- Make sure you have Node.js 16+ installed
- Run `npm install` to ensure all dependencies are installed
- Use `npm run dev` for development mode with better error reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this in your homelab projects!
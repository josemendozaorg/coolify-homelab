#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const coolify_api_client_1 = require("./coolify-api-client");
const config_1 = require("./config");
const readline = __importStar(require("readline"));
/**
 * Interactive CLI for Coolify API
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let coolify;
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}
async function initializeCoolify() {
    console.log('🚀 Coolify API CLI');
    console.log('==================');
    // Try to use configuration from config.ts first
    const config = (0, config_1.getCoolifyConfig)();
    let baseUrl = config.baseUrl;
    let apiToken = config.apiToken;
    // If default values are still present, ask user for input
    if (baseUrl === 'https://your-coolify-instance.com' || !baseUrl) {
        baseUrl = await askQuestion('Enter your Coolify URL (e.g., https://coolify.example.com): ');
    }
    else {
        console.log(`Using configured Coolify URL: ${baseUrl}`);
    }
    if (apiToken === 'your-api-token-here' || !apiToken) {
        apiToken = await askQuestion('Enter your API token: ');
    }
    else {
        console.log('✅ Using configured API token');
    }
    coolify = new coolify_api_client_1.CoolifyAPI({
        baseUrl,
        apiToken,
        timeout: config.timeout
    });
    try {
        const health = await coolify.healthCheck();
        console.log('✅ Connected to Coolify successfully!');
        // Show version info
        try {
            const version = await coolify.getVersion();
            console.log(`📦 Coolify Version: ${version.version}`);
        }
        catch (versionError) {
            // Version endpoint might not be available in all versions
        }
        return true;
    }
    catch (error) {
        console.error('❌ Failed to connect to Coolify:', error);
        console.log('\n💡 Tips:');
        console.log('- Make sure your Coolify URL is correct and accessible');
        console.log('- Verify your API token is valid');
        console.log('- Check that your Coolify instance is running');
        return false;
    }
}
async function showMainMenu() {
    console.log('\n📋 Main Menu');
    console.log('=============');
    console.log('1. Projects');
    console.log('2. Applications');
    console.log('3. Databases');
    console.log('4. Services');
    console.log('5. System Info');
    console.log('6. Health Check');
    console.log('0. Exit');
    const choice = await askQuestion('\nSelect an option: ');
    return choice;
}
async function handleProjects() {
    console.log('\n📁 Projects Menu');
    console.log('=================');
    console.log('1. List all projects');
    console.log('2. Get project details');
    console.log('3. Create project');
    console.log('4. Update project');
    console.log('5. Delete project');
    console.log('0. Back to main menu');
    const choice = await askQuestion('\nSelect an option: ');
    try {
        switch (choice) {
            case '1':
                const projects = await coolify.getProjects();
                console.table(projects);
                break;
            case '2':
                const projectId = parseInt(await askQuestion('Enter project ID: '));
                const project = await coolify.getProject(projectId);
                console.log('Project details:', project);
                break;
            case '3':
                const name = await askQuestion('Enter project name: ');
                const description = await askQuestion('Enter project description (optional): ');
                const newProject = await coolify.createProject({ name, description: description || undefined });
                console.log('✅ Project created:', newProject);
                break;
            case '0':
                return;
            default:
                console.log('Invalid option');
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    await askQuestion('\nPress Enter to continue...');
    await handleProjects();
}
async function handleApplications() {
    console.log('\n🚀 Applications Menu');
    console.log('=====================');
    console.log('1. List all applications');
    console.log('2. Get application details');
    console.log('3. Deploy application');
    console.log('4. Stop application');
    console.log('5. Restart application');
    console.log('6. Get application logs');
    console.log('7. Create application');
    console.log('0. Back to main menu');
    const choice = await askQuestion('\nSelect an option: ');
    try {
        switch (choice) {
            case '1':
                const applications = await coolify.getApplications();
                console.table(applications.map(app => ({
                    ID: app.id,
                    Name: app.name,
                    Status: app.status,
                    Branch: app.git_branch || 'N/A',
                    FQDN: app.fqdn || 'N/A'
                })));
                break;
            case '2':
                const appId = parseInt(await askQuestion('Enter application ID: '));
                const app = await coolify.getApplication(appId);
                console.log('Application details:', app);
                break;
            case '3':
                const deployAppId = parseInt(await askQuestion('Enter application ID to deploy: '));
                const forceRebuild = (await askQuestion('Force rebuild? (y/n): ')) === 'y';
                const deployment = await coolify.deployApplication(deployAppId, { force_rebuild: forceRebuild });
                console.log('✅ Deployment started:', deployment);
                break;
            case '4':
                const stopAppId = parseInt(await askQuestion('Enter application ID to stop: '));
                const stopResult = await coolify.stopApplication(stopAppId);
                console.log('✅ Application stopped:', stopResult);
                break;
            case '5':
                const restartAppId = parseInt(await askQuestion('Enter application ID to restart: '));
                const restartResult = await coolify.restartApplication(restartAppId);
                console.log('✅ Application restarted:', restartResult);
                break;
            case '6':
                const logAppId = parseInt(await askQuestion('Enter application ID: '));
                const lines = parseInt(await askQuestion('Number of log lines (default: 100): ') || '100');
                const logs = await coolify.getApplicationLogs(logAppId, lines);
                console.log('\n📋 Application Logs:');
                console.log('====================');
                console.log(logs.logs);
                break;
            case '7':
                const appName = await askQuestion('Enter application name: ');
                const gitRepo = await askQuestion('Enter git repository URL: ');
                const gitBranch = await askQuestion('Enter git branch (default: main): ') || 'main';
                const envId = parseInt(await askQuestion('Enter environment ID: '));
                const appDescription = await askQuestion('Enter description (optional): ');
                const newApp = await coolify.createApplication({
                    name: appName,
                    git_repository: gitRepo,
                    git_branch: gitBranch,
                    environment_id: envId,
                    description: appDescription || undefined
                });
                console.log('✅ Application created:', newApp);
                break;
            case '0':
                return;
            default:
                console.log('Invalid option');
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    await askQuestion('\nPress Enter to continue...');
    await handleApplications();
}
async function handleDatabases() {
    console.log('\n🗄️ Databases Menu');
    console.log('==================');
    console.log('1. List all databases');
    console.log('2. Get database details');
    console.log('3. Start database');
    console.log('4. Stop database');
    console.log('5. Restart database');
    console.log('6. Create database');
    console.log('0. Back to main menu');
    const choice = await askQuestion('\nSelect an option: ');
    try {
        switch (choice) {
            case '1':
                const databases = await coolify.getDatabases();
                console.table(databases.map(db => ({
                    ID: db.id,
                    Name: db.name,
                    Type: db.type,
                    Status: db.status
                })));
                break;
            case '2':
                const dbId = parseInt(await askQuestion('Enter database ID: '));
                const database = await coolify.getDatabase(dbId);
                console.log('Database details:', database);
                break;
            case '3':
                const startDbId = parseInt(await askQuestion('Enter database ID to start: '));
                const startResult = await coolify.startDatabase(startDbId);
                console.log('✅ Database started:', startResult);
                break;
            case '4':
                const stopDbId = parseInt(await askQuestion('Enter database ID to stop: '));
                const stopResult = await coolify.stopDatabase(stopDbId);
                console.log('✅ Database stopped:', stopResult);
                break;
            case '5':
                const restartDbId = parseInt(await askQuestion('Enter database ID to restart: '));
                const restartResult = await coolify.restartDatabase(restartDbId);
                console.log('✅ Database restarted:', restartResult);
                break;
            case '6':
                const dbName = await askQuestion('Enter database name: ');
                const dbType = await askQuestion('Enter database type (postgresql/mysql/mariadb/mongodb/redis): ');
                const dbEnvId = parseInt(await askQuestion('Enter environment ID: '));
                const newDb = await coolify.createDatabase({
                    name: dbName,
                    type: dbType,
                    environment_id: dbEnvId
                });
                console.log('✅ Database created:', newDb);
                break;
            case '0':
                return;
            default:
                console.log('Invalid option');
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    await askQuestion('\nPress Enter to continue...');
    await handleDatabases();
}
async function handleServices() {
    console.log('\n🛠️ Services Menu');
    console.log('=================');
    console.log('1. List all services');
    console.log('2. Get service details');
    console.log('3. Start service');
    console.log('4. Stop service');
    console.log('5. Restart service');
    console.log('0. Back to main menu');
    const choice = await askQuestion('\nSelect an option: ');
    try {
        switch (choice) {
            case '1':
                const services = await coolify.getServices();
                console.table(services.map(service => ({
                    ID: service.id,
                    Name: service.name,
                    Status: service.status,
                    Description: service.description || 'N/A'
                })));
                break;
            case '2':
                const serviceId = parseInt(await askQuestion('Enter service ID: '));
                const service = await coolify.getService(serviceId);
                console.log('Service details:', service);
                break;
            case '3':
                const startServiceId = parseInt(await askQuestion('Enter service ID to start: '));
                const startResult = await coolify.startService(startServiceId);
                console.log('✅ Service started:', startResult);
                break;
            case '4':
                const stopServiceId = parseInt(await askQuestion('Enter service ID to stop: '));
                const stopResult = await coolify.stopService(stopServiceId);
                console.log('✅ Service stopped:', stopResult);
                break;
            case '5':
                const restartServiceId = parseInt(await askQuestion('Enter service ID to restart: '));
                const restartResult = await coolify.restartService(restartServiceId);
                console.log('✅ Service restarted:', restartResult);
                break;
            case '0':
                return;
            default:
                console.log('Invalid option');
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    await askQuestion('\nPress Enter to continue...');
    await handleServices();
}
async function handleSystemInfo() {
    try {
        console.log('\n🖥️ System Information');
        console.log('======================');
        const [systemInfo, version, health] = await Promise.all([
            coolify.getSystemInfo(),
            coolify.getVersion(),
            coolify.healthCheck()
        ]);
        console.log('Version:', version.version);
        console.log('Health Status:', health.status);
        console.log('System Info:', systemInfo);
        const resources = await coolify.getAllResources();
        console.log('\n📊 Resource Summary:');
        console.log('====================');
        console.log(`Projects: ${resources.projects.length}`);
        console.log(`Applications: ${resources.applications.length}`);
        console.log(`Databases: ${resources.databases.length}`);
        console.log(`Services: ${resources.services.length}`);
    }
    catch (error) {
        console.error('❌ Error getting system info:', error);
    }
    await askQuestion('\nPress Enter to continue...');
}
async function main() {
    const connected = await initializeCoolify();
    if (!connected) {
        process.exit(1);
    }
    let running = true;
    while (running) {
        const choice = await showMainMenu();
        switch (choice) {
            case '1':
                await handleProjects();
                break;
            case '2':
                await handleApplications();
                break;
            case '3':
                await handleDatabases();
                break;
            case '4':
                await handleServices();
                break;
            case '5':
                await handleSystemInfo();
                break;
            case '6':
                try {
                    const health = await coolify.healthCheck();
                    console.log('✅ Health Status:', health.status);
                }
                catch (error) {
                    console.error('❌ Health Check Failed:', error);
                }
                await askQuestion('\nPress Enter to continue...');
                break;
            case '0':
                running = false;
                break;
            default:
                console.log('Invalid option');
                await askQuestion('Press Enter to continue...');
        }
    }
    console.log('👋 Goodbye!');
    rl.close();
}
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=coolify-cli.js.map
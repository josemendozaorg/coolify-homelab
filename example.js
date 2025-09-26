"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coolify_api_client_1 = require("./coolify-api-client");
const config_1 = require("./config");
/**
 * Example usage of the Coolify API client
 */
async function main() {
    // Initialize the Coolify API client using configuration
    const config = (0, config_1.getCoolifyConfig)();
    const coolify = new coolify_api_client_1.CoolifyAPI(config);
    try {
        console.log('🚀 Coolify API Example');
        console.log('======================');
        // 1. Health check
        console.log('\n1. Checking Coolify health...');
        const health = await coolify.healthCheck();
        console.log('✅ Health Status:', health.status);
        // 2. Get version info
        const version = await coolify.getVersion();
        console.log('📦 Coolify Version:', version.version);
        // 3. Get all resources overview
        console.log('\n2. Getting resources overview...');
        const resources = await coolify.getAllResources();
        console.log(`📊 Resources Summary:`);
        console.log(`   Projects: ${resources.projects.length}`);
        console.log(`   Applications: ${resources.applications.length}`);
        console.log(`   Databases: ${resources.databases.length}`);
        console.log(`   Services: ${resources.services.length}`);
        // 4. List projects
        console.log('\n3. Projects:');
        resources.projects.forEach(project => {
            console.log(`   📁 ${project.name} (ID: ${project.id})`);
        });
        // 5. List applications with status
        console.log('\n4. Applications:');
        resources.applications.forEach(app => {
            console.log(`   🚀 ${app.name} (ID: ${app.id}) - Status: ${app.status}`);
            if (app.fqdn)
                console.log(`      🌐 URL: ${app.fqdn}`);
            if (app.git_repository)
                console.log(`      📦 Repo: ${app.git_repository}`);
        });
        // 6. List databases
        console.log('\n5. Databases:');
        resources.databases.forEach(db => {
            console.log(`   🗄️  ${db.name} (ID: ${db.id}) - Type: ${db.type} - Status: ${db.status}`);
        });
        // 7. List services
        console.log('\n6. Services:');
        resources.services.forEach(service => {
            console.log(`   🛠️  ${service.name} (ID: ${service.id}) - Status: ${service.status}`);
        });
        // 8. Example: Deploy first application if any exist
        if (resources.applications.length > 0) {
            const firstApp = resources.applications[0];
            console.log(`\n7. Example: Deploying application "${firstApp.name}"...`);
            try {
                const deployment = await coolify.deployApplication(firstApp.id);
                console.log('✅ Deployment started:', deployment.message);
            }
            catch (deployError) {
                console.log('⚠️  Deployment failed or not needed:', deployError.message);
            }
        }
        // 9. Example: Get application logs
        if (resources.applications.length > 0) {
            const firstApp = resources.applications[0];
            console.log(`\n8. Getting logs for application "${firstApp.name}"...`);
            try {
                const logs = await coolify.getApplicationLogs(firstApp.id, 10);
                console.log('📋 Last 10 log lines:');
                console.log(logs.logs || 'No logs available');
            }
            catch (logError) {
                console.log('⚠️  Could not retrieve logs:', logError.message);
            }
        }
        // 10. System information
        console.log('\n9. Getting system information...');
        try {
            const systemInfo = await coolify.getSystemInfo();
            console.log('🖥️  System Info:', JSON.stringify(systemInfo, null, 2));
        }
        catch (sysError) {
            console.log('⚠️  Could not retrieve system info:', sysError.message);
        }
        console.log('\n✅ Example completed successfully!');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        // Common error scenarios and solutions
        if (error.message.includes('401')) {
            console.log('\n💡 Tip: Check your API token - it might be invalid or expired');
        }
        else if (error.message.includes('404')) {
            console.log('\n💡 Tip: Check your Coolify URL - the endpoint might not exist');
        }
        else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Tip: Check your Coolify URL - the server might be unreachable');
        }
    }
}
// Run the example
if (require.main === module) {
    main().catch(console.error);
}
exports.default = main;
//# sourceMappingURL=example.js.map
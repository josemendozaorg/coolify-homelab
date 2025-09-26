#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coolify_api_client_1 = require("./coolify-api-client");
const config_1 = require("./config");
/**
 * Quick test script to verify your Coolify API connection
 */
async function quickTest() {
    console.log('🚀 Coolify API Quick Test');
    console.log('==========================');
    const config = (0, config_1.getCoolifyConfig)();
    console.log(`📡 Connecting to: ${config.baseUrl}`);
    console.log(`🔑 Using API token: ${config.apiToken.substring(0, 10)}...`);
    const coolify = new coolify_api_client_1.CoolifyAPI(config);
    try {
        // 1. Health Check
        console.log('\n1. 🩺 Health Check...');
        const health = await coolify.healthCheck();
        console.log('✅ Status:', health.status);
        // 2. Version Check
        console.log('\n2. 📦 Version Check...');
        try {
            const version = await coolify.getVersion();
            console.log('✅ Coolify Version:', version.version);
        }
        catch (versionError) {
            console.log('⚠️  Version endpoint not available (older Coolify version)');
        }
        // 3. Resource Count
        console.log('\n3. 📊 Resources Overview...');
        const resources = await coolify.getAllResources();
        console.log('✅ Resource Summary:');
        console.log(`   📁 Projects: ${resources.projects.length}`);
        console.log(`   🚀 Applications: ${resources.applications.length}`);
        console.log(`   🗄️  Databases: ${resources.databases.length}`);
        console.log(`   🛠️  Services: ${resources.services.length}`);
        // 4. List Applications (if any)
        if (resources.applications.length > 0) {
            console.log('\n4. 🚀 Applications:');
            resources.applications.forEach(app => {
                console.log(`   • ${app.name} (ID: ${app.id}) - ${app.status}`);
                if (app.fqdn)
                    console.log(`     🌐 ${app.fqdn}`);
            });
        }
        // 5. List Projects (if any)
        if (resources.projects.length > 0) {
            console.log('\n5. 📁 Projects:');
            resources.projects.forEach(project => {
                console.log(`   • ${project.name} (ID: ${project.id})`);
            });
        }
        console.log('\n🎉 Connection test completed successfully!');
        console.log('✅ Your Coolify API is working correctly.');
        console.log('\n💡 Next steps:');
        console.log('   • Run "npm start" for the interactive CLI');
        console.log('   • Run "npx ts-node example.ts" for detailed examples');
    }
    catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message || error);
        console.log('\n🔧 Troubleshooting:');
        const errorMessage = error.message || error.toString();
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            console.log('   • Check your API token - it might be invalid or expired');
            console.log('   • Make sure the token has the required permissions');
        }
        else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
            console.log('   • Check your Coolify URL - make sure it includes the correct path');
            console.log('   • Verify the API endpoints exist in your Coolify version');
        }
        else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
            console.log('   • Check your Coolify URL - the server might be unreachable');
            console.log('   • Verify your Coolify instance is running and accessible');
        }
        else if (errorMessage.includes('timeout')) {
            console.log('   • Connection timed out - check network connectivity');
            console.log('   • Your Coolify instance might be slow to respond');
        }
        console.log('\n🔗 Configuration:');
        console.log(`   Base URL: ${config.baseUrl}`);
        console.log(`   API Token: ${config.apiToken.substring(0, 20)}...`);
        process.exit(1);
    }
}
if (require.main === module) {
    quickTest().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=quick-test.js.map
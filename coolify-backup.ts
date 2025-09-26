#!/usr/bin/env ts-node

import { CoolifyAPI } from './coolify-api-client';
import { getCoolifyConfig } from './config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Coolify Server Backup Tool
 * Backs up all Coolify configurations, databases, and Docker volumes
 */

interface BackupConfig {
  coolifyHost: string;
  sshUser?: string;
  sshKey?: string;
  backupDir: string;
  timestamp: string;
}

class CoolifyBackup {
  private config: BackupConfig;
  private coolifyAPI: CoolifyAPI;

  constructor() {
    const apiConfig = getCoolifyConfig();
    this.coolifyAPI = new CoolifyAPI(apiConfig);
    
    this.config = {
      coolifyHost: '192.168.0.10',
      sshUser: 'root', // Change if different
      backupDir: path.join(process.cwd(), 'coolify-backups'),
      timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    };
  }

  /**
   * Create backup directory structure
   */
  async createBackupDirectories() {
    const backupPath = path.join(this.config.backupDir, `backup-${this.config.timestamp}`);
    const dirs = [
      backupPath,
      path.join(backupPath, 'api-data'),
      path.join(backupPath, 'docker-volumes'),
      path.join(backupPath, 'database'),
      path.join(backupPath, 'configs'),
      path.join(backupPath, 'ssl-certs')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    return backupPath;
  }

  /**
   * Backup all API-accessible data
   */
  async backupAPIData(backupPath: string) {
    console.log('📡 Backing up API data...');
    
    try {
      // Get all resources
      const resources = await this.coolifyAPI.getAllResources();
      
      // Save projects
      fs.writeFileSync(
        path.join(backupPath, 'api-data', 'projects.json'),
        JSON.stringify(resources.projects, null, 2)
      );
      console.log(`  ✅ Backed up ${resources.projects.length} projects`);

      // Save applications
      fs.writeFileSync(
        path.join(backupPath, 'api-data', 'applications.json'),
        JSON.stringify(resources.applications, null, 2)
      );
      console.log(`  ✅ Backed up ${resources.applications.length} applications`);

      // Save databases
      fs.writeFileSync(
        path.join(backupPath, 'api-data', 'databases.json'),
        JSON.stringify(resources.databases, null, 2)
      );
      console.log(`  ✅ Backed up ${resources.databases.length} databases`);

      // Save services
      fs.writeFileSync(
        path.join(backupPath, 'api-data', 'services.json'),
        JSON.stringify(resources.services, null, 2)
      );
      console.log(`  ✅ Backed up ${resources.services.length} services`);

      // Get detailed info for each application
      const appDetails = [];
      for (const app of resources.applications) {
        try {
          const details = await this.coolifyAPI.getApplication(app.id);
          appDetails.push(details);
        } catch (error) {
          console.log(`  ⚠️  Could not get details for app ${app.id}`);
        }
      }
      
      fs.writeFileSync(
        path.join(backupPath, 'api-data', 'applications-detailed.json'),
        JSON.stringify(appDetails, null, 2)
      );

      // Save system info if available
      try {
        const systemInfo = await this.coolifyAPI.getSystemInfo();
        fs.writeFileSync(
          path.join(backupPath, 'api-data', 'system-info.json'),
          JSON.stringify(systemInfo, null, 2)
        );
        console.log('  ✅ Backed up system information');
      } catch (error) {
        console.log('  ⚠️  System info not available');
      }

    } catch (error) {
      console.error('  ❌ Error backing up API data:', error);
    }
  }

  /**
   * Create SSH backup script for server-side backup
   */
  createServerBackupScript(backupPath: string): string {
    return `#!/bin/bash
# Coolify Server Backup Script
# Generated: ${new Date().toISOString()}

set -e
echo "🚀 Starting Coolify server backup..."

# Variables
BACKUP_DIR="/tmp/coolify-backup-${this.config.timestamp}"
COOLIFY_DATA_DIR="/data/coolify"

# Create backup directory
mkdir -p "\${BACKUP_DIR}"

echo "📦 Backing up Coolify database..."
# Backup Coolify SQLite database
if [ -f "\${COOLIFY_DATA_DIR}/coolify.db" ]; then
    cp "\${COOLIFY_DATA_DIR}/coolify.db" "\${BACKUP_DIR}/coolify.db"
    echo "  ✅ Database backed up"
else
    echo "  ⚠️  Database not found at standard location"
fi

echo "🐳 Backing up Docker volumes..."
# List all Coolify-related Docker volumes
docker volume ls --format '{{.Name}}' | grep -E 'coolify|^[a-z0-9]{24}' > "\${BACKUP_DIR}/docker-volumes.txt" || true

# Backup each volume
while IFS= read -r volume; do
    echo "  Backing up volume: \$volume"
    docker run --rm -v "\$volume":/data -v "\${BACKUP_DIR}":/backup alpine tar czf "/backup/volume-\$volume.tar.gz" -C /data .
done < "\${BACKUP_DIR}/docker-volumes.txt"

echo "📋 Backing up Docker configurations..."
# Backup Docker compose files
find /data/coolify -name "docker-compose*.yml" -o -name "*.env" 2>/dev/null | while read -r file; do
    cp --parents "\$file" "\${BACKUP_DIR}/" 2>/dev/null || true
done

echo "🔧 Backing up Coolify configuration..."
# Backup .env file
if [ -f "/data/coolify/.env" ]; then
    cp "/data/coolify/.env" "\${BACKUP_DIR}/coolify.env"
fi

# Backup Traefik configuration if exists
if [ -d "/data/coolify/proxy" ]; then
    tar czf "\${BACKUP_DIR}/traefik-config.tar.gz" -C /data/coolify proxy
    echo "  ✅ Traefik configuration backed up"
fi

echo "📊 Getting system information..."
# System info
{
    echo "=== System Information ==="
    echo "Hostname: \$(hostname)"
    echo "Date: \$(date)"
    echo "Kernel: \$(uname -a)"
    echo ""
    echo "=== Docker Info ==="
    docker version
    echo ""
    echo "=== Docker Containers ==="
    docker ps -a
    echo ""
    echo "=== Docker Images ==="
    docker images
    echo ""
    echo "=== Disk Usage ==="
    df -h
} > "\${BACKUP_DIR}/system-info.txt"

# Create final archive
echo "📦 Creating final backup archive..."
cd /tmp
tar czf "coolify-backup-${this.config.timestamp}.tar.gz" "coolify-backup-${this.config.timestamp}"

echo "✅ Backup complete!"
echo "📁 Backup location: /tmp/coolify-backup-${this.config.timestamp}.tar.gz"
echo "📏 Size: \$(du -h /tmp/coolify-backup-${this.config.timestamp}.tar.gz | cut -f1)"
`;
  }

  /**
   * Create restore script
   */
  createRestoreScript(): string {
    return `#!/bin/bash
# Coolify Restore Script
# Usage: ./restore.sh <backup-file.tar.gz>

set -e

if [ -z "\$1" ]; then
    echo "Usage: \$0 <backup-file.tar.gz>"
    exit 1
fi

BACKUP_FILE="\$1"
RESTORE_DIR="/tmp/coolify-restore-\$(date +%s)"

echo "🔄 Starting Coolify restore from \$BACKUP_FILE..."

# Extract backup
mkdir -p "\${RESTORE_DIR}"
tar xzf "\${BACKUP_FILE}" -C "\${RESTORE_DIR}"
BACKUP_DIR=\$(find "\${RESTORE_DIR}" -maxdepth 1 -type d -name "coolify-backup-*" | head -1)

if [ -z "\${BACKUP_DIR}" ]; then
    echo "❌ Invalid backup file"
    exit 1
fi

echo "📦 Restoring database..."
if [ -f "\${BACKUP_DIR}/coolify.db" ]; then
    # Backup current database
    cp /data/coolify/coolify.db /data/coolify/coolify.db.bak.\$(date +%s) 2>/dev/null || true
    # Restore database
    cp "\${BACKUP_DIR}/coolify.db" /data/coolify/coolify.db
    echo "  ✅ Database restored"
fi

echo "🐳 Restoring Docker volumes..."
if [ -f "\${BACKUP_DIR}/docker-volumes.txt" ]; then
    while IFS= read -r volume; do
        if [ -f "\${BACKUP_DIR}/volume-\$volume.tar.gz" ]; then
            echo "  Restoring volume: \$volume"
            docker run --rm -v "\$volume":/data -v "\${BACKUP_DIR}":/backup alpine sh -c "cd /data && tar xzf /backup/volume-\$volume.tar.gz"
        fi
    done < "\${BACKUP_DIR}/docker-volumes.txt"
fi

echo "🔧 Restoring configuration..."
if [ -f "\${BACKUP_DIR}/coolify.env" ]; then
    cp "\${BACKUP_DIR}/coolify.env" /data/coolify/.env
    echo "  ✅ Environment configuration restored"
fi

if [ -f "\${BACKUP_DIR}/traefik-config.tar.gz" ]; then
    tar xzf "\${BACKUP_DIR}/traefik-config.tar.gz" -C /data/coolify
    echo "  ✅ Traefik configuration restored"
fi

echo "🔄 Restarting Coolify services..."
docker restart coolify coolify-proxy 2>/dev/null || true

echo "✅ Restore complete!"
echo "⚠️  Please verify all services are running correctly"
`;
  }

  /**
   * Main backup process
   */
  async runBackup() {
    console.log('🚀 Coolify Backup Tool');
    console.log('======================');
    console.log(`📅 Timestamp: ${this.config.timestamp}`);
    console.log(`🖥️  Server: ${this.config.coolifyHost}`);
    console.log('');

    // Create backup directories
    const backupPath = await this.createBackupDirectories();
    console.log(`📁 Backup directory: ${backupPath}\n`);

    // Backup API data
    await this.backupAPIData(backupPath);

    // Create server backup script
    const serverScript = this.createServerBackupScript(backupPath);
    const scriptPath = path.join(backupPath, 'server-backup.sh');
    fs.writeFileSync(scriptPath, serverScript);
    console.log('\n📝 Server backup script created');

    // Create restore script
    const restoreScript = this.createRestoreScript();
    const restorePath = path.join(backupPath, 'restore.sh');
    fs.writeFileSync(restorePath, restoreScript);
    console.log('📝 Restore script created');

    // Create README
    const readme = `# Coolify Backup
Date: ${new Date().toISOString()}
Server: ${this.config.coolifyHost}

## Contents
- **api-data/**: All API-accessible configurations (projects, apps, databases, services)
- **server-backup.sh**: Script to run on the server for full backup
- **restore.sh**: Script to restore the backup

## How to create full server backup:

1. Copy server-backup.sh to your Coolify server:
   \`\`\`bash
   scp server-backup.sh root@${this.config.coolifyHost}:/tmp/
   \`\`\`

2. Run the backup on the server:
   \`\`\`bash
   ssh root@${this.config.coolifyHost} "bash /tmp/server-backup.sh"
   \`\`\`

3. Download the backup:
   \`\`\`bash
   scp root@${this.config.coolifyHost}:/tmp/coolify-backup-${this.config.timestamp}.tar.gz ./
   \`\`\`

## How to restore:

1. Copy backup and restore script to the target server:
   \`\`\`bash
   scp coolify-backup-*.tar.gz restore.sh root@<target-server>:/tmp/
   \`\`\`

2. Run the restore:
   \`\`\`bash
   ssh root@<target-server> "bash /tmp/restore.sh /tmp/coolify-backup-*.tar.gz"
   \`\`\`

## Manual SSH Commands for backup:

### Backup Coolify database:
\`\`\`bash
ssh root@${this.config.coolifyHost} "cp /data/coolify/coolify.db /tmp/coolify-db-backup.db"
scp root@${this.config.coolifyHost}:/tmp/coolify-db-backup.db ./
\`\`\`

### Backup all Docker volumes:
\`\`\`bash
ssh root@${this.config.coolifyHost} "docker volume ls --format '{{.Name}}' | grep coolify" > volumes.txt
while read volume; do
  ssh root@${this.config.coolifyHost} "docker run --rm -v \$volume:/data -v /tmp:/backup alpine tar czf /backup/\$volume.tar.gz -C /data ."
  scp root@${this.config.coolifyHost}:/tmp/\$volume.tar.gz ./
done < volumes.txt
\`\`\`

### Backup .env configuration:
\`\`\`bash
scp root@${this.config.coolifyHost}:/data/coolify/.env ./coolify.env
\`\`\`
`;

    fs.writeFileSync(path.join(backupPath, 'README.md'), readme);
    console.log('📚 README created with instructions');

    console.log('\n✅ Backup preparation complete!');
    console.log('\n📋 Next steps:');
    console.log(`1. Run on server: scp ${scriptPath} root@${this.config.coolifyHost}:/tmp/`);
    console.log(`2. Execute backup: ssh root@${this.config.coolifyHost} "bash /tmp/server-backup.sh"`);
    console.log(`3. Download backup: scp root@${this.config.coolifyHost}:/tmp/coolify-backup-${this.config.timestamp}.tar.gz ./`);
    
    return backupPath;
  }
}

// Run backup if executed directly
if (require.main === module) {
  const backup = new CoolifyBackup();
  backup.runBackup().catch(console.error);
}

export { CoolifyBackup };
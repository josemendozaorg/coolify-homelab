# 🔒 Coolify Server Backup Guide

Complete backup solution for your Coolify server at `192.168.0.10`.

## 🎯 What Gets Backed Up

### ✅ Complete Server Backup Includes:
- **SQLite Database** - All Coolify configurations, projects, applications
- **Docker Volumes** - All application data and persistent volumes  
- **Configuration Files** - .env files, Docker Compose files
- **Traefik/Proxy Config** - SSL certificates, routing configuration
- **System Information** - Server state, Docker info, disk usage
- **API Data** - All API-accessible configurations in JSON format

## 🚀 Quick Start

### Option 1: Automated Full Backup (Recommended)
```bash
# Create and download complete backup
npm run backup-download
```

### Option 2: Manual Process
```bash
# 1. Prepare backup (API data + scripts)
npm run backup

# 2. Follow the generated instructions to run server backup
# 3. Download the backup file manually
```

## 📋 Detailed Instructions

### 1. Automated Backup & Download

The easiest way to backup your entire Coolify server:

```bash
# Full automated process
npm run backup-download

# With custom options
npx ts-node backup-downloader.ts --host 192.168.0.10 --user root --download-dir ./my-backups
```

**What it does:**
1. ✅ Backs up all API-accessible data locally
2. ✅ Generates server backup scripts
3. ✅ Uploads script to your server via SSH
4. ✅ Executes backup on server (Docker volumes, database, configs)
5. ✅ Downloads the complete backup archive
6. ✅ Cleans up temporary files

**Requirements:**
- SSH access to `root@192.168.0.10`
- SSH key or password authentication
- Sufficient disk space on both client and server

### 2. Manual Backup Process

If you prefer step-by-step control:

```bash
# Step 1: Prepare backup locally
npm run backup
```

This creates:
- `coolify-backups/backup-TIMESTAMP/` directory
- API data backup (all projects, apps, databases, services)
- `server-backup.sh` script for server execution
- `restore.sh` script for restoration
- Detailed README with instructions

```bash
# Step 2: Run server backup (follow generated instructions)
scp coolify-backups/backup-*/server-backup.sh root@192.168.0.10:/tmp/
ssh root@192.168.0.10 "bash /tmp/server-backup.sh"

# Step 3: Download the backup
scp root@192.168.0.10:/tmp/coolify-backup-*.tar.gz ./
```

## 🔧 SSH Configuration

### Method 1: SSH Key (Recommended)
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -f ~/.ssh/coolify_backup

# Copy to server
ssh-copy-id -i ~/.ssh/coolify_backup root@192.168.0.10

# Use with backup
npx ts-node backup-downloader.ts --key ~/.ssh/coolify_backup
```

### Method 2: Password Authentication
If you're prompted for a password, that's fine too. The scripts will work with password authentication.

## 📦 What's in the Backup

### Generated Files Structure:
```
coolify-backups/backup-TIMESTAMP/
├── api-data/
│   ├── projects.json              # All projects (4 projects)
│   ├── applications.json          # All applications (4 apps)
│   ├── applications-detailed.json # Detailed app configurations
│   ├── databases.json             # All databases (1 database)
│   ├── services.json              # All services (16 services)
│   └── system-info.json           # System information
├── server-backup.sh               # Server-side backup script
├── restore.sh                     # Restoration script
└── README.md                      # Detailed instructions
```

### Server Backup Archive Contents:
```
coolify-backup-TIMESTAMP.tar.gz
├── coolify.db                     # SQLite database
├── coolify.env                    # Environment configuration
├── docker-volumes.txt             # List of Docker volumes
├── volume-*.tar.gz               # Each Docker volume backup
├── traefik-config.tar.gz         # Proxy configuration
└── system-info.txt               # Server information
```

## 🔄 Restoration

### Full Server Restore:
```bash
# 1. Copy backup to target server
scp coolify-backup-*.tar.gz restore.sh root@<target-server>:/tmp/

# 2. Run restoration
ssh root@<target-server> "bash /tmp/restore.sh /tmp/coolify-backup-*.tar.gz"

# 3. Restart services
ssh root@<target-server> "docker restart coolify coolify-proxy"
```

### Selective Restore:

**Database Only:**
```bash
ssh root@192.168.0.10 "cp /tmp/extracted-backup/coolify.db /data/coolify/coolify.db"
```

**Specific Volume:**
```bash
ssh root@192.168.0.10 "docker run --rm -v VOLUME_NAME:/data -v /tmp:/backup alpine tar xzf /backup/volume-VOLUME_NAME.tar.gz -C /data"
```

## ⚡ Command Reference

### Available Scripts:
```bash
npm run backup              # Prepare backup (API data + scripts)
npm run backup-download     # Full automated backup & download
npm run test-connection     # Test Coolify API connection
```

### Advanced Options:
```bash
# Custom server/user
npx ts-node backup-downloader.ts --host 10.0.0.50 --user admin

# Custom SSH key
npx ts-node backup-downloader.ts --key ~/.ssh/my_key

# Custom download location
npx ts-node backup-downloader.ts --download-dir /path/to/backups

# Help
npx ts-node backup-downloader.ts --help
```

## 🛡️ Security Considerations

### ✅ Best Practices:
- **Use SSH Keys** instead of passwords for automation
- **Secure Backup Storage** - Store backups in encrypted location
- **Regular Testing** - Test restore process periodically
- **Access Control** - Limit SSH access to backup operations only

### 🔐 Backup Contains Sensitive Data:
- Database credentials and API tokens
- SSL certificates and private keys
- Environment variables and secrets
- Application data

**⚠️ Keep backups secure and encrypted!**

## 📊 Monitoring & Scheduling

### Automated Daily Backups (Cron):
```bash
# Add to crontab
0 2 * * * cd /path/to/coolify-homelab && npm run backup-download >> backup.log 2>&1
```

### Backup Verification:
```bash
# Check backup integrity
tar -tzf coolify-backup-*.tar.gz > /dev/null && echo "Backup OK" || echo "Backup corrupted"

# Check backup size
ls -lh coolify-backup-*.tar.gz
```

## ❓ Troubleshooting

### Common Issues:

**SSH Connection Failed:**
```bash
# Test SSH manually
ssh root@192.168.0.10 "echo 'Connection OK'"

# Check SSH key permissions
chmod 600 ~/.ssh/your_key
```

**Backup Script Fails:**
```bash
# Check server disk space
ssh root@192.168.0.10 "df -h"

# Check Docker status
ssh root@192.168.0.10 "docker ps"
```

**Download Timeout:**
```bash
# For large backups, increase timeout or use screen/tmux
ssh root@192.168.0.10 "screen -S backup bash /tmp/server-backup.sh"
```

**Permission Denied:**
```bash
# Ensure backup script is executable
ssh root@192.168.0.10 "chmod +x /tmp/server-backup.sh"
```

## 📞 Support

Your current Coolify setup:
- **Server**: `192.168.0.10:8000`
- **Projects**: 4 (Foodie Map, LowCode workflows, Core Operations, CICD)  
- **Applications**: 4 (including MLflow, LlamaFactory, Foodie Map deployments)
- **Databases**: 1
- **Services**: 16
- **Version**: Coolify 4.0.0-beta.426

Need help? Check the generated README.md in your backup directory for detailed instructions specific to your backup.

## 🎯 Quick Recovery Scenarios

### Disaster Recovery:
1. Fresh server with Docker installed
2. Run: `bash restore.sh coolify-backup-TIMESTAMP.tar.gz`
3. Verify all services are running

### Migrate to New Server:
1. Create backup on old server
2. Transfer backup to new server  
3. Restore on new server
4. Update DNS to point to new server

### Development/Testing:
1. Create backup of production
2. Restore to development server
3. Test changes safely
4. Deploy to production when ready

---

**🎉 Your Coolify server backup solution is ready!**

Run `npm run backup-download` to create your first complete backup! 🚀
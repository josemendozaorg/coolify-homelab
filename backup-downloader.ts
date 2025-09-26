#!/usr/bin/env ts-node

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Coolify Backup Downloader
 * Automated script to execute backup on server and download it
 */

interface DownloaderConfig {
  coolifyHost: string;
  sshUser: string;
  sshKey?: string;
  downloadDir: string;
  timestamp: string;
}

class BackupDownloader {
  private config: DownloaderConfig;

  constructor(options: Partial<DownloaderConfig> = {}) {
    this.config = {
      coolifyHost: options.coolifyHost || '192.168.0.10',
      sshUser: options.sshUser || 'root',
      sshKey: options.sshKey,
      downloadDir: options.downloadDir || path.join(process.cwd(), 'downloads'),
      timestamp: options.timestamp || new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    };
  }

  /**
   * Check SSH connectivity
   */
  async checkSSHConnection(): Promise<boolean> {
    try {
      const sshCommand = this.buildSSHCommand('echo "SSH connection successful"');
      const { stdout } = await execAsync(sshCommand);
      return stdout.includes('SSH connection successful');
    } catch (error) {
      console.error('SSH connection failed:', error);
      return false;
    }
  }

  /**
   * Build SSH command with optional key
   */
  private buildSSHCommand(command: string): string {
    const sshOptions = '-o StrictHostKeyChecking=no -o ConnectTimeout=10';
    const keyOption = this.config.sshKey ? `-i ${this.config.sshKey}` : '';
    return `ssh ${sshOptions} ${keyOption} ${this.config.sshUser}@${this.config.coolifyHost} "${command}"`;
  }

  /**
   * Build SCP command with optional key
   */
  private buildSCPCommand(source: string, destination: string): string {
    const scpOptions = '-o StrictHostKeyChecking=no -o ConnectTimeout=10';
    const keyOption = this.config.sshKey ? `-i ${this.config.sshKey}` : '';
    return `scp ${scpOptions} ${keyOption} ${source} ${destination}`;
  }

  /**
   * Upload backup script to server
   */
  async uploadBackupScript(): Promise<string> {
    const scriptPath = path.join(process.cwd(), 'coolify-backups', `backup-${this.config.timestamp}`, 'server-backup.sh');
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error('Backup script not found. Run the backup tool first to generate it.');
    }

    const remoteScriptPath = `/tmp/server-backup-${this.config.timestamp}.sh`;
    const scpCommand = this.buildSCPCommand(scriptPath, `${this.config.sshUser}@${this.config.coolifyHost}:${remoteScriptPath}`);
    
    console.log('📤 Uploading backup script to server...');
    await execAsync(scpCommand);
    console.log('✅ Backup script uploaded');
    
    return remoteScriptPath;
  }

  /**
   * Execute backup on server
   */
  async executeBackupOnServer(scriptPath: string): Promise<string> {
    console.log('🚀 Executing backup on server...');
    console.log('This may take several minutes...');
    
    const command = `bash ${scriptPath}`;
    const sshCommand = this.buildSSHCommand(command);
    
    try {
      const { stdout, stderr } = await execAsync(sshCommand, { 
        timeout: 600000, // 10 minutes timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      console.log('📋 Server output:');
      console.log(stdout);
      
      if (stderr) {
        console.log('⚠️  Warnings:');
        console.log(stderr);
      }
      
      // Extract backup filename from output
      const backupMatch = stdout.match(/coolify-backup-[\w-]+\.tar\.gz/);
      if (!backupMatch) {
        throw new Error('Could not find backup filename in server output');
      }
      
      return `/tmp/${backupMatch[0]}`;
    } catch (error: any) {
      if (error.killed && error.signal === 'SIGTERM') {
        throw new Error('Backup execution timed out. The server may still be creating the backup.');
      }
      throw error;
    }
  }

  /**
   * Download backup from server
   */
  async downloadBackup(remoteBackupPath: string): Promise<string> {
    // Ensure download directory exists
    if (!fs.existsSync(this.config.downloadDir)) {
      fs.mkdirSync(this.config.downloadDir, { recursive: true });
    }
    
    const filename = path.basename(remoteBackupPath);
    const localPath = path.join(this.config.downloadDir, filename);
    
    console.log(`📥 Downloading backup: ${filename}...`);
    
    // Get file size first
    const sizeCommand = this.buildSSHCommand(`ls -lh ${remoteBackupPath} | awk '{print $5}'`);
    try {
      const { stdout: sizeOutput } = await execAsync(sizeCommand);
      console.log(`📏 Backup size: ${sizeOutput.trim()}`);
    } catch (error) {
      console.log('⚠️  Could not get file size');
    }
    
    const scpCommand = this.buildSCPCommand(
      `${this.config.sshUser}@${this.config.coolifyHost}:${remoteBackupPath}`,
      localPath
    );
    
    await execAsync(scpCommand, { 
      timeout: 1800000, // 30 minutes timeout for download
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });
    
    console.log(`✅ Backup downloaded to: ${localPath}`);
    
    // Verify download
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      console.log(`📦 Downloaded file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
    
    return localPath;
  }

  /**
   * Cleanup remote backup file
   */
  async cleanupRemoteBackup(remoteBackupPath: string): Promise<void> {
    console.log('🧹 Cleaning up remote backup file...');
    const cleanupCommand = this.buildSSHCommand(`rm -f ${remoteBackupPath}`);
    
    try {
      await execAsync(cleanupCommand);
      console.log('✅ Remote backup file cleaned up');
    } catch (error) {
      console.log('⚠️  Could not clean up remote backup file');
    }
  }

  /**
   * Full backup and download process
   */
  async runFullBackup(): Promise<string> {
    console.log('🏠 Coolify Backup Downloader');
    console.log('============================');
    console.log(`🖥️  Server: ${this.config.coolifyHost}`);
    console.log(`👤 User: ${this.config.sshUser}`);
    console.log(`📁 Download to: ${this.config.downloadDir}`);
    console.log('');

    // Check SSH connection
    console.log('🔗 Checking SSH connection...');
    const isConnected = await this.checkSSHConnection();
    if (!isConnected) {
      throw new Error('❌ Cannot connect to server via SSH. Please check your SSH configuration.');
    }
    console.log('✅ SSH connection successful\n');

    // Upload backup script
    const remoteScriptPath = await this.uploadBackupScript();
    
    // Execute backup
    const remoteBackupPath = await this.executeBackupOnServer(remoteScriptPath);
    
    // Download backup
    const localBackupPath = await this.downloadBackup(remoteBackupPath);
    
    // Cleanup
    await this.cleanupRemoteBackup(remoteBackupPath);
    await this.cleanupRemoteBackup(remoteScriptPath);
    
    console.log('\n🎉 Backup process completed successfully!');
    console.log(`📦 Your backup is ready at: ${localBackupPath}`);
    
    return localBackupPath;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const config: Partial<DownloaderConfig> = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--host':
        config.coolifyHost = args[++i];
        break;
      case '--user':
        config.sshUser = args[++i];
        break;
      case '--key':
        config.sshKey = args[++i];
        break;
      case '--download-dir':
        config.downloadDir = args[++i];
        break;
      case '--help':
        console.log(`
Coolify Backup Downloader

Usage: npx ts-node backup-downloader.ts [options]

Options:
  --host <ip>         Coolify server IP (default: 192.168.0.10)
  --user <username>   SSH username (default: root)
  --key <path>        SSH private key path (optional)
  --download-dir <dir> Download directory (default: ./downloads)
  --help              Show this help

Examples:
  npx ts-node backup-downloader.ts
  npx ts-node backup-downloader.ts --host 192.168.0.10 --user admin
  npx ts-node backup-downloader.ts --key ~/.ssh/id_rsa --download-dir ./my-backups
`);
        process.exit(0);
    }
  }
  
  try {
    const downloader = new BackupDownloader(config);
    await downloader.runFullBackup();
  } catch (error: any) {
    console.error('\n❌ Backup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { BackupDownloader };
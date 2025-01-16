import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = "digital-learning-platform-backup";
const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME"; // This will be replaced when running the script
const LOG_FILE = path.join(__dirname, 'backup.log');

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

function executeCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit' });
    log(`Successfully executed: ${command}`);
  } catch (error) {
    const errorMessage = `Error executing command: ${command}\n${error}`;
    log(errorMessage);
    throw new Error(errorMessage);
  }
}

async function setupGitConfig() {
  // Configure git with token-based authentication
  const remoteUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`;

  try {
    // Initialize git if not already initialized
    try {
      executeCommand('git rev-parse --git-dir');
      log('Git repository already initialized');
    } catch {
      executeCommand('git init');
      log('Initialized new git repository');
    }

    // Configure remote
    try {
      executeCommand('git remote remove origin');
      log('Removed existing origin remote');
    } catch {
      log('No existing origin remote to remove');
    }
    executeCommand(`git remote add origin ${remoteUrl}`);
    log('Added new origin remote');

    // Configure git user
    executeCommand('git config user.name "Automated Backup"');
    executeCommand('git config user.email "automated@backup.com"');
    log('Configured git user');
  } catch (error) {
    log(`Error setting up git config: ${error}`);
    throw error;
  }
}

async function performBackup() {
  try {
    // Create .gitignore if it doesn't exist
    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', `
node_modules/
.env
*.log
dist/
`);
      log('Created .gitignore file');
    }

    // Add all files
    executeCommand('git add .');

    // Create commit with timestamp
    const timestamp = new Date().toISOString();
    executeCommand(`git commit -m "Automated backup: ${timestamp}"`);

    // Push to remote
    executeCommand('git push -u origin master --force');

    log('Backup completed successfully!');
  } catch (error) {
    log(`Error performing backup: ${error}`);
    throw error;
  }
}

// Schedule backup to run every hour
async function scheduleBackup() {
  log('Starting scheduled backup...');
  try {
    await setupGitConfig();
    await performBackup();
    log('Scheduled backup completed successfully');
  } catch (error) {
    log(`Scheduled backup failed: ${error}`);
  }

  // Schedule next backup in 1 hour
  setTimeout(scheduleBackup, 60 * 60 * 1000);
}

// Start the backup schedule
log('Initializing automated backup system...');
scheduleBackup().catch(error => {
  log(`Fatal error in backup system: ${error}`);
  process.exit(1);
});
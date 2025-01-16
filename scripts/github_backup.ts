import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = "11plus-success-lms";
const GITHUB_USERNAME = "rahul598"; 
const LOG_FILE = path.join(__dirname, 'backup.log');

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

async function setupGitConfig() {
  const remoteUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`;

  try {
    try {
      execSync('git rev-parse --git-dir');
      log('Git repository already initialized');
    } catch {
      execSync('git init');
      log('Initialized new git repository');
    }

    try {
      execSync('git remote remove origin');
      log('Removed existing origin remote');
    } catch {
      log('No existing origin remote to remove');
    }
    execSync(`git remote add origin ${remoteUrl}`);
    log('Added new origin remote');

    execSync('git config user.name "Automated Backup"');
    execSync('git config user.email "automated@backup.com"');
    log('Configured git user');
  } catch (error) {
    log(`Error setting up git config: ${error}`);
    throw error;
  }
}

async function performBackup() {
  try {
    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', `
node_modules/
.env
*.log
dist/
`);
      log('Created .gitignore file');
    }

    execSync('git add .');

    const timestamp = new Date().toISOString();
    execSync(`git commit -m "Updated project: ${timestamp}"`);

    execSync('git push -u origin main --force');

    log('Backup completed successfully!');
  } catch (error) {
    log(`Error performing backup: ${error}`);
    throw error;
  }
}

log('Starting backup process...');
setupGitConfig()
  .then(() => performBackup())
  .then(() => {
    log('Backup completed successfully');
    process.exit(0);
  })
  .catch(error => {
    log(`Fatal error in backup process: ${error}`);
    process.exit(1);
  });
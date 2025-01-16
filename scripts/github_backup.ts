import { execSync } from 'child_process';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = "digital-learning-platform-backup";
const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME"; // This will be replaced when running the script

function executeCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

async function setupGitConfig() {
  // Configure git with token-based authentication
  const remoteUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`;
  
  try {
    // Initialize git if not already initialized
    try {
      executeCommand('git rev-parse --git-dir');
    } catch {
      executeCommand('git init');
    }

    // Configure remote
    try {
      executeCommand('git remote remove origin');
    } catch {
      // Ignore if remote doesn't exist
    }
    executeCommand(`git remote add origin ${remoteUrl}`);
    
    // Configure git user
    executeCommand('git config user.name "Automated Backup"');
    executeCommand('git config user.email "automated@backup.com"');
  } catch (error) {
    console.error('Error setting up git config:', error);
    process.exit(1);
  }
}

async function performBackup() {
  try {
    // Add all files
    executeCommand('git add .');
    
    // Create commit with timestamp
    const timestamp = new Date().toISOString();
    executeCommand(`git commit -m "Automated backup: ${timestamp}"`);
    
    // Push to remote
    executeCommand('git push -u origin master --force');
    
    console.log('Backup completed successfully!');
  } catch (error) {
    console.error('Error performing backup:', error);
    process.exit(1);
  }
}

async function main() {
  await setupGitConfig();
  await performBackup();
}

main().catch(console.error);

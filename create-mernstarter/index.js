#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { spawn } = require('child_process');

program
  .version('1.0.0')
  .arguments('<project-name>')
  .option('-i, --install', 'Install dependencies')
  .option('-g, --git', 'Initialize git repository')
  .description('Create a new MERN starter project')
  .action((name, options) => {
    createProject(name, options);
  });

program.parse();

async function createProject(name, options) {
  const projectName = name;
  const projectPath = path.resolve(projectName);
  
  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`Directory ${projectName} already exists!`));
    process.exit(1);
  }
  
  console.log(chalk.green(`Creating new MERN project: ${projectName}`));
  
  const spinner = ora('Copying template files...').start();
  
  try {
    // Copy template files (this would be from the current directory in a real scenario)
    // For this example, we'll simulate copying by creating the structure
    
    // Create project directory
    await fs.ensureDir(projectPath);
    
    // Change to project directory
    process.chdir(projectPath);
    
    // Create basic project structure
    await createProjectStructure(projectName);
    
    spinner.succeed('Template files copied!');
    
    // Update package.json with project name
    await updatePackageJson(projectName);
    
    // Create .env file from .env.example
    await createEnvFile();
    
    // Initialize git repo if requested
    if (options.git) {
      await initializeGitRepo();
    }
    
    // Install dependencies if requested
    if (options.install) {
      await installDependencies();
    }
    
    console.log(chalk.green('\n✅ Success! Created'), chalk.bold(projectName), chalk.green('at'), projectPath);
    console.log('\nStart your project:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm run dev'));
    
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function createProjectStructure(projectName) {
  // Create main directories
  await Promise.all([
    fs.ensureDir('backend'),
    fs.ensureDir('frontend')
  ]);
  
  // Create basic backend structure
  await fs.ensureDir('backend/src');
  await fs.ensureDir('backend/src/controllers');
  await fs.ensureDir('backend/src/middleware');
  await fs.ensureDir('backend/src/models');
  await fs.ensureDir('backend/src/routes');
  await fs.ensureDir('backend/src/utils');
  
  // Create basic frontend structure
  await fs.ensureDir('frontend/src');
  await fs.ensureDir('frontend/src/components');
  await fs.ensureDir('frontend/src/context');
  await fs.ensureDir('frontend/src/hooks');
  await fs.ensureDir('frontend/src/pages');
  await fs.ensureDir('frontend/src/services');
  await fs.ensureDir('frontend/src/utils');
  
  // Create placeholder files
  await fs.writeFile('backend/src/app.js', getBackendAppContent());
  await fs.writeFile('frontend/src/App.jsx', getFrontendAppContent());
  await fs.writeFile('README.md', getReadmeContent(projectName));
  await fs.writeFile('.env.example', getEnvExampleContent());
  await fs.writeFile('.gitignore', getGitIgnoreContent());
}

function getBackendAppContent() {
  return `// Backend entry point
console.log('Backend server starting...');
`;
}

function getFrontendAppContent() {
  return `// Frontend entry point
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to Your MERN App</h1>
    </div>
  );
}

export default App;
`;
}

function getReadmeContent(projectName) {
  return `# ${projectName}

This project was bootstrapped with [MERN Boilerplate](https://github.com/your-username/mern-boilerplate).

## Available Scripts

In the project directory, you can run:

### \`npm run dev\`

Runs both the backend and frontend in development mode.
`;
}

function getEnvExampleContent() {
  return `# MongoDB
MONGO_URI=mongodb://localhost:27017/${process.argv[2] || 'mern_app'}

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Client (for CORS)
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
`;
}

function getGitIgnoreContent() {
  return `# Dependencies
node_modules/

# Environment variables
.env

# Logs
logs/
*.log

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/

# OS generated files
.DS_Store
Thumbs.db
`;
}

async function updatePackageJson(projectName) {
  const pkg = {
    name: projectName,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
      "start": "concurrently \"npm start --prefix backend\" \"npm run build && npm start --prefix frontend\"",
      "test": "concurrently \"npm test --prefix backend\" \"npm test --prefix frontend\"",
      "lint": "concurrently \"npm run lint --prefix backend\" \"npm run lint --prefix frontend\"",
      "build": "concurrently \"npm run build --prefix backend\" \"npm run build --prefix frontend\"",
      "clean": "concurrently \"npm run clean --prefix backend\" \"npm run clean --prefix frontend\""
    },
    keywords: [],
    author: '',
    license: 'ISC',
    dependencies: {},
    devDependencies: {
      "concurrently": "^8.2.0"
    }
  };
  
  await fs.writeJSON('package.json', pkg, { spaces: 2 });
}

async function createEnvFile() {
  // In a real implementation, this would copy .env.example to .env
  // For now, we'll just create a basic .env file
  const envContent = `# MongoDB
MONGO_URI=mongodb://localhost:27017/${process.argv[2] || 'mern_app'}

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Client (for CORS)
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
`;
  
  await fs.writeFile('.env', envContent);
}

async function initializeGitRepo() {
  const spinner = ora('Initializing git repository...').start();
  
  try {
    await execCommand('git init');
    await execCommand('git add .');
    await execCommand('git commit -m "Initial commit from MERN Boilerplate"');
    spinner.succeed('Git repository initialized!');
  } catch (error) {
    spinner.fail('Failed to initialize git repository');
  }
}

async function installDependencies() {
  const spinner = ora('Installing dependencies...').start();
  
  try {
    await execCommand('npm install');
    spinner.succeed('Dependencies installed!');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { stdio: 'ignore', shell: true });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}
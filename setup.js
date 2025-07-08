#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 GitLab MCP Server Setup');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const examplePath = path.join(__dirname, '.env.example');
  fs.copyFileSync(examplePath, envPath);
  console.log('✅ Created .env file\n');
  
  console.log('🔑 Please edit .env and add your GitLab token:');
  console.log('   GITLAB_TOKEN=your_gitlab_token_here\n');
  
  console.log('💡 Get your token at:');
  console.log('   GitLab.com: https://gitlab.com/-/profile/personal_access_tokens');
  console.log('   Self-hosted: YOUR_GITLAB_URL/-/profile/personal_access_tokens\n');
  
  console.log('📋 Required scopes: read_api, read_repository\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if built
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('🔨 Building the server...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Server is already built\n');
}

console.log('🎯 Next steps:');
console.log('1. Edit .env with your GitLab token');
console.log('2. Run: npm start');
console.log('3. Configure your MCP client to use this server\n');

console.log('📖 See README.md for detailed setup instructions');
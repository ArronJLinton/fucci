#!/usr/bin/env node

/**
 * Development automation script
 * Usage: node scripts/dev.js [command]
 * 
 * Commands:
 * - setup: Initial project setup
 * - start: Start development server
 * - build: Build for production
 * - deploy: Deploy to staging/production
 * - check: Run type checking and linting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  setup: () => {
    console.log('🚀 Setting up development environment...');
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('yarn install', { stdio: 'inherit' });
    
    // Set development environment
    console.log('🔧 Setting development environment...');
    execSync('yarn env:dev', { stdio: 'inherit' });
    
    // Run type check
    console.log('🔍 Running type check...');
    try {
      execSync('yarn type-check', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Type check found issues, but continuing...');
    }
    
    console.log('✅ Setup complete! Run "yarn dev" to start development.');
  },

  start: () => {
    console.log('🚀 Starting development server...');
    execSync('yarn dev', { stdio: 'inherit' });
  },

  build: () => {
    const platform = process.argv[3] || 'android';
    console.log(`🏗️  Building for ${platform}...`);
    
    // Set production environment
    execSync('yarn env:prod', { stdio: 'inherit' });
    
    // Build
    execSync(`yarn build:${platform}`, { stdio: 'inherit' });
    
    console.log(`✅ Build complete for ${platform}!`);
  },

  deploy: () => {
    const environment = process.argv[3] || 'staging';
    console.log(`🚀 Deploying to ${environment}...`);
    
    // Set environment
    execSync(`yarn env:${environment}`, { stdio: 'inherit' });
    
    // Run type check
    console.log('🔍 Running type check...');
    try {
      execSync('yarn type-check', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Type check failed. Please fix errors before deploying.');
      process.exit(1);
    }
    
    console.log(`✅ Ready to deploy to ${environment}!`);
    console.log('Run "expo publish" or "expo build" to complete deployment.');
  },

  check: () => {
    console.log('🔍 Running development checks...');
    
    // Type check
    console.log('📝 Type checking...');
    try {
      execSync('yarn type-check', { stdio: 'inherit' });
      console.log('✅ Type check passed!');
    } catch (error) {
      console.log('❌ Type check failed!');
      process.exit(1);
    }
    
    console.log('✅ All checks passed!');
  }
};

const command = process.argv[2] || 'start';

if (!commands[command]) {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Available commands:', Object.keys(commands).join(', '));
  process.exit(1);
}

commands[command]();

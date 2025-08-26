#!/usr/bin/env node

// Simple wrapper to handle import.meta.dirname issue in production
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Ensure we're in the correct directory
const currentDir = process.cwd();
console.log('Starting server from:', currentDir);

// Check if dist directory exists
const distPath = resolve(currentDir, 'dist');
const publicPath = resolve(distPath, 'public');

console.log('Dist path:', distPath);
console.log('Public path exists:', existsSync(publicPath));

// Set working directory to where the dist folder is
if (existsSync(distPath)) {
  process.chdir(currentDir);
  
  // Import the actual server
  import('./dist/index.js').catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
} else {
  console.error('Build directory not found at:', distPath);
  process.exit(1);
}
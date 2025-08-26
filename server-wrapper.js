#!/usr/bin/env node

// Production server wrapper that handles path resolution correctly
import { existsSync } from 'fs';
import { resolve } from 'path';

console.log('Starting production server...');
console.log('Current working directory:', process.cwd());

// Check if the expected directories exist
const distDir = resolve(process.cwd(), 'dist');
const publicDir = resolve(process.cwd(), 'dist', 'public');

console.log('Dist directory exists:', existsSync(distDir));
console.log('Public directory exists:', existsSync(publicDir));
console.log('Public directory path:', publicDir);

if (!existsSync(publicDir)) {
  console.error('❌ Build directory not found. Run npm run build first.');
  process.exit(1);
}

// Import and run the server
try {
  await import('./dist/index.js');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
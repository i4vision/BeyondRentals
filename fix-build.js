#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Fixing import.meta.dirname in built files...');

// Read the built server file
const buildFile = 'dist/index.js';
let content = readFileSync(buildFile, 'utf8');

// First replace all import.meta.dirname with process.cwd()
content = content.replace(/import\.meta\.dirname/g, 'process.cwd()');

// Then fix the specific serveStatic path issue
// Look for any path resolution that points to just "public" and change it to "dist/public"
content = content.replace(
  /path2\.resolve\(process\.cwd\(\), "public"\)/g,
  'path2.resolve(process.cwd(), "dist", "public")'
);

// Also handle the original viteconfig pattern
content = content.replace(
  /path\.resolve\(process\.cwd\(\), "dist\/public"\)/g,
  'path.resolve(process.cwd(), "dist", "public")'
);

// Write the fixed content back
writeFileSync(buildFile, content);

// Verify the fix worked
const fixedContent = readFileSync(buildFile, 'utf8');
const hasCorrectPath = fixedContent.includes('path2.resolve(process.cwd(), "dist", "public")');
console.log('✅ Path fix verified:', hasCorrectPath ? 'SUCCESS' : 'FAILED');

console.log('✅ Fixed import.meta.dirname references in built files');
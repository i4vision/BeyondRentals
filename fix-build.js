#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Fixing import.meta.dirname in built files...');

// Read the built server file
const buildFile = 'dist/index.js';
let content = readFileSync(buildFile, 'utf8');

// Replace specific path patterns for different contexts
// For the serveStatic function, we need to point to dist directory
content = content.replace(
  /path2\.resolve\(process\.cwd\(\), "public"\)/g,
  'path2.resolve(process.cwd(), "dist", "public")'
);

// Replace remaining import.meta.dirname with appropriate paths
content = content.replace(/import\.meta\.dirname/g, 'process.cwd()');

// Write the fixed content back
writeFileSync(buildFile, content);

console.log('✅ Fixed import.meta.dirname references in built files');
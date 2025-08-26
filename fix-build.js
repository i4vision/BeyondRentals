#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Fixing import.meta.dirname in built files...');

// Read the built server file
const buildFile = 'dist/index.js';
let content = readFileSync(buildFile, 'utf8');

// Replace all instances of import.meta.dirname with process.cwd()
// This works because in production, the app runs from the project root
content = content.replace(/import\.meta\.dirname/g, 'process.cwd()');

// Write the fixed content back
writeFileSync(buildFile, content);

console.log('✅ Fixed import.meta.dirname references in built files');
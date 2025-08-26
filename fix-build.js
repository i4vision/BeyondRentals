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

// Fix vite imports that shouldn't be in production
// Remove vite imports and replace them with dummy functions
content = content.replace(
  /import { createServer as createViteServer, createLogger } from "vite";/g,
  '// Vite imports removed for production'
);

content = content.replace(
  /import { defineConfig } from "vite";/g,
  '// defineConfig import removed for production'
);

content = content.replace(
  /import react from "@vitejs\/plugin-react";/g,
  '// React plugin import removed for production'
);

content = content.replace(
  /import runtimeErrorOverlay from "@replit\/vite-plugin-runtime-error-modal";/g,
  '// Runtime error overlay import removed for production'
);

// Replace vite functions with dummy implementations
content = content.replace(
  /var viteLogger = createLogger\(\);/g,
  'var viteLogger = { error: () => {} };'
);

// Replace the entire vite config section that's causing issues
// Find the defineConfig block and replace it with a simple object
content = content.replace(
  /var vite_config_default = defineConfig\(\{[\s\S]*?\n\}\);/g,
  'var vite_config_default = {};'
);

// Also handle any remaining defineConfig references
content = content.replace(/defineConfig/g, 'function(){}');

// Replace react() and runtimeErrorOverlay() function calls
content = content.replace(/react\(\)/g, 'null');
content = content.replace(/runtimeErrorOverlay\(\)/g, 'null');

// Replace createViteServer calls (only used in development anyway)
content = content.replace(/createViteServer/g, 'function(){}');

// Write the fixed content back
writeFileSync(buildFile, content);

// Verify the fix worked
const fixedContent = readFileSync(buildFile, 'utf8');
const hasCorrectPath = fixedContent.includes('path2.resolve(process.cwd(), "dist", "public")');
const noViteImports = !fixedContent.includes('from "vite"');
console.log('✅ Path fix verified:', hasCorrectPath ? 'SUCCESS' : 'FAILED');
console.log('✅ Vite imports removed:', noViteImports ? 'SUCCESS' : 'FAILED');

console.log('✅ Fixed import.meta.dirname references in built files');
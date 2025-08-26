#!/bin/bash

echo "Building application..."
npm run build

echo "Fixing import.meta.dirname issues..."
node fix-build.js

echo "✅ Build complete and fixed!"
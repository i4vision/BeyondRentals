#!/bin/bash

echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "🔧 Applying production fixes..."
    node fix-build.js
    echo "✅ Build complete and ready for production!"
else
    echo "❌ Build failed!"
    exit 1
fi
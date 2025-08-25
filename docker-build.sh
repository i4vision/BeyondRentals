#!/bin/bash

# Docker build script for check-in application

echo "Building check-in application Docker image..."

# Remove any existing build artifacts
echo "Cleaning up previous builds..."
rm -rf dist/

# Build the Docker image
echo "Building Docker image..."
docker build -t checkin-app:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker build completed successfully!"
    echo "Run with: docker-compose up"
else
    echo "❌ Docker build failed!"
    exit 1
fi
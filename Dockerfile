# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV VITE_NODE_ENV=production

# Build the application and fix import.meta.dirname issues
# Debug the build process and handle errors gracefully
RUN echo "Starting build process..." && \
    npm run build && \
    echo "Build completed, applying fixes..." && \
    node fix-build.js && \
    echo "All fixes applied successfully"

# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/fix-build.js ./fix-build.js

# Create uploads directory for file storage
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check using curl (more reliable than wget in Alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application 
CMD ["node", "dist/index.js"]
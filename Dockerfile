# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Install build dependencies for Alpine
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Set npm configuration for better VPS compatibility
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV npm_config_cache=/tmp/.npm
ENV npm_config_prefer-offline=true

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies with verbose output
RUN npm cache clean --force && \
    npm install --verbose --no-audit --no-fund

# Copy source code
COPY . .

# Build the application with error handling
RUN npm run build || (echo "Build failed, checking for errors..." && exit 1)

# Production stage
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx cache directory and set permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

# Expose port 80
EXPOSE 80

# Health check using curl (more reliable than wget on Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

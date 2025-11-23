#!/bin/bash

# PolyMathOS Deployment Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting PolyMathOS Deployment...${NC}"

# 1. Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# 2. Pull latest changes
echo -e "${GREEN}Pulling latest changes from git...${NC}"
git pull origin main

# 3. Stop existing containers
echo -e "${GREEN}Stopping existing containers...${NC}"
docker compose down --remove-orphans || docker-compose down --remove-orphans

# 4. Build and start containers
echo -e "${GREEN}Building and starting new containers...${NC}"
# Try 'docker compose' (V2) first, fall back to 'docker-compose' (V1)
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# 5. Show status
echo -e "${GREEN}Deployment Complete! Checking status...${NC}"
sleep 5
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo -e "${GREEN}PolyMathOS is running!${NC}"
echo -e "Open your browser to your VPS IP address to complete setup."


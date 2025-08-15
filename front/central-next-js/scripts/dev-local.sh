#!/bin/bash

# Development script for central-next-js frontend (local)
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting local development server${NC}"

# Verify project files
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}⚠️  package.json not found. Running from scripts directory.${NC}"
  cd ..
fi

# Set development environment variables
echo -e "${YELLOW}🔧 Setting development environment variables...${NC}"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:3050"
export NEXT_PUBLIC_APP_NAME="Rupü (Dev)"
export NEXT_PUBLIC_APP_VERSION="0.1.0"
export NODE_ENV="development"

echo -e "${GREEN}✅ Environment configured for local development${NC}"
echo -e "${GREEN}🌐 Backend API: ${NEXT_PUBLIC_API_BASE_URL}${NC}"
echo -e "${GREEN}🚀 Starting Next.js development server...${NC}"

# Start development server
npm run dev 
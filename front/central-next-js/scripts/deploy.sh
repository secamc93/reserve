#!/bin/bash

# Deployment script for central-next-js frontend
set -e

IMAGE_NAME="central-next-frontend"
ECR_REPO="public.ecr.aws/d3a6d4r1/cam/reserve"
TAG="frontend-latest"
DOCKERFILE_PATH="Dockerfile"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting deployment of central-next-js frontend${NC}"

# Verify project files
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ package.json not found. Run from project root.${NC}"
  exit 1
fi

# Verify Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  exit 1
fi

# Verify AWS CLI
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo -e "${RED}❌ AWS CLI not configured${NC}"
  exit 1
fi

echo -e "${YELLOW}⏬ Pulling existing image for cache (if available)...${NC}"
docker pull ${ECR_REPO}:${TAG} || true

echo -e "${YELLOW}🔨 Building image for ARM64...${NC}"
docker buildx build \
  --platform linux/arm64 \
  --cache-from ${ECR_REPO}:${TAG} \
  -f ${DOCKERFILE_PATH} \
  -t ${IMAGE_NAME}:${TAG} \
  --load \
  .

echo -e "${YELLOW}🏷️ Tagging image...${NC}"
docker tag ${IMAGE_NAME}:${TAG} ${ECR_REPO}:${TAG}

echo -e "${YELLOW}🔐 Logging into public ECR...${NC}"
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

echo -e "${YELLOW}⬆️ Pushing image to ECR...${NC}"
docker push ${ECR_REPO}:${TAG}

echo -e "${GREEN}✅ Image pushed to ${ECR_REPO}:${TAG}${NC}"

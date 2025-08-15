# Multi-stage build for Next.js (ARM64)
FROM --platform=linux/arm64 node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM --platform=linux/arm64 node:18-alpine AS runner
WORKDIR /app

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION
ARG NODE_ENV

# Set environment variables
ENV NODE_ENV=${NODE_ENV:-production}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-https://www.xn--rup-joa.com/api}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME:-Rupü}
ENV NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION:-1.0.0}

# Copy built assets and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port and run
EXPOSE 3000
CMD ["npm", "start"]

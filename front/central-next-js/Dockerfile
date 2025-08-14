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
ENV NODE_ENV=production

# Copy built assets and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port and run
EXPOSE 3000
CMD ["npm", "start"]

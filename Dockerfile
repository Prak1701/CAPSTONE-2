# Multi-stage build for frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install || npm install

# Copy source code
COPY . .

# Build both client and server
RUN pnpm build || npm run build

# Production stage
FROM node:18-alpine AS runtime

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy built files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

# Expose port
EXPOSE 8081

# Start the production server
CMD ["node", "dist/server/node-build.mjs"]

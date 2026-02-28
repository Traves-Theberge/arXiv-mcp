# Use Node.js 22 Alpine as the base image for a small footprint
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including devDependencies for tsc
RUN npm install

# Copy source code
COPY src/ ./src/

# Build the TypeScript project
RUN npm run build

# Use a lighter runtime image
FROM node:22-alpine

WORKDIR /app

# Only copy over the built files, package.json, and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/build ./build

# The MCP server communicates over stdio
# Setting the command to start the server
ENTRYPOINT ["node", "build/index.js"]

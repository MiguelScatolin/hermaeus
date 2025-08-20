FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including TypeScript for building)
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy application code
COPY src/ ./src/

# Build the TypeScript application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose the correct port (8080, not 3000)
EXPOSE 8080

# Health check using the existing /ping endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/ping', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
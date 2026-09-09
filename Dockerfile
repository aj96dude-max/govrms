FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev (needed if there are build steps, otherwise just install all)
RUN npm install

# Copy application source code
COPY . .

# In a full-stack project you'd build here, but for Express API we just move to prod stage

# Production Stage
FROM node:20-alpine AS production

# Set Node Env to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage (only necessary files)
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/models ./models
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/routes ./routes

# Change ownership to the non-root 'node' user
RUN chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose API port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]

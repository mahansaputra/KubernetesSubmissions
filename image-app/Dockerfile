FROM node:18-alpine

WORKDIR /app

# Install node-fetch for making HTTP requests
COPY package*.json ./
RUN npm install

# Copy application code
COPY app.js ./

# Create cache directory with appropriate permissions
RUN mkdir -p cache && chmod 777 cache

EXPOSE 8080

# Healthcheck to verify the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["node", "app.js"]
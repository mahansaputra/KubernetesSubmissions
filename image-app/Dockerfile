FROM node:18-alpine

WORKDIR /app

# Install node-fetch for making HTTP requests
COPY package*.json ./
RUN npm install

# Copy application code
COPY app.js ./

# Create cache directory with appropriate permissions
RUN mkdir -p cache && chmod 777 cache

EXPOSE 3000

CMD ["node", "app.js"]
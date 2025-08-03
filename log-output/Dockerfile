FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY writer.js .
COPY reader.js .
CMD ["npm", "start:reader"]
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY app.js ./

RUN mkdir -p cache && chmod 777 cache

EXPOSE 8080

CMD ["node", "app.js"]
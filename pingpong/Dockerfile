FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install pg
RUN npm install 

COPY . .

EXPOSE 80

CMD ["node", "pingpong.js"]
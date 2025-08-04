const http = require('http');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const logOutputPort = 80;
const pingPongUrl = 'http://pingpong-service:80/pingpong';

let currentUuid = uuidv4();

// Update UUID every 5 seconds
setInterval(() => {
    currentUuid = uuidv4();
}, 5000);

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        try {
            const response = await axios.get(pingPongUrl);
            const pongs = response.data.pongs;
            const timestamp = new Date().toISOString();
            const fileContent = fs.readFileSync('/app/config/information.txt', 'utf8');
            const envMessage = process.env.MESSAGE || 'default message';
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`file content: ${fileContent}\nenv message: ${envMessage}\n${timestamp}: ${currentUuid}.\nPing / Pongs: ${pongs}`);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error fetching data');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(logOutputPort, () => {
    console.log(`Log output app listening on port ${logOutputPort}`);
});
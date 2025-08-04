const http = require('http');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const logOutputPort = 80;
const pingPongUrl = 'http://pingpong-service:80/pingpong';

let currentUuid = uuidv4(); // Initial UUID

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
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`${timestamp}: ${currentUuid}.\nPing / Pongs: ${pongs}`);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error fetching pongs');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(logOutputPort, () => {
    console.log(`Log output app listening on port ${logOutputPort}`);
});
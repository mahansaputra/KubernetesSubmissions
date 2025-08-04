const http = require('http');
const axios = require('axios');

const logOutputPort = 80;
const pingPongUrl = 'http://pingpong-service:80/pingpong';

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        try {
            const response = await axios.get(pingPongUrl);
            const pongs = response.data.pongs;
            const timestamp = new Date().toISOString();
            const uuid = '8523ecb1-c716-4cb6-a044-b9e83bb98e43';
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`${timestamp}: ${uuid}.\nPing / Pongs: ${pongs}`);
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
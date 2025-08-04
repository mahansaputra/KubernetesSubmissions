const http = require('http');

let pongs = 0;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/pingpong') {
        pongs += 1;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ pongs }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 80;
server.listen(port, () => {
    console.log(`Ping pong app listening on port ${port}`);
});
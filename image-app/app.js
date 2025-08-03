const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;
const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const GRACE_PERIOD = CACHE_DURATION; // Additional 10 minutes grace period

async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating cache directory:', error);
    }
}

async function getCachedImage() {
    const cacheFiles = await fs.readdir(CACHE_DIR);
    if (cacheFiles.length > 0) {
        const stats = await fs.stat(path.join(CACHE_DIR, cacheFiles[0]));
        const age = Date.now() - stats.mtimeMs;
        if (age < CACHE_DURATION + GRACE_PERIOD) {
            return path.join(CACHE_DIR, cacheFiles[0]);
        }
    }
    return null;
}

async function fetchNewImage() {
    const response = await fetch('https://picsum.photos/1200');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `image_${Date.now()}.jpg`;
    const filePath = path.join(CACHE_DIR, filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
}

const server = http.createServer(async (req, res) => {
    await ensureCacheDir();

    if (req.url === '/image') {
        let imagePath = await getCachedImage();
        if (!imagePath) {
            imagePath = await fetchNewImage();
            setTimeout(() => fs.unlink(imagePath).catch(console.error), CACHE_DURATION + GRACE_PERIOD);
        }
        const imageStream = await fs.readFile(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(imageStream);
        return;
    }

    let imagePath = await getCachedImage();
    if (!imagePath) {
        imagePath = await fetchNewImage();
        setTimeout(() => fs.unlink(imagePath).catch(console.error), CACHE_DURATION + GRACE_PERIOD);
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><title>The project App</title></head>
    <body style="text-align: center; font-family: Arial, sans-serif;">
      <h1>The project App</h1>
      <img src="/image" alt="Random Image" style="max-width: 50%; height: auto;">
      <div>
        <input type="text" id="todoInput" maxlength="140" placeholder="Create todo" style="width: 300px; padding: 5px;">
        <button id="sendButton">Send</button>
      </div>
      <ul id="todoList" style="list-style-type: none; padding: 0; text-align: left; display: inline-block;">
        <li>Create todo</li>
        <li>Learn JavaScript</li>
        <li>Learn React</li>
        <li>Build a project</li>
      </ul>
      <footer><p>DevOps with Kubernetes 2025</p></footer>
    </body>
    </html>
  `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

// Test container shutdown by logging state
process.on('SIGTERM', () => {
    console.log('Container shutting down, cache preserved');
    process.exit(0);
});

setInterval(async () => {
    const imagePath = await getCachedImage();
    if (!imagePath) await fetchNewImage();
}, 60 * 60 * 1000); // Refresh hourly

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
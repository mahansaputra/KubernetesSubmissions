const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;
const CACHE_DIR = path.join(__dirname, 'cache');
const PUBLIC_DIR = path.join(__dirname, 'public');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const GRACE_PERIOD = CACHE_DURATION; // Additional 10 minutes grace period

async function ensureDirectories() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.mkdir(PUBLIC_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating directories:', error);
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

async function serveStaticFile(req, res) {
    const filePath = path.join(PUBLIC_DIR, req.url);
    try {
        const data = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        const contentType = {
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.ico': 'image/x-icon'
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function serveImage(res) {
    let imagePath = await getCachedImage();
    if (!imagePath) {
        imagePath = await fetchNewImage();
        setTimeout(
            () => fs.unlink(imagePath).catch(console.error), 
            CACHE_DURATION + GRACE_PERIOD
        );
    }
    const imageStream = await fs.readFile(imagePath);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(imageStream);
}

async function serveHomePage(res) {
    try {
        const templatePath = path.join(TEMPLATES_DIR, 'index.html');
        const html = await fs.readFile(templatePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (error) {
        console.error('Error serving home page:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

const server = http.createServer(async (req, res) => {
    await ensureDirectories();

    // Serve static files
    if (req.url.match(/\.(css|js|png|jpg|ico)$/)) {
        const served = await serveStaticFile(req, res);
        if (served) return;
    }

    // Serve image
    if (req.url === '/image') {
        await serveImage(res);
        return;
    }

    // Serve home page
    await serveHomePage(res);
});

// Test container shutdown by logging state
process.on('SIGTERM', () => {
    console.log('Container shutting down, cache preserved');
    process.exit(0);
});

// Refresh image cache hourly
setInterval(async () => {
    const imagePath = await getCachedImage();
    if (!imagePath) await fetchNewImage();
}, 60 * 60 * 1000);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
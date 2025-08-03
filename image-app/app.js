const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 8080;
const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const GRACE_PERIOD = 10 * 60 * 1000; // Additional 10 minutes grace period

async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
        console.log(`Cache directory ensured at ${CACHE_DIR}`);
    } catch (error) {
        console.error('Error creating cache directory:', error);
    }
}

async function cleanupOldImages() {
    try {
        const cacheFiles = await fs.readdir(CACHE_DIR);
        const currentImage = await getCurrentImageInfo();

        // Keep the current image, remove others
        for (const file of cacheFiles) {
            const filePath = path.join(CACHE_DIR, file);
            if (!currentImage || filePath !== currentImage.path) {
                console.log(`Removing old cached image: ${file}`);
                await fs.unlink(filePath).catch(err => console.error(`Failed to delete ${file}:`, err));
            }
        }
    } catch (error) {
        console.error('Error cleaning up old images:', error);
    }
}

async function getCurrentImageInfo() {
    try {
        // Read the image metadata if it exists
        const metadataPath = path.join(CACHE_DIR, 'metadata.json');
        let metadata = null;

        try {
            const data = await fs.readFile(metadataPath, 'utf8');
            metadata = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') console.error('Error reading metadata:', err);
            return null;
        }

        // Check if the image file exists
        const imagePath = path.join(CACHE_DIR, metadata.filename);
        try {
            await fs.access(imagePath);
        } catch (err) {
            console.log('Image file does not exist anymore, metadata is stale');
            return null;
        }

        // Check if the image is expired
        const now = Date.now();
        const imageAge = now - metadata.timestamp;

        // Image has not expired yet
        if (imageAge < CACHE_DURATION) {
            console.log(`Current image is ${Math.round(imageAge/1000/60)} minutes old (not expired)`);
            return {
                path: imagePath,
                metadata,
                expired: false
            };
        }

        // Image is in grace period
        if (imageAge < CACHE_DURATION + GRACE_PERIOD) {
            console.log(`Current image is in grace period (${Math.round(imageAge/1000/60)} minutes old)`);
            return {
                path: imagePath,
                metadata,
                expired: true
            };
        }

        // Image is too old
        console.log(`Current image is too old (${Math.round(imageAge/1000/60)} minutes old)`);
        return null;

    } catch (error) {
        console.error('Error getting current image info:', error);
        return null;
    }
}

async function fetchNewImage() {
    console.log('Fetching new image from Lorem Picsum...');
    try {
        // Clean up old images first
        await cleanupOldImages();

        // Fetch new image
        const response = await fetch('https://picsum.photos/1200');
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const timestamp = Date.now();
        const filename = `image_${timestamp}.jpg`;
        const filePath = path.join(CACHE_DIR, filename);

        // Save the image
        await fs.writeFile(filePath, buffer);
        console.log(`New image saved to ${filePath}`);

        // Save metadata
        const metadata = {
            filename,
            timestamp,
            expiresAt: timestamp + CACHE_DURATION,
            graceEndsAt: timestamp + CACHE_DURATION + GRACE_PERIOD
        };

        await fs.writeFile(
            path.join(CACHE_DIR, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        console.log('Image metadata saved');
        return filePath;
    } catch (error) {
        console.error('Error fetching new image:', error);
        throw error;
    }
}

async function getImage() {
    await ensureCacheDir();

    // Get the current image information
    const currentImage = await getCurrentImageInfo();

    // If there's a valid image that is not expired or in grace period, return it
    if (currentImage && !currentImage.expired) {
        return currentImage.path;
    }

    // If there's an expired image in grace period, give it one more time
    // but schedule a new image fetch for next time
    if (currentImage && currentImage.expired) {
        // Schedule a fetch for next request (don't await)
        setTimeout(() => {
            fetchNewImage().catch(console.error);
        }, 0);
        return currentImage.path;
    }

    // No valid image, fetch a new one
    return await fetchNewImage();
}

// Handle HTTP requests
const server = http.createServer(async (req, res) => {
    try {
        // Serve HTML page
        if (req.url === '/' || req.url === '') {
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Random Image App</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            text-align: center;
                            background-color: #f5f5f5;
                        }
                        h1 {
                            color: #333;
                        }
                        .container {
                            max-width: 1200px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 4px;
                            margin: 20px 0;
                        }
                        .timestamp {
                            color: #666;
                            font-size: 0.9em;
                        }
                        footer {
                            margin-top: 30px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Random Image App</h1>
                        <p>Images are cached for 10 minutes with a 10-minute grace period</p>
                        <div>
                            <img src="/image" alt="Random Image">
                        </div>
                        <p class="timestamp">Current time: ${new Date().toISOString()}</p>
                        <button onclick="window.location.reload()">Refresh</button>
                    </div>
                    <footer>
                        <p>DevOps with Kubernetes 2025</p>
                    </footer>
                </body>
                </html>
            `;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
            return;
        }

        // Serve the image
        if (req.url === '/image') {
            const imagePath = await getImage();
            const imageData = await fs.readFile(imagePath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(imageData);
            return;
        }

        // Handle 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');

    } catch (error) {
        console.error('Request handler error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Container shutting down, cache preserved in volume');
    process.exit(0);
});

// Schedule hourly refreshes of the image
setInterval(async () => {
    console.log('Hourly image refresh check');
    try {
        const currentImage = await getCurrentImageInfo();
        if (!currentImage || currentImage.expired) {
            console.log('Fetching new image for hourly refresh');
            await fetchNewImage();
        } else {
            console.log('Current image still valid, no refresh needed');
        }
    } catch (error) {
        console.error('Error in hourly refresh:', error);
    }
}, 60 * 60 * 1000); // Refresh hourly

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Cache directory: ${CACHE_DIR}`);
});

// Initialize by checking for existing image or fetching new one
(async () => {
    try {
        await ensureCacheDir();
        const currentImage = await getCurrentImageInfo();
        if (!currentImage) {
            console.log('No valid cached image found on startup, fetching new image');
            await fetchNewImage();
        } else {
            console.log(`Found existing image on startup: ${path.basename(currentImage.path)}`);
            if (currentImage.expired) {
                console.log('Existing image is expired but in grace period, will fetch new on next request');
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
})();
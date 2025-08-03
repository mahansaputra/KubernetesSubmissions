const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const path = '/shared/data.txt';

async function writeToFile() {
    const uuid = uuidv4();
    const timestamp = new Date().toISOString();
    const content = `${uuid} - ${timestamp}\n`;

    try {
        await fs.appendFile(path, content);
        console.log(`Wrote to file: ${content.trim()}`);
    } catch (err) {
        console.error('Error writing to file:', err);
    }
}

async function main() {
    // Create file if it doesn't exist
    try {
        await fs.access(path);
    } catch {
        await fs.writeFile(path, '');
    }

    // Write immediately on startup
    await writeToFile();

    // Write every 5 seconds
    setInterval(writeToFile, 5000);
}

main().catch(console.error);
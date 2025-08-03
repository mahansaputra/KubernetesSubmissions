const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const path = '/app/shared/data.txt';

async function writeToFile() {
    const uuid = uuidv4();
    // Store only the UUID as needed for the expected output format
    const content = `${uuid}`;

    try {
        await fs.writeFile(path, content);
        console.log(`Wrote to file: ${content.trim()}`);
    } catch (err) {
        console.error('Error writing to file:', err);
    }
}

async function main() {
    // Create directory if it doesn't exist
    try {
        await fs.mkdir('/app/shared', { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }

    // Write immediately on startup
    await writeToFile();

    // Write every 5 seconds
    setInterval(writeToFile, 5000);
}

main().catch(console.error);
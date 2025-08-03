const express = require('express');
const fs = require('fs').promises;
const logPath = '/app/shared/data.txt';
const counterPath = '/app/data/counter.txt';
const app = express();

app.get('/', async (req, res) => {
    try {
        // Read the timestamp and UUID from log file
        let logContent = '';
        try {
            logContent = await fs.readFile(logPath, 'utf8');
        } catch (err) {
            console.error('Error reading log file:', err);
            logContent = 'No logs yet';
        }

        // Parse the latest log entry (first line)
        const logLines = logContent.trim().split('\n');
        const latestLog = logLines.length > 0 ? logLines[logLines.length - 1] : '';

        // Read the ping pong counter
        let pingPongCount = 0;
        try {
            const counterContent = await fs.readFile(counterPath, 'utf8');
            pingPongCount = parseInt(counterContent.trim(), 10) || 0;
        } catch (err) {
            console.error('Error reading counter file:', err);
        }

        // Format response with proper line breaks
        // Ensure the timestamp, UUID and ping/pong count are formatted correctly
        const timestamp = new Date().toISOString();
        const responseContent = `${timestamp}: ${latestLog}.\nPing / Pongs: ${pingPongCount}`;

        res.send(responseContent);
    } catch (err) {
        console.error('Error generating response:', err);
        res.status(500).send('Error generating response');
    }
});

app.listen(3000, () => {
    console.log('Log reader app listening on port 3000');
});
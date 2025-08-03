const express = require('express');
const fs = require('fs').promises;
const path = '/shared/data.txt';
const app = express();

app.get('/logs', async (req, res) => {
    try {
        const content = await fs.readFile(path, 'utf8');
        res.send(content || 'No logs yet');
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Error reading logs');
    }
});

app.listen(3000, () => {
    console.log('Log reader app listening on port 3000');
});
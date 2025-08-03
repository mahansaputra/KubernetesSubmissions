const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
let counter = 0;

const counterFilePath = '/app/data/counter.txt';

// Initialize counter from file if it exists
async function initCounter() {
  try {
    const data = await fs.readFile(counterFilePath, 'utf8');
    counter = parseInt(data.trim(), 10) || 0;
    console.log(`Initialized counter to ${counter} from file`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading counter file:', err);
    }
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(path.dirname(counterFilePath), { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
  }
}

async function updateCounter() {
  try {
    await fs.writeFile(counterFilePath, counter.toString());
  } catch (err) {
    console.error('Error writing counter to file:', err);
  }
}

app.get('/pingpong', async (req, res) => {
  res.send(`pong ${counter}`);
  counter++;
  await updateCounter();
});

initCounter().then(() => {
  app.listen(3000, () => {
    console.log('Ping-pong app listening on port 3000');
  });
});
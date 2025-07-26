const { randomUUID } = require('crypto');

// Generate and store the UUID once on startup
const storedUUID = randomUUID();

const outputUUID = () => {
  // Get current timestamp in ISO format
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${storedUUID}`);
  
  // Schedule next output
  setTimeout(outputUUID, 5000);
};

// Start the process
outputUUID();
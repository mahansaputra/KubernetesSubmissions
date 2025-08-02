const express = require('express');
const app = express();
let counter = 0;

app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter}`);
  counter++;
});

app.listen(3000, () => {
  console.log('Ping-pong app listening on port 3000');
});
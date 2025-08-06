const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

async function initializeCounter() {
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS counters (id SERIAL PRIMARY KEY, pongs INT DEFAULT 0)');
    const res = await client.query('SELECT pongs FROM counters LIMIT 1');
    if (res.rows.length === 0) {
      await client.query('INSERT INTO counters (pongs) VALUES (0)');
    }
  } finally {
    client.release();
  }
}

let pongs = 0;

http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    const client = await pool.connect();
    try {
      const result = await client.query('UPDATE counters SET pongs = pongs + 1 RETURNING pongs');
      const pongs = result.rows[0].pongs;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ pongs }));
    } catch (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error updating counter');
    } finally {
      try {
        client.release();
      } catch (releaseErr) {
        console.error('Error releasing client:', releaseErr);
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}).listen(process.env.PORT || 80, () => {
  console.log(`Ping pong app listening on port ${process.env.PORT || 80}`);
  initializeCounter().catch(err => console.error('Failed to initialize counter:', err));
});
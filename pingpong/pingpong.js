const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'admin',
  host: process.env.POSTGRES_HOST || 'postgres',
  database: process.env.POSTGRES_DB || 'pingpongdb',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initializeCounter() {
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS counters (id SERIAL PRIMARY KEY, pongs INT DEFAULT 0)');
    const res = await client.query('SELECT pongs FROM counters LIMIT 1');
    if (res.rows.length === 0) {
      await client.query('INSERT INTO counters (pongs) VALUES (0)');
    }
  } catch (err) {
    console.error('Init error:', err.stack);
  } finally {
    client.release();
  }
}

http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    const client = await pool.connect();
    try {
      const result = await client.query('UPDATE counters SET pongs = pongs + 1 RETURNING pongs');
      const pongs = result.rows[0].pongs;
      console.log('Query succeeded, pongs:', pongs);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Pongs: ${pongs}`);
    } catch (err) {
      console.error('Database error:', err.stack);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error updating counter');
    } finally {
      try {
        client.release();
        console.log('Client released successfully');
      } catch (releaseErr) {
        console.error('Error releasing client:', releaseErr.stack);
      }
    }
  } else if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}).listen(process.env.PORT || 80, () => {
  console.log(`Ping pong app listening on port ${process.env.PORT || 80}`);
  initializeCounter().catch(err => console.error('Failed to initialize counter:', err));
});
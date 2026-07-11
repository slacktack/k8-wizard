const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || 'v1';

// Track request count
let requestCount = 0;

// Simulated startup delay
const startupDelay = parseInt(process.env.STARTUP_DELAY || '0');
if (startupDelay > 0) {
  console.log(`Simulating slow startup: ${startupDelay}ms`);
}

// ─── Health & Readiness ───────────────────────────────────

let ready = false;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: VERSION });
});

app.get('/ready', (req, res) => {
  if (ready) {
    res.json({ status: 'ready', version: VERSION });
  } else {
    res.status(503).json({ status: 'not ready', version: VERSION });
  }
});

// ─── API Routes ───────────────────────────────────────────

app.get('/', (req, res) => {
  requestCount++;
  res.json({
    message: `Hello from ${VERSION}!`,
    requestCount,
    hostname: require('os').hostname(),
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ],
  });
});

app.get('/api/cpu-stress', (req, res) => {
  // Burn CPU for demo (trigger HPA)
  const duration = parseInt(req.query.ms || '1000');
  const end = Date.now() + duration;
  while (Date.now() < end) {
    Math.sqrt(Math.random() * 100000);
  }
  res.json({ stressed: true, duration });
});

app.get('/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'not set',
    DB_HOST: process.env.DB_HOST || 'not set',
    logLevel: process.env.LOG_LEVEL || 'not set',
  });
});

// ─── Graceful Shutdown ────────────────────────────────────

const server = app.listen(PORT, () => {
  ready = true;
  console.log(`API ${VERSION} listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  ready = false;
  server.close(() => {
    console.log('All connections closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 25000);
});

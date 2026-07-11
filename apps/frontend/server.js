const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve the frontend
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'frontend' });
});

app.listen(PORT, () => {
  console.log(`Frontend listening on port ${PORT}`);
});

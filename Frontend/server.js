const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// Staticne datoteke (html, js, css)
app.use(express.static(path.join(__dirname, '/')));

app.get('/config', (req, res) => {
  res.json({ CLIENT_ID: process.env.CLIENT_ID });
});

// Zagon strežnika
const PORT = 3123;
app.listen(PORT, () => {
  console.log(`Frontend teče na http://localhost:${PORT}/notes.html`);
});

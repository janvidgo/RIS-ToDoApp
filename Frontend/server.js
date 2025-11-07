const express = require('express');
const path = require('path');
const app = express();

// Staticne datoteke (html, js, css)
app.use(express.static(path.join(__dirname, '/')));

// Zagon strežnika
const PORT = 3123;
app.listen(PORT, () => {
  console.log(`Frontend teče na http://localhost:${PORT}/notes.html`);
});

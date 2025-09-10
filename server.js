const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const DATA_FILE = './data.json';

app.use(cors());
app.use(express.json());

// Ophalen van data
app.get('/data', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
  } else {
    res.json({});
  }
});

// Opslaan van data
app.post('/data', (req, res) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(req.body));
  res.json({ status: 'ok' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
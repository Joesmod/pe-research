const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(__dirname));

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { cards: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all cards
app.get('/api/cards', (req, res) => {
  res.json(readData());
});

// PUT replace all cards
app.put('/api/cards', (req, res) => {
  const data = readData();
  data.cards = req.body.cards;
  writeData(data);
  res.json({ ok: true });
});

// POST add a single card
app.post('/api/cards', (req, res) => {
  const data = readData();
  const card = req.body;
  if (!card.id) card.id = crypto.randomUUID().slice(0, 8);
  data.cards.push(card);
  writeData(data);
  res.status(201).json(card);
});

// PATCH update a single card
app.patch('/api/cards/:id', (req, res) => {
  const data = readData();
  const card = data.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: 'not found' });
  Object.assign(card, req.body);
  writeData(data);
  res.json(card);
});

// DELETE a single card
app.delete('/api/cards/:id', (req, res) => {
  const data = readData();
  const before = data.cards.length;
  data.cards = data.cards.filter(c => c.id !== req.params.id);
  if (data.cards.length === before) return res.status(404).json({ error: 'not found' });
  writeData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Task Board server → http://localhost:${PORT}`));

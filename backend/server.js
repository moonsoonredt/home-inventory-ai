require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { askAI, parseText } = require('./ai');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const fsExtra = require('fs-extra');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Servir frontend статически
app.use(express.static(path.join(__dirname, 'frontend/dist')));

const upload = multer({ dest: 'temp/' });

// Получить все locations
app.get('/api/locations', (req, res) => {
  db.all('SELECT * FROM locations', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Добавить location
app.post('/api/locations', (req, res) => {
  const { name, parent_id } = req.body;
  db.run('INSERT INTO locations (name, parent_id) VALUES (?, ?)', [name, parent_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Добавить item
app.post('/api/items', (req, res) => {
  const { name, location_id } = req.body;
  db.run('INSERT INTO items (name, location_id) VALUES (?, ?)', [name, location_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Получить все items
app.get('/api/items', (req, res) => {
  db.all('SELECT i.*, l.name as location FROM items i JOIN locations l ON i.location_id = l.id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Добавить product
app.post('/api/products', (req, res) => {
  const { name, location_id, quantity, unit, expiry_date, is_open } = req.body;
  db.run('INSERT INTO products (name, location_id, quantity, unit, expiry_date, is_open) VALUES (?, ?, ?, ?, ?, ?)', [name, location_id, quantity, unit, expiry_date, is_open], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Получить продукты, срок которых истекает в ближайшие 7 дней
app.get('/api/products/expiring', (req, res) => {
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const dateStr = sevenDaysLater.toISOString().split('T')[0];

  db.all('SELECT p.*, l.name as location FROM products p JOIN locations l ON p.location_id = l.id WHERE p.expiry_date <= ?', [dateStr], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Получить все products
app.get('/api/products', (req, res) => {
  db.all('SELECT p.*, l.name as location FROM products p JOIN locations l ON p.location_id = l.id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Обновить expiry_date продукта
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { expiry_date } = req.body;
  db.run('UPDATE products SET expiry_date = ? WHERE id = ?', [expiry_date, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// Speech to text
app.post('/api/speech', upload.single('audio'), async (req, res) => {
  console.log('Speech request received');
  if (!req.file) {
    console.log('No audio file provided');
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const audioPath = req.file.path;
  console.log('Audio file path:', audioPath);

  try {
    const baseUrl = "https://api.assemblyai.com";
    const headers = {
      authorization: process.env.ASSEMBLYAI_API_KEY,
    };

    console.log('Reading audio file...');
    const audioData = await fsExtra.readFile(audioPath);
    console.log('Audio file size:', audioData.length, 'bytes');
    const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
      headers: { ...headers, 'Content-Type': 'application/octet-stream' },
    });
    const audioUrl = uploadResponse.data.upload_url;
    console.log('Audio uploaded, URL:', audioUrl);

    const data = {
      audio_url: audioUrl,
      speech_model: "best",
      language_code: "ru",
      punctuate: true,
      format_text: true,
    };

    const url = `${baseUrl}/v2/transcript`;
    const response = await axios.post(url, data, { headers: headers });

    const transcriptId = response.data.id;
    console.log('Transcript ID:', transcriptId);
    const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

    while (true) {
      const pollingResponse = await axios.get(pollingEndpoint, {
        headers: headers,
      });
      const transcriptionResult = pollingResponse.data;
      console.log('Polling status:', transcriptionResult.status);

      if (transcriptionResult.status === "completed") {
        console.log('Transcription completed:', transcriptionResult.text);
        fs.unlink(audioPath, () => {});
        res.json({ transcription: transcriptionResult.text });
        break;
      } else if (transcriptionResult.status === "error") {
        console.log('Transcription error:', transcriptionResult.error);
        fs.unlink(audioPath, () => {});
        return res.status(500).json({ error: `Transcription failed: ${transcriptionResult.error}` });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    console.error('Error in speech processing:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    fs.unlink(audioPath, () => {});
    return res.status(500).json({ error: 'Speech recognition failed' });
  }
});

// Parse text
app.post('/api/parse', async (req, res) => {
  const { text, type, model } = req.body;
  try {
    const parsed = await parseText(text, type, model);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI запрос
app.post('/api/ai', async (req, res) => {
  const { query, model } = req.body;
  try {
    const response = await askAI(query, model);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Сохранить API ключ
app.post('/api/save-api-key', (req, res) => {
  const { apiKey } = req.body;
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  const envContent = `ASSEMBLYAI_API_KEY=${apiKey}\n`;
  fs.writeFile(envPath, envContent, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save API key' });
    }
    // Перезагрузить переменные окружения, если возможно
    require('dotenv').config();
    res.json({ message: 'API key saved successfully' });
  });
});

// Получить список моделей Ollama
app.get('/api/ollama-models', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    res.json(data.models || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Fallback для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: [
    'https://moviepals.xyz',
    'https://www.moviepals.xyz',
    'http://moviepals.xyz',
    'http://www.moviepals.xyz',
    'https://app.swaggerhub.com',
    'http://134.199.203.34',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// simple ping test
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

module.exports = app;

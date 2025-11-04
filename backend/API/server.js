const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

//simple api ping test
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function start() {
  try {
    await client.connect();

    const api = require('./api.js');
    api.setApp(app, client);

    app.listen(5000, () => {
    });
  } catch (e) {
    console.error('MongoDB connection failed:', e);
  }
}

start();
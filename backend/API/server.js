require('dotenv').config();
const { MongoClient } = require('mongodb');
const app = require('./app');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function start() {
  try {
    await client.connect();

    const api = require('./api.js');
    api.setApp(app, client);

    const friendRating = require('./friendrating.js');
    friendRating.setApp(app, client);

    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  } catch (e) {
    console.error('MongoDB connection failed:', e);
  }
}

start();

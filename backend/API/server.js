const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors({
  origin: [
    'https://moviepals.xyz',
    'https://www.moviepals.xyz',
    'http://moviepals.xyz',
    'http://www.moviepals.xyz',
    'http://134.199.203.34',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

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
console.log('🔥 API MODULE LOADED 🔥');
    api.setApp(app, client);
console.log('🔥 ROUTES REGISTERED 🔥');

    app.listen(5000, () => {
    });
  } catch (e) {
    console.error('MongoDB connection failed:', e);
  }
}

// ============================
// GET USER PROFILE (username, avatar, stats)
// ============================
app.post("/api/getUserProfile", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Load user
    const user = await User.findById(userId).select("username email avatar");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Count friends
    const friendsList = await Friends.findOne({ userId });
    const friendsCount = friendsList?.friends?.length || 0;

    // Load movies seen
    const moviesSeenRes = await MoviesSeen.findOne({ userId });
    const ratedMovies = moviesSeenRes?.movies || [];

    const ratedCount = ratedMovies.length;
    const favoritesCount = ratedMovies.filter((m) => m.rating === 5).length;

    return res.json({
      username: user.username,
      email: user.email,
      avatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,

      stats: {
        ratedCount,
        favoritesCount,
        friendsCount,
      },

      recentRatings: ratedMovies.reverse().slice(0, 10),
    });
  } catch (err) {
    console.error("Error in /api/getUserProfile:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


start();
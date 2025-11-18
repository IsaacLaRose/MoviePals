const express = require('express');
const app = express();
app.use(express.json());

let db; // will be injected

function setDb(database) {
  db = database;
}

app.post('/api/getFriendsMoviesSeen', async (req, res) => {
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: 'Missing required field: friendId' });

  try {
    const movies = await db
      .collection('moviesSeen')
      .find({ userId: friendId })
      .sort({ dateCreated: 1 }) // ensures predictable order
      .toArray();
    res.status(200).json({ movies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching friend's movie ratings" });
  }
});

module.exports = { app, setDb };

module.exports.setApp = function(app, client, dbName = 'Movie_App') {
  const db = client.db(dbName);

  app.post('/api/getFriendsMoviesSeen', async (req, res) => {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ error: 'Missing required field: friendId' });
    }

    try {
      const movies = await db
        .collection('moviesSeen')
        .find({ userId: friendId })
        .sort({ dateCreated: 1 })
        .toArray();

      res.status(200).json({ movies });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching friend's movie ratings" });
    }
  });
};

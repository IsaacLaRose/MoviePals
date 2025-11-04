require('express');
require('mongodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
require('dotenv').config({ path: '../.env' });

exports.setApp = function (app, client) {
  const db = client.db('Movie_App');
  app.post('/api/register', async (req, res, next) => {
    const { firstName, lastName, username, email, phone, password } = req.body;

    try {
      const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email }] });
      //Ensure no duplicate usernames/emails
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists.' });
      }

      //use bcrypt for password hashing
      const bcryptsalt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, bcryptsalt);

      //Insert into database
      const result = await db.collection('users').insertOne(
        { firstName, lastName, username, email, phone, password: hash, dateCreated: new Date() });


      //Return statement
      res.status(201).json({
        id: result.insertedId,
        firstName,
        lastName,
        username,
        email,
        phone,
        message: 'Successful registration'
      });
    } catch (e) {
      console.error(e);
      error = 'Error during registration';
      res.status(500).json({ error: 'Error during registration' });
    }
  });
  app.post('/api/login', async (req, res, next) => {
    const { login, password } = req.body;
    const db = client.db('Movie_App');

    try {
      //Try to find user login
      const user = await db.collection('users').findOne({ $or: [{ username: login }, { email: login }] });
      //Not a valid user
      if (!user) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      //Ensure valid password validation
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      const { _id, firstName, lastName, username, email, phone } = user;

      //Return data with successful login
      res.status(200).json({
        id: _id,
        firstName,
        lastName,
        username,
        email,
        phone,
        message: 'Successful login'
      });
    } catch (e) {
      console.error(e);
      error = 'Error during login';
      res.status(500).json({ error });
    }
  });;

  app.post('/api/addupdateRating', async (req, res, next) => {
    const { userId, title, year, rating, comment, dateViewed } = req.body;
    const db = client.db('Movie_App');

    //Ensure proper userId, title and year
    if (!userId || !title || !year) {
      return res.status(400).json({ error: 'Missing required fields (userId, title, year)' });
    }

    try {
      const existing = await db.collection('moviesSeen').findOne({ userId, title });

      //if rating already exists, update it
      if (existing) {
        await db.collection('moviesSeen').updateOne(
          { userId, title },
          { $set: { year, rating, comment, dateViewed, dateUpdated: new Date() } }
        );

        //Return updated rating
        res.status(200).json({
          message: 'Rating updated successfully',
          rating: { title, year, rating, comment, dateViewed }
        });
      } else {
        //If rating doesn't already exist, add it
        await db.collection('moviesSeen').insertOne({
          userId,
          title,
          year,
          rating,
          comment,
          dateViewed,
          dateCreated: new Date()
        });

        //return rating created
        res.status(201).json({
          message: 'Rating created successfully',
          rating: { title, year, rating, comment, dateViewed }
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error adding or updating rating' });
    }
  });

  app.post('/api/getMoviesSeen', async (req, res, next) => {
    const { userId } = req.body;
    const db = client.db('Movie_App');

    //Ensure proper userId
    if (!userId) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
      //Get user ratings based off of userId and return
      const movies = await db.collection('moviesSeen').find({ userId }).toArray();
      res.status(200).json({ movies });
    } catch (e) {
      //Issue getting ratings
      console.error(e);
      res.status(500).json({ error: 'Error getting ratings' });
    }
  });

  app.post('/api/deleteMovieSeen', async (req, res, next) => {
    const { userId, title } = req.body;
    const db = client.db('Movie_App');

    try {
      //Find rating and delete it
      const result = await db.collection('moviesSeen').deleteOne({ userId, title });
      //Ensure that the rating was found
      if (result.deletedCount == 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.status(200).json({ message: 'Successfully deleted rating.' });
    } catch (e) {
      //Error deleting rating
      console.error(e);
      res.status(500).json({ error: 'Error deleting rating' });
    }
  });

  app.post('/api/addToWatchlist', async (req, res, next) => {
    const { userId, title, year } = req.body;
    const db = client.db('Movie_App');

    try {
      const existing = await db.collection('watchlist').findOne({ userId, year });
      if (existing) {
        return res.status(400).json({ error: 'Already in watchlist' });
      }

      await db.collection('watchlist').insertOne({
        userId,
        title,
        year,
        dateAdded: new Date()
      });
      res.status(201).json({ message: 'Successfully added to watchlist' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error adding to watchlist' });
    }
  });

  app.post('/api/findUserWatchlist', async (req, res, next) => {
    const { userId } = req.body;
    const db = client.db('Movie_App');

    try {
      const movies = await db.collection('watchlist').find({ userId }).toArray();
      res.status(200).json({ watchlist: movies });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error finding watchlist' });
    }
  });

  app.post('/api/deleteFromWatchlist', async (req, res, next) => {
    const { userId, title } = req.body;
    const db = client.db('Movie_App');

    try {
      const result = await db.collection('watchlist').deleteOne({ userId, title });
      if (result.deletedCount == 0) {
        return res.status(400).json({ error: 'Movie not found in watchlist' });
      }
      res.status(200).json({ message: 'Movie successfully deleted from watchlist' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error deleting from watchlist' });
    }
  });

  app.post('/api/moveToMoviesSeen', async (req, res, next) => {
    const { userId, title, comment, rating, dateViewed } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !title) {
      return res.status(400).json({ error: 'Missing required fields (userId and title)' });
    }
    try {
      const movie = await db.collection('watchlist').findOne({ userId, title });
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found in watchlist' });
      }

      if (!rating || !comment || !dateViewed) {
        return res.status(400).json({ error: 'Missing required fields (rating, comment, dateViewed)' });
      }

      await db.collection('moviesSeen').insertOne({
        userId,
        title: movie.title,
        year: movie.year,
        rating,
        comment,
        dateViewed: dateViewed || new Date().toDateString,
        dateCreated: new Date()
      })

      await db.collection('watchlist').deleteOne({ userId, title });

      res.status(200).json({
        message: 'Movie successfully moved to moviesSeen',
        movie: {
          title: movie.title,
          year: movie.year,
          rating,
          comment,
          dateViewed
        }
      })
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Error moving movie to seen' });
    }
  });

  app.post('/api/addFriend', async (req, res, next) => {
    const { userId, friendsId, firstName, lastName, username } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !friendsId || !firstName || !lastName || !username) {
      return res.status(400).json({ error: 'Missing required fields (userId, friendsId, firstName, lastName, username)' });
    }

    try {
      const existing = await db.collection('friends').findOne({ $or: [{ userId, friendsId }, { userId: friendsId, friendsId: userId },], });

      if (existing) {
        return res.status(400).json({ error: 'Friend already added' });
      }

      //Ensure we are adding both ways for friends
      const friendUser = await db.collection('users').findOne({_id : new ObjectId(friendsId) });
      await db.collection('friends').insertMany([
        {
          userId,
          friendsId,
          firstName,
          lastName,
          username,
          dateAdded: new Date()
        },
        {
          userId: friendsId,
          friendsId: userId,
          firstName: friendUser.firstName,
          lastName: friendUser.lastName,
          username: friendUser.username,
          dateAdded: new Date(),
        },
      ]);

      res.status(201).json({ message: 'Friend added successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error adding friend' });
    }
  });

  app.post('/api/removeFriend', async (req, res, next) => {
    const { userId, friendsId } = req.body;
    const db = client.db('Movie_App');

    try {
      //Ensure we delete both ways when deleting
      const result = await db.collection('friends').deleteMany({ $or : [{userId, friendsId}, {userId: friendsId, friendsId: userId},],});

      if (result.deletedCount == 0) {
        return res.status(404).json({ error: 'Friend not found' });
      }
      res.status(200).json({ message: 'Successfully removed friend.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error deleting rating' });
    }
  });

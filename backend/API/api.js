require('express');
require('mongodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const sendEmail = require('./sendEmail');
const crypto = require('crypto');
require('dotenv').config();
const { searchMovie } = require('./moviedb.js');


console.log('APP_URL:', process.env.APP_URL);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);


exports.setApp = function (app, client) {
  const db = client.db('Movie_App');
  app.post('/api/register', async (req, res) => {
    try {
      const { firstName, lastName, username, email, phoneNumber, password } = req.body;

      console.log('=== REGISTRATION START ===');
      console.log('Request body:', { firstName, lastName, username, email, phoneNumber });

      // Check if user already exists - USE NATIVE MONGODB
      const existingUser = await db.collection('users').findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        console.log('❌ User already exists:', existingUser.email);
        return res.status(400).json({
          message: 'User with this email or username already exists'
        });
      }

      console.log('✓ User does not exist, proceeding...');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✓ Password hashed');

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

      // Create user object - USE NATIVE MONGODB
      const newUser = {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationExpires,
        dateCreated: new Date()
      };

      const result = await db.collection('users').insertOne(newUser);
      console.log('✓ User saved to database:', result.insertedId);

      // Send verification email
      const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}&id=${result.insertedId}`;

      console.log('Sending verification email...');
      await sendEmail(
        email,
        'Verify your MoviePals account',
        `<p>Hello ${firstName},</p>
       <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
       <p>This link will expire in 30 minutes.</p>`
      );

      console.log('✓ Verification email sent to:', email);
      console.log('=== REGISTRATION SUCCESS ===');

      return res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.'
      });

    } catch (error) {
      console.error('❌ REGISTRATION ERROR:', error);
      console.error('Error stack:', error.stack);

      return res.status(500).json({
        message: error.message || 'Registration failed. Please try again.'
      });
    }
  });

  app.post('/api/login', async (req, res, next) => {
    const { login, password } = req.body;
    const db = client.db('Movie_App');

    try {
      //Try to find user login
      if (!login || !password) {
        return res.status(400).json({ error: 'Missing login or password.' });
      }
      const user = await db.collection('users').findOne({ $or: [{ username: login }, { email: login }] });
      //Not a valid user
      if (!user) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      //Ensure user is verified
      if (!user.isVerified) {
        return res.status(403).json({ error: 'Please verify your email before logging in.' });
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
      return res.status(500).json({ error: 'Error during login' });
    }
  });

  app.post('/api/addupdateRating', async (req, res, next) => {
    const { userId, tmdbId, title, year, poster, overview, rating, comment, dateViewed } = req.body;
    const db = client.db('Movie_App');

    //Ensure proper userId, tmdbId
    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing required fields (userId, tmdbId)' });
    }

    try {
      const existing = await db.collection('moviesSeen').findOne({ userId, tmdbId });

      //if rating already exists, update it
      if (existing) {
        if (!rating || !comment || !dateViewed) {
          return res.status(400).json({ error: 'Missing required fields (rating, comment, dateViewed)' });
        }
        await db.collection('moviesSeen').updateOne(
          { userId, tmdbId },
          { $set: { rating, comment, dateViewed, dateUpdated: new Date() } }
        );

        //Return updated rating
        res.status(200).json({
          message: 'Rating updated successfully',
        });
      } else {
        if (!title || !year || !poster || !overview) {
          return res.status(400).json({ error: 'Missing required TMDB movie fields (title, year, poster, overview)' });
        }
        //If rating doesn't already exist, add it
        await db.collection('moviesSeen').insertOne({
          userId,
          tmdbId,
          title,
          year,
          poster,
          overview,
          rating,
          comment,
          dateViewed,
          dateCreated: new Date()
        });

        //return rating created
        res.status(201).json({
          message: 'Rating created successfully',
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
    const { userId, tmdbId } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing required fields (userId, tmdbId)' });
    }

    try {
      //Find rating and delete it
      const result = await db.collection('moviesSeen').deleteOne({ userId, tmdbId });
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
    const { userId, tmdbId, title, year, poster, overview } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing required fields (userId, tmdbId)' });
    }

    try {
      const existing = await db.collection('watchlist').findOne({ userId, tmdbId });
      if (existing) {
        return res.status(400).json({ error: 'Already in watchlist' });
      }

      if (!title || !year || !poster || !overview) {
        return res.status(400).json({ error: "Missing TMDB movie fields (title, year, poster, overview)" });
      }
      await db.collection('watchlist').insertOne({
        userId,
        tmdbId,
        title,
        year,
        poster,
        overview,
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

    if (!userId) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
      const movies = await db.collection('watchlist').find({ userId }).toArray();
      res.status(200).json({ watchlist: movies });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error finding watchlist' });
    }
  });

  app.post('/api/deleteFromWatchlist', async (req, res, next) => {
    const { userId, tmdbId } = req.body;
    const db = client.db('Movie_App');

    try {
      const result = await db.collection('watchlist').deleteOne({ userId, tmdbId });
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
    const { userId, tmdbId, comment, rating, dateViewed } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing required fields (userId, tmdbId)' });
    }
    try {
      const movie = await db.collection('watchlist').findOne({ userId, tmdbId });

      if (!movie) {
        return res.status(404).json({ error: 'Movie not found in watchlist' });
      }

      if (!rating || !comment || !dateViewed) {
        return res.status(400).json({ error: 'Missing required fields (rating, comment, dateViewed)' });
      }

      await db.collection('moviesSeen').insertOne({
        userId,
        tmdbId,
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        overview: movie.overview,
        rating,
        comment,
        dateViewed,
        dateCreated: new Date()
      })

      await db.collection('watchlist').deleteOne({ userId, tmdbId });

      res.status(200).json({
        message: 'Movie successfully moved to moviesSeen',
        movie
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Error moving movie to seen' });
    }
  });

  app.post('/api/addFriend', async (req, res, next) => {
    const { userId, friendsId } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !friendsId) {
      return res.status(400).json({ error: 'Missing required fields (userId, friendsId)' });
    }

    try {
      const existing = await db.collection('friends').findOne({ $or: [{ userId, friendsId }, { userId: friendsId, friendsId: userId },], });

      if (existing) {
        return res.status(400).json({ error: 'Friend already added' });
      }

      //Ensure we are adding both ways for friends
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      const friendUser = await db.collection('users').findOne({ _id: new ObjectId(friendsId) });
      if (!user || !friendUser) {
        return res.status(404).json({ error: 'One or both users not found' });
      }
      await db.collection('friends').insertMany([
        {
          userId,
          friendsId,
          firstName: friendUser.firstName,
          lastName: friendUser.lastName,
          username: friendUser.username,
          dateAdded: new Date(),
        },
        {
          userId: friendsId,
          friendsId: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
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
      const result = await db.collection('friends').deleteMany({ $or: [{ userId, friendsId }, { userId: friendsId, friendsId: userId },], });

      if (result.deletedCount == 0) {
        return res.status(404).json({ error: 'Friend not found' });
      }
      res.status(200).json({ message: 'Successfully removed friend.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error deleting friend' });
    }
  });

  app.post('/api/viewFriendsList', async (req, res, next) => {
    const { userId } = req.body;
    const db = client.db('Movie_App');

    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }

    try {
      // Fetch all friends for this userId directly
      const friendsList = await db.collection('friends')
        .find({ userId })
        .project({
          _id: 0,
          friendsId: 1,
          firstName: 1,
          lastName: 1,
          username: 1,
          dateAdded: 1
        })
        .toArray();

      res.status(200).json({ friendsList });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error fetching friends list' });
    }
  });

  app.get('/api/verifyEmail', async (req, res, next) => {
    const { token, id } = req.query;
    const db = client.db('Movie_App');

    try {
      const user = await db.collection('users').findOne({ _id: new ObjectId(id), verificationToken: token, verificationExpires: { $gt: new Date() } });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification link.' });
      }

      await db.collection('users').updateOne({ _id: new ObjectId(id) }, {
        $set: { isVerified: true },
        $unset: { verificationToken: "", verificationExpires: "" }
      });

      res.status(200).json({ message: 'Email successfully verified!' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error verifying email.' });
    }
  });

  app.post('/api/resendVerification', async (req, res, next) => {
    const { email } = req.body;
    const db = client.db('Movie_App');

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await db.collection('users').updateOne({ _id: user._id },
      { $set: { verificationToken: token, verificationExpires: expires } });

    const verificationURL = `${process.env.APP_URL}/api/verifyEmail?token=${token}&id=${user._id}`;
    await sendEmail(
      user.email,
      'Verify your MoviePals Account',
      `<p>Hello ${user.firstName}, </p>
      <p>Click below to verify your email:</p>
      <a href="${verificationURL}">${verificationURL}</a>`
    );

    res.status(200).json({ message: 'Verification email resent.' });
  });

  app.post('/api/requestPasswordReset', async (req, res, next) => {
    const { email } = req.body;
    const db = client.db('Movie_App');

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'No account found with that email.' });
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await db.collection('users').updateOne({ _id: user._id },
      { $set: { resetToken: token, resetExpires: expires } }
    );

    const resetURL = `${process.env.APP_URL}/api/resetPassword?token=${token}&id=${user._id}`;

    await sendEmail(
      email,
      'Reset your MoviePals password',
      `<p>Click below to reset your password:</p>
      <a href = "${resetURL}">${resetURL}</a>
      <p>This link will expire in 30 minutes.</p>`
    );

    res.status(200).json({ message: 'Password reset email sent.' });
  });

  app.post('/api/resetPassword', async (req, res, next) => {
    const { id, token, newPassword } = req.body;
    const db = client.db('Movie_App');

    const user = await db.collection('users').findOne({ _id: new ObjectId(id), resetToken: token, resetExpires: { $gt: new Date() } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const bcryptsalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, bcryptsalt);

    await db.collection('users').updateOne({ _id: new ObjectId(id) },
      { $set: { password: hash }, $unset: { resetToken: "", resetExpires: "" } });
    res.status(200).json({ message: 'Password successfully reset' });
  });

  app.post('/api/getFriendRatingsForMovie', async (req, res, next) => {
    const { userId, tmdbId } = req.body;
    const db = client.db('Movie_App');

    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing required fields (userId, tmdbId)' });
    }

    try {
      const friendLink = await db.collection('friends').find({ userId }).project({ friendsId: 1 }).toArray();

      const friendIds = friendLink.map(f => f.friendsId.toString());

      if (friendIds.length == 0) {
        return res.status(200).json({ friendRatings: [] });
      }

      const friendRatings = await db.collection('moviesSeen')
        .find({
          userId: { $in: friendIds },
          tmdbId
        })
        .project({
          _id: 0,
          userId: 1,
          tmdbId: 1,
          title: 1,
          poster: 1,
          rating: 1,
          comment: 1,
          dateViewed: 1
        })
        .toArray();

      if (friendRatings.length === 0) {
        return res.status(200).json({ friendRatings: [] });
      }

      const friendUsers = await db.collection('users')
        .find({ _id: { $in: friendIds.map(id => new ObjectId(id)) } })
        .project({
          firstName: 1,
          lastName: 1,
          username: 1
        })
        .toArray();

      const friendUserInfo = friendUsers.map(u => ({
        ...u,
        _id: u._id.toString()
      }));

      const ratingsWithUserInfo = friendRatings.map(rating => {
        const user = friendUserInfo.find(u => u._id === rating.userId);
        return {
          ...rating,
          firstName: user?.firstName,
          lastName: user?.lastName,
          username: user?.username
        };
      });

      return res.status(200).json({ friendRatings: ratingsWithUserInfo });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error fetching friend ratings' });
    }
  });

  app.get('/api/movies/search', async (req, res, next) => {
    try {
      const query = req.query.query;

      if (!query) {
        return res.status(400).json({ error: 'Missing search query.' });
      }

      const results = await searchMovie(query);

      res.status(200).json({ results });
    } catch (e) {
      console.error('TMDB Search Error:', e);
      res.status(500).json({ error: 'Failed to fetch movies from TMDB.' });
    }
  });

  app.post('/api/getFavorites', async (req, res) => {
    const db = client.db('Movie_App');
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    try {
      const favs = await db.collection('favorites')
        .find({ userId })
        .sort({ dateAdded: -1 })
        .toArray();

      res.status(200).json({ favorites: favs });

    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error fetching favorites' });
    }
  });

  app.post('/api/removeFavorite', async (req, res) => {
    const db = client.db('Movie_App');
    const { userId, tmdbId } = req.body;

    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing userId or tmdbId' });
    }

    try {
      await db.collection('favorites').deleteOne({ userId, tmdbId });
      res.status(200).json({ message: 'Favorite removed.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error removing favorite' });
    }
  });

  app.post('/api/addFavorite', async (req, res) => {
    const db = client.db('Movie_App');
    const { userId, tmdbId, title, poster, year, overview, manuallyAdded } = req.body;

    if (!userId || !tmdbId) {
      return res.status(400).json({ error: 'Missing userId or tmdbId' });
    }

    try {
      // Check if already in favorites
      const existing = await db.collection('favorites').findOne({ userId, tmdbId });

      if (existing) {
        // If already exists, just update manuallyAdded
        await db.collection('favorites').updateOne(
          { userId, tmdbId },
          { $set: { manuallyAdded: manuallyAdded ?? existing.manuallyAdded } }
        );

        return res.status(200).json({ message: 'Favorite updated.' });
      }

      // Insert new favorite
      await db.collection('favorites').insertOne({
        userId,
        tmdbId,
        title,
        poster,
        year,
        overview,
        manuallyAdded: manuallyAdded ?? false,
        dateAdded: new Date()
      });

      res.status(201).json({ message: 'Favorite added.' });

    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error adding favorite' });
    }
  });

  app.post('/api/getUserProfile', async (req, res) => {
    const { userId } = req.body;
    const db = client.db("Movie_App");

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const user = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        {
          projection: {
            password: 0,
            verificationToken: 0,
            verificationExpires: 0,
            resetToken: 0,
            resetExpires: 0
          }
        }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateCreated: user.dateCreated
      });

    } catch (err) {
      console.error("Error loading profile:", err);
      return res.status(500).json({ error: "Server error fetching profile" });
    }
  });

  app.post('/api/updateBio', async (req, res) => {
    const { userId, bio } = req.body;
    const db = client.db('Movie_App');

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { bio } }
      );

      res.status(200).json({ message: "Bio updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error updating bio" });
    }
  });

}

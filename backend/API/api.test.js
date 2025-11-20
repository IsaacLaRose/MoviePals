// api.test.js
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('./sendEmail');
jest.mock('./moviedb.js');

const sendEmail = require('./sendEmail');
const { searchMovie } = require('./moviedb.js');
const api = require('./api');

describe('API Routes - Registration', () => {
  let mockApp;
  let mockDb;
  let mockClient;
  let mockCollection;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock Express app
    mockApp = {
      post: jest.fn(),
      get: jest.fn()
    };

    // Setup mock MongoDB collection
    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      find: jest.fn(),
      insertMany: jest.fn()
    };

    // Setup mock MongoDB database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    // Setup mock MongoDB client
    mockClient = {
      db: jest.fn().mockReturnValue(mockDb)
    };

    // Initialize API routes
    api.setApp(mockApp, mockClient);
  });

  describe('POST /api/register', () => {
    let registerHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      // Extract the register handler
      registerHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/register'
      )[1];

      // Setup mock request and response
      mockReq = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          phoneNumber: '1234567890',
          password: 'password123'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Setup default mock behaviors
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({
        insertedId: new ObjectId()
      });
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      sendEmail.mockResolvedValue({ id: 'email-id' });
    });

    test('should successfully register a new user', async () => {
      await registerHandler(mockReq, mockRes);

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        $or: [
          { email: 'john@example.com' },
          { username: 'johndoe' }
        ]
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Registration successful! Please check your email to verify your account.'
      });
    });

    test('should return 400 if user already exists', async () => {
      mockCollection.findOne.mockResolvedValue({
        email: 'john@example.com',
        username: 'johndoe'
      });

      await registerHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User with this email or username already exists'
      });
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    test('should hash password correctly', async () => {
      await registerHandler(mockReq, mockRes);

      const insertCall = mockCollection.insertOne.mock.calls[0][0];
      expect(insertCall.password).toBe('hashedPassword123');
    });

    test('should generate verification token', async () => {
      await registerHandler(mockReq, mockRes);

      const insertCall = mockCollection.insertOne.mock.calls[0][0];
      expect(insertCall.verificationToken).toBeDefined();
      expect(insertCall.verificationExpires).toBeInstanceOf(Date);
      expect(insertCall.isVerified).toBe(false);
    });

    test('should handle database errors', async () => {
      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      await registerHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'DB Error'
      });
    });

    test('should handle email sending errors', async () => {
      sendEmail.mockRejectedValue(new Error('Email service down'));

      await registerHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('POST /api/login', () => {
    let loginHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      loginHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/login'
      )[1];

      mockReq = {
        body: {
          login: 'johndoe',
          password: 'password123'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      bcrypt.compare.mockResolvedValue(true);
    });

    test('should successfully login with username', async () => {
      const mockUser = {
        _id: new ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isVerified: true
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      await loginHandler(mockReq, mockRes);

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        $or: [{ username: 'johndoe' }, { email: 'johndoe' }]
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'johndoe',
          email: 'john@example.com',
          message: 'Successful login'
        })
      );
    });

    test('should successfully login with email', async () => {
      mockReq.body.login = 'john@example.com';
      
      const mockUser = {
        _id: new ObjectId(),
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isVerified: true
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should return 400 if login is missing', async () => {
      mockReq.body.login = '';

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing login or password.'
      });
    });

    test('should return 400 if password is missing', async () => {
      mockReq.body.password = '';

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 401 if user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid username/email or password'
      });
    });

    test('should return 403 if user not verified', async () => {
      mockCollection.findOne.mockResolvedValue({
        username: 'johndoe',
        password: 'hashedPassword',
        isVerified: false
      });

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Please verify your email before logging in.'
      });
    });

    test('should return 401 if password is invalid', async () => {
      mockCollection.findOne.mockResolvedValue({
        username: 'johndoe',
        password: 'hashedPassword',
        isVerified: true
      });
      bcrypt.compare.mockResolvedValue(false);

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid username or password'
      });
    });

    test('should handle database errors', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      await loginHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error during login'
      });
    });
  });

  describe('POST /api/addupdateRating', () => {
    let ratingHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      ratingHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/addupdateRating'
      )[1];

      mockReq = {
        body: {
          userId: 'user123',
          tmdbId: 'movie456',
          title: 'Test Movie',
          year: '2023',
          poster: 'poster.jpg',
          overview: 'A test movie',
          rating: 4,
          comment: 'Great movie!',
          dateViewed: '2023-01-01'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should create new rating if it does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });

      await ratingHandler(mockReq, mockRes);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          tmdbId: 'movie456',
          rating: 4,
          comment: 'Great movie!'
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Rating created successfully'
      });
    });

    test('should update existing rating', async () => {
      mockCollection.findOne.mockResolvedValue({
        userId: 'user123',
        tmdbId: 'movie456',
        rating: 3
      });

      await ratingHandler(mockReq, mockRes);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { userId: 'user123', tmdbId: 'movie456' },
        expect.objectContaining({
          $set: expect.objectContaining({
            rating: 4,
            comment: 'Great movie!'
          })
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Rating updated successfully'
      });
    });

    test('should return 400 if userId is missing', async () => {
      delete mockReq.body.userId;

      await ratingHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields (userId, tmdbId)'
      });
    });

    test('should return 400 if tmdbId is missing', async () => {
      delete mockReq.body.tmdbId;

      await ratingHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 if missing movie fields for new rating', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      delete mockReq.body.title;

      await ratingHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required TMDB movie fields (title, year, poster, overview)'
      });
    });

    test('should return 400 if missing rating fields for update', async () => {
      mockCollection.findOne.mockResolvedValue({ userId: 'user123' });
      delete mockReq.body.rating;

      await ratingHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields (rating, comment, dateViewed)'
      });
    });
  });

  describe('POST /api/addFriend', () => {
    let addFriendHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
    addFriendHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/addFriend'
    )[1];

    mockReq = {
        body: {
        userId: '507f1f77bcf86cd799439011',  // CHANGE: was 'user123'
        friendsId: '507f191e810c19729de860ea'  // CHANGE: was 'friend456'
        }
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    });

    test('should successfully add friend bidirectionally', async () => {
        const validUserId = '507f1f77bcf86cd799439011';  // ✅ Valid 24-char hex
        const validFriendId = '507f191e810c19729de860ea'; // ✅ Valid 24-char hex

        mockCollection.findOne
            .mockResolvedValueOnce(null) // No existing friendship
            .mockResolvedValueOnce({ // User
            _id: new ObjectId(validUserId),
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe'
        })
            .mockResolvedValueOnce({ // Friend
            _id: new ObjectId(validFriendId),
            firstName: 'Jane',
            lastName: 'Smith',
            username: 'janesmith'
        });

      await addFriendHandler(mockReq, mockRes);

        expect(mockCollection.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({
            userId: '507f1f77bcf86cd799439011',  // CHANGE: was 'user123'
            friendsId: '507f191e810c19729de860ea',  // CHANGE: was 'friend456'
            firstName: 'Jane',
            lastName: 'Smith',
            username: 'janesmith'
        }),
        expect.objectContaining({
            userId: '507f191e810c19729de860ea',  // CHANGE: was 'friend456'
            friendsId: '507f1f77bcf86cd799439011',  // CHANGE: was 'user123'
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe'
        })
        ]);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 if friendship already exists', async () => {
      mockCollection.findOne.mockResolvedValue({
        userId: 'user123',
        friendsId: 'friend456'
      });

      await addFriendHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Friend already added'
      });
    });

    test('should return 404 if user not found', async () => {
    mockCollection.findOne
        .mockResolvedValueOnce(null) // No existing friendship
        .mockResolvedValueOnce(null) // User not found
        .mockResolvedValueOnce(null); // Friend also not found (needed!)

    await addFriendHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
        error: 'One or both users not found'
    });
    });

    test('should return 400 if missing required fields', async () => {
      delete mockReq.body.friendsId;

      await addFriendHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('POST /api/addToWatchlist', () => {
    let watchlistHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      watchlistHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/addToWatchlist'
      )[1];

      mockReq = {
        body: {
          userId: 'user123',
          tmdbId: 'movie456',
          title: 'Test Movie',
          year: '2023',
          poster: 'poster.jpg',
          overview: 'Test overview'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should add movie to watchlist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await watchlistHandler(mockReq, mockRes);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          tmdbId: 'movie456',
          title: 'Test Movie'
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 if already in watchlist', async () => {
      mockCollection.findOne.mockResolvedValue({
        userId: 'user123',
        tmdbId: 'movie456'
      });

      await watchlistHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Already in watchlist'
      });
    });
  });
});

describe('Movie and Watchlist Operations', () => {
  let mockApp, mockDb, mockClient, mockCollection;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockApp = {
      post: jest.fn(),
      get: jest.fn()
    };

    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn()
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb)
    };

    api.setApp(mockApp, mockClient);
  });

  describe('POST /api/moveToMoviesSeen', () => {
    let moveHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      moveHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/moveToMoviesSeen'
      )[1];

      mockReq = {
        body: {
          userId: 'user123',
          tmdbId: 'movie456',
          rating: 4,
          comment: 'Great!',
          dateViewed: '2023-01-01'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should move movie from watchlist to seen', async () => {
      const mockMovie = {
        userId: 'user123',
        tmdbId: 'movie456',
        title: 'Test Movie',
        year: '2023',
        poster: 'poster.jpg',
        overview: 'Overview'
      };

      mockCollection.findOne.mockResolvedValue(mockMovie);

      await moveHandler(mockReq, mockRes);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          tmdbId: 'movie456',
          rating: 4,
          comment: 'Great!'
        })
      );
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        userId: 'user123',
        tmdbId: 'movie456'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 if movie not in watchlist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await moveHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Movie not found in watchlist'
      });
    });
  });
});
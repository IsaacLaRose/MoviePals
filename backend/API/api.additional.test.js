// api.additional.test.js
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

jest.mock('bcryptjs');
jest.mock('./sendEmail');
jest.mock('crypto');

const sendEmail = require('./sendEmail');
const api = require('./api');

describe('Password Reset and Verification', () => {
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

  describe('POST /api/requestPasswordReset', () => {
    let resetHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      resetHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/requestPasswordReset'
      )[1];

      mockReq = {
        body: { email: 'user@example.com' }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('mock-token-123')
      });
    });

    test('should send password reset email', async () => {
      const mockUser = {
        _id: new ObjectId(),
        email: 'user@example.com',
        firstName: 'John'
      };

      mockCollection.findOne.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue({ id: 'email-123' });

      await resetHandler(mockReq, mockRes);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockUser._id },
        expect.objectContaining({
          $set: expect.objectContaining({
            resetToken: 'mock-token-123',
            resetExpires: expect.any(Date)
          })
        })
      );

      expect(sendEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Reset your MoviePals password',
        expect.stringContaining('mock-token-123')
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.'
      });
    });

    test('should return 404 if user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await resetHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No account found with that email.'
      });
    });
  });

  describe('POST /api/resetPassword', () => {
    let resetPasswordHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      resetPasswordHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/resetPassword'
      )[1];

      mockReq = {
        body: {
          id: new ObjectId().toString(),
          token: 'valid-token',
          newPassword: 'newPassword123'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
    });

    test('should reset password with valid token', async () => {
      const mockUser = {
        _id: new ObjectId(mockReq.body.id),
        resetToken: 'valid-token',
        resetExpires: new Date(Date.now() + 1000 * 60 * 30)
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      await resetPasswordHandler(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockUser._id },
        {
          $set: { password: 'hashedNewPassword' },
          $unset: { resetToken: '', resetExpires: '' }
        }
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Password successfully reset'
      });
    });

    test('should reject expired token', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await resetPasswordHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or expired reset token.'
      });
    });
  });

  describe('POST /api/resendVerification', () => {
    let resendHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      resendHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/resendVerification'
      )[1];

      mockReq = {
        body: { email: 'user@example.com' }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('new-verification-token')
      });
    });

    test('should resend verification email', async () => {
      const mockUser = {
        _id: new ObjectId(),
        email: 'user@example.com',
        firstName: 'John',
        isVerified: false
      };

      mockCollection.findOne.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue({ id: 'email-123' });

      await resendHandler(mockReq, mockRes);

      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 if user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await resendHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should return 400 if user already verified', async () => {
      mockCollection.findOne.mockResolvedValue({
        email: 'user@example.com',
        isVerified: true
      });

      await resendHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User already verified'
      });
    });
  });

  describe('GET /api/verifyEmail', () => {
    let verifyHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      verifyHandler = mockApp.get.mock.calls.find(
        call => call[0] === '/api/verifyEmail'
      )[1];

      mockReq = {
        query: {
          token: 'valid-token',
          id: new ObjectId().toString()
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should verify email with valid token', async () => {
      const mockUser = {
        _id: new ObjectId(mockReq.query.id),
        verificationToken: 'valid-token',
        verificationExpires: new Date(Date.now() + 1000 * 60 * 30)
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      await verifyHandler(mockReq, mockRes);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(mockReq.query.id) },
        {
          $set: { isVerified: true },
          $unset: { verificationToken: '', verificationExpires: '' }
        }
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should reject invalid token', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await verifyHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('Favorites Operations', () => {
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

  describe('POST /api/addFavorite', () => {
    let addFavoriteHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      addFavoriteHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/addFavorite'
      )[1];

      mockReq = {
        body: {
          userId: 'user123',
          tmdbId: 'movie456',
          title: 'Test Movie',
          poster: 'poster.jpg',
          year: '2023',
          overview: 'Overview',
          manuallyAdded: true
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should add new favorite', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await addFavoriteHandler(mockReq, mockRes);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          tmdbId: 'movie456',
          title: 'Test Movie',
          manuallyAdded: true,
          dateAdded: expect.any(Date)
        })
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Favorite added.'
      });
    });

    test('should update existing favorite', async () => {
      mockCollection.findOne.mockResolvedValue({
        userId: 'user123',
        tmdbId: 'movie456',
        manuallyAdded: false
      });

      await addFavoriteHandler(mockReq, mockRes);

      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Favorite updated.'
      });
    });

    test('should return 400 if missing required fields', async () => {
      delete mockReq.body.userId;

      await addFavoriteHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should default manuallyAdded to false', async () => {
      delete mockReq.body.manuallyAdded;
      mockCollection.findOne.mockResolvedValue(null);

      await addFavoriteHandler(mockReq, mockRes);

      const insertCall = mockCollection.insertOne.mock.calls[0][0];
      expect(insertCall.manuallyAdded).toBe(false);
    });
  });

  describe('POST /api/getFavorites', () => {
    let getFavoritesHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      getFavoritesHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/getFavorites'
      )[1];

      mockReq = {
        body: { userId: 'user123' }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should retrieve user favorites', async () => {
      const mockFavorites = [
        { userId: 'user123', tmdbId: 'movie1', title: 'Movie 1' },
        { userId: 'user123', tmdbId: 'movie2', title: 'Movie 2' }
      ];

      mockCollection.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockFavorites)
        })
      });

      await getFavoritesHandler(mockReq, mockRes);

      expect(mockCollection.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        favorites: mockFavorites
      });
    });

    test('should return 400 if userId missing', async () => {
      delete mockReq.body.userId;

      await getFavoritesHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('POST /api/removeFavorite', () => {
    let removeFavoriteHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      removeFavoriteHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/removeFavorite'
      )[1];

      mockReq = {
        body: {
          userId: 'user123',
          tmdbId: 'movie456'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should remove favorite', async () => {
      await removeFavoriteHandler(mockReq, mockRes);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        userId: 'user123',
        tmdbId: 'movie456'
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Favorite removed.'
      });
    });

    test('should return 400 if missing fields', async () => {
      delete mockReq.body.tmdbId;

      await removeFavoriteHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('Friend Ratings Operations', () => {
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

  describe('POST /api/getFriendRatingsForMovie', () => {
    let friendRatingsHandler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      friendRatingsHandler = mockApp.post.mock.calls.find(
        call => call[0] === '/api/getFriendRatingsForMovie'
      )[1];

      mockReq = {
        body: {
          userId: 'user123',
          tmdbId: 'movie456'
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should get friend ratings for a movie', async () => {
    const validFriendId = '507f1f77bcf86cd799439011'; // ✅ Valid 24-char hex

    const mockFriendLinks = [
        { friendsId: validFriendId },
        { friendsId: '507f191e810c19729de860ea' }
    ];

    const mockRatings = [
        {
        userId: validFriendId,
        tmdbId: 'movie456',
        rating: 5,
        comment: 'Great!'
        }
    ];

    const mockUsers = [
        {
        _id: new ObjectId(validFriendId),
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe'
        }
    ];

      mockCollection.find
        .mockReturnValueOnce({
          project: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockFriendLinks)
          })
        })
        .mockReturnValueOnce({
          project: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockRatings)
          })
        })
        .mockReturnValueOnce({
          project: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockUsers)
          })
        });

      await friendRatingsHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        friendRatings: expect.arrayContaining([
          expect.objectContaining({
            rating: 5,
            firstName: 'Jane',
            username: 'janedoe'
          })
        ])
      });
    });

    test('should return empty array if no friends', async () => {
      mockCollection.find.mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      });

      await friendRatingsHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        friendRatings: []
      });
    });

    test('should return 400 if missing required fields', async () => {
      delete mockReq.body.tmdbId;

      await friendRatingsHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
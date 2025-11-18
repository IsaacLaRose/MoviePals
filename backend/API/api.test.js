const request = require('supertest');
const express = require('express');
const { MongoClient } = require('mongodb');
const { setApp } = require('./api.js'); 

let app;
let client;
let db;

jest.mock('./sendEmail', () => jest.fn(() => Promise.resolve()));

const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

beforeAll(async () => {
  app = express();
  app.use(express.json());

  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  let uri = mongoServer.getUri();

  // Remove old unsupported options
  if (uri.includes('?useUnifiedTopology=true')) {
    uri = uri.replace('?useUnifiedTopology=true', '');
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db('Movie_App_Test');
  setApp(app, client, 'Movie_App_Test'); // Use test DB
});

afterAll(async () => {
  if (client) await client.close();
  if (mongoServer) await mongoServer.stop();
});

//REGISTER TESTS
describe('POST /api/register', () => {
  beforeEach(async () => {
    await db.collection('users').deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'testuser@example.com',
        phone: '1234567890',
        password: 'Password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toContain('Successful registration');
  });

  it('should not allow duplicate username/email', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Password123', 10);

    // Insert a user manually first
    await db.collection('users').insertOne({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: hash,
      isVerified: true,
      dateCreated: new Date()
    });

    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'testuser@example.com',
        phone: '1234567890',
        password: 'Password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('already exists');
  });
});

// LOGIN TESTS
describe('POST /api/login', () => {
  let userId;

  beforeEach(async () => {
    await db.collection('users').deleteMany({}); // clean slate

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Password123', 10);

    const result = await db.collection('users').insertOne({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'testuser@example.com',
        phone: '1234567890',
        password: hash,
        isVerified: true,         // must be boolean true
        dateCreated: new Date() 
    });

    userId = result.insertedId.toString();
    });


  it('should login successfully with username', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ login: 'testuser', password: 'Password123' });

    console.log(res.body); 

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toContain('Successful login');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ login: 'testuser', password: 'WrongPassword' });

    expect(res.statusCode).toBe(401);

  });
});


//Rating Tests
describe('POST /api/addupdateRating', () => {
  let userId;

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
    await db.collection('moviesSeen').deleteMany({}); // Fixed collection name

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Password123', 10);

    const result = await db.collection('users').insertOne({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'testuser@example.com',
      phone: '1234567890',
      password: hash,
      isVerified: true
    });

    userId = result.insertedId.toString();
  });

  it('should add a new rating', async () => {
    const res = await request(app)
      .post('/api/addupdateRating')
      .send({
        userId,
        tmdbId: '12345',
        title: 'Test Movie',
        year: 2025,
        poster: 'poster.jpg',
        overview: 'Test overview',
        rating: 5,
        comment: 'Great!',
        dateViewed: new Date()
      });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
  });
});

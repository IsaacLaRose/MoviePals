const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { app, setDb } = require('./friendrating'); // import both

let mongoServer;
let client;
let db;
const dbName = 'Movie_App';

jest.mock('./sendEmail', () => ({
  sendEmail: jest.fn(() => Promise.resolve())
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  client = await MongoClient.connect(uri); 
  db = client.db(dbName);

  setDb(db); // inject in-memory db into your app
});


afterAll(async () => {
  if (client) await client.close();
  if (mongoServer) await mongoServer.stop();
});


describe('Sample test', () => {
  it('Dummy testing', () => {
    expect(true).toBe(true);
  });
});
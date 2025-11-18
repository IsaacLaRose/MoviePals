// server.test.js
const request = require('supertest');
const app = require('./app'); // <-- use app.js, not server.js

describe('API Tests', () => {
  test('GET /api/ping returns Hello World', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello World' });
  });
});

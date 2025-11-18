const request = require('supertest');
const app = require('./app');

describe('Ping API', () => {
  test('GET /api/ping should return Hello World', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello World' });
  });
});

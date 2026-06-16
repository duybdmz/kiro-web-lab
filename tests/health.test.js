const request = require('supertest');
const app = require('../src/index');

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should return a valid ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body.timestamp).toBeDefined();
    const date = new Date(res.body.timestamp);
    expect(date.toISOString()).toBe(res.body.timestamp);
  });

  it('should return JSON content type', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

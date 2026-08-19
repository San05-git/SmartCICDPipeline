const request = require('supertest');
const app = require('../server');

describe('GET /health', () => {
  
  it('should return status 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
  });

  
  it('should return status "healthy" and a timestamp', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    // The timestamp should be a valid ISO date string
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
  });
});

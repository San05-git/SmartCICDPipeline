// =============================================================================
// tests/health.test.js — Health Check Unit Tests
// =============================================================================
// These tests verify that the /health endpoint returns the expected response.
// The Jenkins pipeline (Stage 5) uses this endpoint to verify the deployed
// container is running correctly.
// =============================================================================

const request = require('supertest');
const app = require('../server');

describe('GET /health', () => {
  // -------------------------------------------------------------------------
  // Test 1: Health endpoint returns status 200
  // -------------------------------------------------------------------------
  // Ensures the server is running and reachable.
  it('should return status 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
  });

  // -------------------------------------------------------------------------
  // Test 2: Health endpoint returns correct JSON shape
  // -------------------------------------------------------------------------
  // Verifies the response contains "status" set to "healthy" and a timestamp.
  it('should return status "healthy" and a timestamp', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    // The timestamp should be a valid ISO date string
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
  });
});

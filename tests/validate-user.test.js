// =============================================================================
// tests/validate-user.test.js — Business Logic Validation Tests
// =============================================================================
// This test file is the HEART of the "Automated Bug Testing" demonstration.
//
// It tests the /api/validate-user endpoint with both valid and invalid inputs.
// The "bug-catching" test below simulates a scenario where a developer
// accidentally sends an age as a string ("25") instead of a number (25).
// The validation logic correctly rejects it, proving the pipeline blocks bad
// data from reaching production.
// =============================================================================

const os = require('os');
const path = require('path');
const request = require('supertest');

const storePath = path.join(os.tmpdir(), `smart-cicd-pipeline-${process.env.JEST_WORKER_ID || '0'}.db`);
process.env.VALIDATION_DB_PATH = storePath;

const app = require('../server');
const { clearValidations } = require('../storage');

function resetStore() {
  clearValidations();
}

beforeEach(resetStore);
afterAll(resetStore);

describe('POST /api/validate-user', () => {
  // -------------------------------------------------------------------------
  // Test 1: Valid user data passes validation
  // -------------------------------------------------------------------------
  it('should accept a valid user payload', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Alice', email: 'alice@example.com', age: 30 });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User validated successfully');
    expect(response.body.user).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    });

    const stored = await request(app).get('/api/validations');
    expect(stored.statusCode).toBe(200);
    expect(stored.body.count).toBe(1);
    expect(stored.body.validations[0]).toMatchObject({
      id: expect.any(Number),
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
    });
  });

  // -------------------------------------------------------------------------
  // Test 2: Missing name is rejected
  // -------------------------------------------------------------------------
  it('should reject a payload with a missing name', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ email: 'bob@example.com', age: 25 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('name');
  });

  // -------------------------------------------------------------------------
  // Test 3: Invalid email is rejected
  // -------------------------------------------------------------------------
  it('should reject a payload with an invalid email', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Bob', email: 'not-an-email', age: 25 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('email');
  });

  // -------------------------------------------------------------------------
  // ★★★ BUG-CATCHING TEST ★★★
  // -------------------------------------------------------------------------
  // This is the key test that demonstrates how the pipeline catches bugs.
  //
  // Scenario: A developer accidentally sends the age as a string ("25")
  // instead of a number (25). This is a common bug in real-world applications
  // where form data or API payloads are not properly typed.
  //
  // The validation logic in server.js checks `typeof age !== 'number'`,
  // so it correctly rejects the string value. If a developer tried to remove
  // this type check, this test would fail, and the Jenkins pipeline would
  // abort before building the Docker image.
  //
  // Interview talking point: "This test proves our pipeline catches type
  // coercion bugs before they reach production. In a real enterprise system,
  // we'd add dozens of similar tests for edge cases like SQL injection,
  // XSS payloads, and boundary values."
  // -------------------------------------------------------------------------
  it('should CATCH A BUG: reject age as a string instead of a number', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Charlie', email: 'charlie@example.com', age: '25' }); // ← BUG: string instead of number

    // The API should return 400 because age is a string, not a number
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('age');
  });

  // -------------------------------------------------------------------------
  // Test 5: Negative age is rejected
  // -------------------------------------------------------------------------
  it('should reject a negative age', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Diana', email: 'diana@example.com', age: -5 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('age');
  });

  // -------------------------------------------------------------------------
  // Test 6: Age over 150 is rejected
  // -------------------------------------------------------------------------
  it('should reject an age over 150', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Eve', email: 'eve@example.com', age: 200 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('age');
  });
});

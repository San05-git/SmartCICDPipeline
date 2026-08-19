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

  
  it('should reject a payload with a missing name', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ email: 'bob@example.com', age: 25 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('name');
  });

  
  it('should reject a payload with an invalid email', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Bob', email: 'not-an-email', age: 25 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('email');
  });

  
  it('should CATCH A BUG: reject age as a string instead of a number', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Charlie', email: 'charlie@example.com', age: '25' });

    
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('age');
  });

  
  it('should reject a negative age', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Diana', email: 'diana@example.com', age: -5 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('age');
  });

  
  it('should reject an age over 150', async () => {
    const response = await request(app)
      .post('/api/validate-user')
      .send({ name: 'Eve', email: 'eve@example.com', age: 200 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('age');
  });
});

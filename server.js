// =============================================================================
// server.js — Express Application
// =============================================================================
// This is the core application for the Automated Bug Testing & Deployment
// System. It exposes two endpoints:
//   1. GET /               — Simple status page
//   2. GET /health         — Health check for pipeline verification
//   3. POST /api/validate-user — Business logic that validates user input
//   4. GET /api/validations — Reads successful validations from SQLite
//
// The application is intentionally kept under 50 lines for clarity.
// =============================================================================

const express = require('express');
const { appendValidation, readValidations } = require('./storage');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// ---------------------------------------------------------------------------
// Endpoint 0: Home
// ---------------------------------------------------------------------------
// Visiting http://localhost:3000/ now returns a simple status payload instead
// of Express's default "Cannot GET /" message.
app.get('/', (req, res) => {
  res.json({
    message: 'SmartCICDPipeline is running',
    endpoints: {
      health: '/health',
      validateUser: '/api/validate-user',
    },
  });
});

// ---------------------------------------------------------------------------
// Endpoint 1: Health Check
// ---------------------------------------------------------------------------
// Used by the Jenkins pipeline (Stage 5) to verify the container is running.
// Returns a simple JSON status.
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Endpoint 2: Business Logic — Validate User Input
// ---------------------------------------------------------------------------
// Accepts a JSON body with { name, email, age }.
// Validates that all fields are present and of the correct type.
// If validation fails, returns 400 with a descriptive error message.
// This is the endpoint our tests use to simulate "catching a bug".
app.post('/api/validate-user', (req, res) => {
  const { name, email, age } = req.body;

  // Validate required fields and their types
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required and must be a string' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'email is required and must be a valid email' });
  }
  if (age === undefined || typeof age !== 'number' || age < 0 || age > 150) {
    return res.status(400).json({ error: 'age is required and must be a number between 0 and 150' });
  }

  // All validations passed
  const validation = {
    name,
    email,
    age,
    validatedAt: new Date().toISOString(),
  };

  appendValidation(validation);

  res.json({ message: 'User validated successfully', user: { name, email, age } });
});

// ---------------------------------------------------------------------------
// Endpoint 3: Stored Validations
// ---------------------------------------------------------------------------
// Returns the successful validation records saved on disk. This is a tiny
// storage demo so the project shows state, not just stateless validation.
app.get('/api/validations', (req, res) => {
  const validations = readValidations();
  res.json({ count: validations.length, validations });
});

// ---------------------------------------------------------------------------
// Start the server (only when run directly, not when imported by tests)
// ---------------------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export app for supertest in our Jest tests
module.exports = app;

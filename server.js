const express = require('express');
const { appendValidation, readValidations } = require('./storage');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: 'SmartCICDPipeline is running',
    endpoints: {
      health: '/health',
      validateUser: '/api/validate-user',
    },
  });
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});


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


app.get('/api/validations', (req, res) => {
  const validations = readValidations();
  res.json({ count: validations.length, validations });
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export app for supertest in our Jest tests
module.exports = app;

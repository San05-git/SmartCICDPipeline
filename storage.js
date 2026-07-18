const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const databases = new Map();

function getDatabasePath() {
  return process.env.VALIDATION_DB_PATH || path.join(__dirname, 'data', 'validations.db');
}

function ensureDatabaseDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function getDatabase() {
  const dbPath = getDatabasePath();

  if (!databases.has(dbPath)) {
    ensureDatabaseDirectory(dbPath);
    const database = new DatabaseSync(dbPath);
    database.exec(`
      CREATE TABLE IF NOT EXISTS validations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        age INTEGER NOT NULL,
        validatedAt TEXT NOT NULL
      );
    `);
    databases.set(dbPath, database);
  }

  return databases.get(dbPath);
}

function appendValidation(entry) {
  const database = getDatabase();
  const statement = database.prepare(`
    INSERT INTO validations (name, email, age, validatedAt)
    VALUES (?, ?, ?, ?)
  `);

  const result = statement.run(entry.name, entry.email, entry.age, entry.validatedAt);

  return {
    id: result.lastInsertRowid,
    ...entry,
  };
}

function readValidations() {
  const database = getDatabase();
  const statement = database.prepare(`
    SELECT id, name, email, age, validatedAt
    FROM validations
    ORDER BY id ASC
  `);

  return statement.all();
}

function clearValidations() {
  const database = getDatabase();
  database.exec('DELETE FROM validations;');
}

module.exports = {
  appendValidation,
  clearValidations,
  readValidations,
};

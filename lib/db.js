const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const schema = require('./schema');

let turso = null;
let db = null;

function getTurso() {
  if (!turso) {
    turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return turso;
}

function getDb() {
  if (!db) {
    db = drizzle(getTurso(), { schema });
  }
  return db;
}

module.exports = { getTurso, getDb };

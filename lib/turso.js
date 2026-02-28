import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

let tursoInstance = null;
let dbInstance = null;

export function getTurso() {
  if (!tursoInstance) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      // Return a mock client during build
      return {
        execute: async () => ({ rows: [] }),
      };
    }

    tursoInstance = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return tursoInstance;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getTurso(), { schema });
  }
  return dbInstance;
}

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.join(__dirname, '../../research.db');

let db: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
      }
      console.log('Connected to SQLite database');
    });
  }
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = getDatabase();
  const run = promisify(database.run.bind(database));

  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Research sessions table
    await run(`
      CREATE TABLE IF NOT EXISTS research_sessions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        progress_stage TEXT,
        error TEXT,
        result_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      )
    `);

    // Search queries table
    await run(`
      CREATE TABLE IF NOT EXISTS search_queries (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        query TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES research_sessions(id)
      )
    `);

    // Sources table
    await run(`
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        domain TEXT,
        snippet TEXT,
        published_date TEXT,
        source_type TEXT,
        source_quality TEXT,
        content TEXT,
        content_retrieved INTEGER DEFAULT 0,
        retrieval_error TEXT,
        relevance_score REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES research_sessions(id)
      )
    `);

    // Research results table
    await run(`
      CREATE TABLE IF NOT EXISTS research_results (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        answer TEXT NOT NULL,
        search_queries_count INTEGER,
        total_search_results INTEGER,
        sources_found INTEGER,
        sources_retrieved INTEGER,
        research_duration_ms INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES research_sessions(id)
      )
    `);

    // Citations table
    await run(`
      CREATE TABLE IF NOT EXISTS citations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        result_id TEXT NOT NULL,
        source_id TEXT NOT NULL,
        claim TEXT,
        source_url TEXT,
        FOREIGN KEY (result_id) REFERENCES research_results(id),
        FOREIGN KEY (source_id) REFERENCES sources(id)
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function runAsync(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export async function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

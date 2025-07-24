import { open } from "sqlite";
import sqlite3 from "sqlite3";

let db: Awaited<ReturnType<typeof open>> | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: "./database.db",
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function setupDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS circulars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      summary TEXT,
      city TEXT,
      category TEXT,
      source TEXT,
      source_link TEXT,
      priority TEXT,
      published_date TEXT,
      scraped_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS document_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT,
      file_type TEXT,
      file_size INTEGER,
      extracted_text TEXT,
      analysis_result TEXT,
      confidence_score REAL,
      user_session TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      messages TEXT,
      city TEXT,
      language TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

import { getDb } from "./connection.js"

export function initDb() {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS teachings (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      speaker    TEXT NOT NULL DEFAULT 'Pastor',
      description TEXT,
      video_url  TEXT,
      audio_url  TEXT,
      thumbnail  TEXT,
      duration   TEXT,
      published  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prophecies (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      content    TEXT NOT NULL,
      author     TEXT NOT NULL DEFAULT 'Prophecy',
      published  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      type       TEXT NOT NULL CHECK(type IN ('video','audio','image')),
      url        TEXT NOT NULL,
      thumbnail  TEXT,
      description TEXT,
      duration   TEXT,
      published  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id         TEXT PRIMARY KEY,
      title      TEXT,
      url        TEXT NOT NULL,
      caption    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      body       TEXT NOT NULL,
      type       TEXT NOT NULL DEFAULT 'info',
      read       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS radio_listeners (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      stream_id  TEXT NOT NULL,
      connected_at TEXT NOT NULL DEFAULT (datetime('now')),
      disconnected_at TEXT
    );
  `)

  console.log("✅ Database initialized")
}

// Run directly: tsx src/db/init.ts
initDb()

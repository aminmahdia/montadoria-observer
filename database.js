import Database from "better-sqlite3"

const db = new Database("montadoria.db")

db.pragma("journal_mode = WAL")

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    display_name TEXT NOT NULL,
    money INTEGER NOT NULL DEFAULT 0,
    bank INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    role TEXT NOT NULL DEFAULT 'user',
    job TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

export default db

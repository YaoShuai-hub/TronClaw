import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database

export function initDb(): void {
  const dbPath = process.env.DATABASE_PATH ?? './data.db'
  db = new Database(path.resolve(dbPath))
  db.pragma('journal_mode = WAL')

  // Payment requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_requests (
      pay_id TEXT PRIMARY KEY,
      amount TEXT NOT NULL,
      token TEXT NOT NULL,
      description TEXT,
      recipient_address TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      tx_hash TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `)

  // Automation tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_tasks (
      task_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      conditions TEXT NOT NULL,
      actions TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      triggered_at INTEGER,
      trigger_count INTEGER DEFAULT 0
    )
  `)

  // Agent identities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_identities (
      agent_id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      owner_address TEXT NOT NULL,
      capabilities TEXT NOT NULL,
      trust_score REAL DEFAULT 100,
      total_transactions INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 1.0,
      registered_at INTEGER NOT NULL,
      identity_tx_hash TEXT
    )
  `)

  // Transaction log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tx_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT,
      type TEXT,
      from_address TEXT,
      to_address TEXT,
      amount TEXT,
      token TEXT,
      status TEXT,
      timestamp INTEGER NOT NULL
    )
  `)

  console.log('[DB] SQLite initialized at', dbPath)
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized — call initDb() first')
  return db
}

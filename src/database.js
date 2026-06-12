const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'tasks.db');

let db;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Seed default tasks if table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO tasks (title, completed) VALUES (?, ?)');
    insert.run('Try Kiro Web', 0);
    insert.run('Open a PR with autonomous mode', 0);
  }
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function resetDatabase() {
  const database = getDatabase();
  database.exec('DELETE FROM tasks');
  database.exec("DELETE FROM sqlite_sequence WHERE name='tasks'");
  // Re-seed default tasks
  const insert = database.prepare('INSERT INTO tasks (title, completed) VALUES (?, ?)');
  insert.run('Try Kiro Web', 0);
  insert.run('Open a PR with autonomous mode', 0);
}

module.exports = { getDatabase, closeDatabase, resetDatabase };

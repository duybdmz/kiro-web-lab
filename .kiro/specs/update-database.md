# Spec: Update Database - Migrate from In-Memory Store to SQLite

## Overview

Replace the in-memory JavaScript array used for task storage with a persistent SQLite database using the `better-sqlite3` package. This ensures data persistence across server restarts and provides a production-ready storage layer.

---

## 1. Requirements

### Functional Requirements

- **FR-1**: All task data must be stored in a SQLite database file instead of an in-memory array.
- **FR-2**: The database file path must be configurable via the `DB_PATH` environment variable.
- **FR-3**: If `DB_PATH` is not set, the database defaults to `tasks.db` in the project root directory.
- **FR-4**: The database must be automatically initialized (table creation) on first connection.
- **FR-5**: Default seed data must be inserted when the tasks table is empty (first run).
- **FR-6**: All existing CRUD operations (Create, Read, Update, Delete) must work with the SQLite backend.
- **FR-7**: The `completed` field must be stored as INTEGER (0/1) in the database and converted to boolean in API responses.
- **FR-8**: The database module must provide a `resetDatabase()` function for testing purposes.
- **FR-9**: The database module must provide a `closeDatabase()` function for graceful shutdown.

### Non-Functional Requirements

- **NFR-1**: Use WAL (Write-Ahead Logging) journal mode for better concurrent read performance.
- **NFR-2**: Enable foreign key constraints at the database level.
- **NFR-3**: The migration must not change the existing API contract (request/response formats remain the same).
- **NFR-4**: Use synchronous `better-sqlite3` for simpler code and better performance in single-threaded Node.js.

---

## 2. Design

### 2.1 Database Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0
);
```

| Column    | Type    | Constraints                    | Description                        |
|-----------|---------|--------------------------------|------------------------------------|
| id        | INTEGER | PRIMARY KEY AUTOINCREMENT      | Unique task identifier             |
| title     | TEXT    | NOT NULL                       | Task title (max 200 chars in app)  |
| completed | INTEGER | NOT NULL DEFAULT 0             | Task status: 0 = false, 1 = true  |

### 2.2 Module Structure

#### `src/database.js` - Database Module

Responsible for managing the SQLite connection and providing utility functions.

```
Exports:
  - getDatabase()    -> Returns the singleton database instance, initializes if needed
  - closeDatabase()  -> Closes the database connection gracefully
  - resetDatabase()  -> Clears all data, resets auto-increment, re-seeds defaults
```

**Singleton Pattern**: The module maintains a single database instance (`let db`) that is lazily initialized on first call to `getDatabase()`.

**Initialization Flow**:
1. Create database connection with the configured path
2. Set `journal_mode = WAL` pragma
3. Set `foreign_keys = ON` pragma
4. Create `tasks` table if it does not exist
5. Seed default tasks if the table is empty

#### `src/index.js` - Express Application

Updated to use the database module instead of in-memory array:
- Import `getDatabase` from `./database`
- Each route handler calls `getDatabase()` to obtain the db instance
- Use prepared statements for all SQL operations
- Convert `completed` field (INTEGER to Boolean) in responses

### 2.3 Configuration

| Environment Variable | Default                          | Description                  |
|---------------------|----------------------------------|------------------------------|
| `DB_PATH`           | `path.join(__dirname, '..', 'tasks.db')` | Path to the SQLite database file |

### 2.4 Seed Data

On first initialization (empty table), the following tasks are inserted:

| title                              | completed |
|------------------------------------|-----------|
| Try Kiro Web                       | 0         |
| Open a PR with autonomous mode     | 0         |

---

## 3. Acceptance Criteria

- [ ] **AC-1**: The application uses `better-sqlite3` as a dependency (listed in `package.json`).
- [ ] **AC-2**: A `src/database.js` module exists with `getDatabase`, `closeDatabase`, and `resetDatabase` exports.
- [ ] **AC-3**: The `tasks` table is created automatically on application startup.
- [ ] **AC-4**: Default seed data is inserted when the table is empty.
- [ ] **AC-5**: `GET /api/tasks` returns tasks from the SQLite database with pagination.
- [ ] **AC-6**: `GET /api/tasks/:id` returns a single task from the database.
- [ ] **AC-7**: `POST /api/tasks` inserts a new task into the database.
- [ ] **AC-8**: `PUT /api/tasks/:id` updates an existing task in the database.
- [ ] **AC-9**: `DELETE /api/tasks/:id` removes a task from the database.
- [ ] **AC-10**: The `completed` field is returned as a boolean in all API responses.
- [ ] **AC-11**: The `DB_PATH` environment variable controls the database file location.
- [ ] **AC-12**: WAL journal mode is enabled on the database.
- [ ] **AC-13**: All existing tests pass without modification to the API contract.
- [ ] **AC-14**: The in-memory array storage is fully removed from the codebase.
- [ ] **AC-15**: The database file (`*.db`) is excluded from version control via `.gitignore`.

---

## 4. Tasks

### Task 1: Add Dependencies
- [ ] Install `better-sqlite3` package
- [ ] Verify it is added to `package.json` dependencies

### Task 2: Create Database Module
- [ ] Create `src/database.js` with singleton database management
- [ ] Implement `getDatabase()` with lazy initialization
- [ ] Implement `initializeDatabase()` for schema creation and seeding
- [ ] Implement `closeDatabase()` for graceful shutdown
- [ ] Implement `resetDatabase()` for test isolation
- [ ] Configure WAL journal mode and foreign keys

### Task 3: Update Express Application
- [ ] Remove in-memory tasks array from `src/index.js`
- [ ] Import and use `getDatabase()` in all route handlers
- [ ] Rewrite `GET /api/tasks` to use SQL with pagination (LIMIT/OFFSET)
- [ ] Rewrite `GET /api/tasks/:id` to use SQL prepared statement
- [ ] Rewrite `POST /api/tasks` to use SQL INSERT
- [ ] Rewrite `PUT /api/tasks/:id` to use SQL UPDATE
- [ ] Rewrite `DELETE /api/tasks/:id` to use SQL DELETE
- [ ] Add INTEGER-to-Boolean conversion for `completed` field in responses

### Task 4: Update Configuration
- [ ] Add `DB_PATH` environment variable support
- [ ] Add `*.db` to `.gitignore`
- [ ] Update Dockerfile if needed (ensure `better-sqlite3` builds correctly)

### Task 5: Update Tests
- [ ] Update test setup to use `resetDatabase()` for isolation
- [ ] Update test teardown to use `closeDatabase()`
- [ ] Ensure all 22 existing tests pass with the new database backend
- [ ] Verify tests use a separate test database (not production data)

### Task 6: Documentation
- [ ] Update README.md with database configuration details
- [ ] Document the `DB_PATH` environment variable
- [ ] Add notes about database initialization behavior

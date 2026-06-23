const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { getDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS config ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Rate limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// --- Body parser ---
app.use(express.json());

// --- Logging middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'kiro-web-lab is running' });
});

// Health endpoint
app.get('/health', (req, res) => {
  try {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// List tasks with pagination
app.get('/api/tasks', (req, res) => {
  const db = getDatabase();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const total = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  const tasks = db.prepare('SELECT * FROM tasks LIMIT ? OFFSET ?').all(limit, offset);

  // Convert completed from integer to boolean
  const data = tasks.map((t) => ({ ...t, completed: Boolean(t.completed) }));

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ ...task, completed: Boolean(task.completed) });
});

// Create task with input validation
app.post('/api/tasks', (req, res) => {
  const db = getDatabase();
  const { title, completed } = req.body;

  // Validate title
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required and must be a string' });
  }
  if (title.trim().length === 0) {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: 'title must be 200 characters or less' });
  }

  // Validate completed if provided
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }

  const completedValue = completed ? 1 : 0;
  const result = db.prepare('INSERT INTO tasks (title, completed) VALUES (?, ?)').run(title.trim(), completedValue);
  const task = { id: result.lastInsertRowid, title: title.trim(), completed: completed || false };
  res.status(201).json(task);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  let title = task.title;
  let completed = Boolean(task.completed);

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    if (req.body.title.length > 200) {
      return res.status(400).json({ error: 'title must be 200 characters or less' });
    }
    title = req.body.title.trim();
  }
  if (req.body.completed !== undefined) {
    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    completed = req.body.completed;
  }

  db.prepare('UPDATE tasks SET title = ?, completed = ? WHERE id = ?').run(title, completed ? 1 : 0, id);
  res.json({ id, title, completed });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// Only start listening if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;

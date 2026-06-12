const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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

// In-memory task store
let tasks = [
  { id: 1, title: 'Try Kiro Web', completed: false },
  { id: 2, title: 'Open a PR with autonomous mode', completed: false },
];
let nextId = 3;

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'kiro-web-lab is running' });
});

// List tasks with pagination
app.get('/api/tasks', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedTasks = tasks.slice(startIndex, endIndex);

  res.json({
    data: paginatedTasks,
    pagination: {
      page,
      limit,
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / limit),
    },
  });
});

// Get single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create task with input validation
app.post('/api/tasks', (req, res) => {
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

  const task = { id: nextId++, title: title.trim(), completed: completed || false };
  tasks.push(task);
  res.status(201).json(task);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    if (req.body.title.length > 200) {
      return res.status(400).json({ error: 'title must be 200 characters or less' });
    }
    task.title = req.body.title.trim();
  }
  if (req.body.completed !== undefined) {
    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    task.completed = req.body.completed;
  }
  res.json(task);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
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

const request = require('supertest');
const app = require('../src/index');

describe('Health Check', () => {
  test('GET / should return status ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBe('kiro-web-lab is running');
  });
});

describe('GET /api/tasks', () => {
  test('should return paginated tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  test('should respect page and limit query params', async () => {
    const res = await request(app).get('/api/tasks?page=1&limit=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(1);
  });

  test('should default to page 1 and limit 10', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
  });
});

describe('GET /api/tasks/:id', () => {
  test('should return a task by ID', async () => {
    const res = await request(app).get('/api/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('completed');
  });

  test('should return 404 for non-existent task', async () => {
    const res = await request(app).get('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  test('should return 400 for invalid ID', async () => {
    const res = await request(app).get('/api/tasks/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid task ID');
  });
});

describe('POST /api/tasks', () => {
  test('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'New test task' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('New test task');
    expect(res.body.completed).toBe(false);
  });

  test('should reject missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('title is required');
  });

  test('should reject empty title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '   ' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('title cannot be empty');
  });

  test('should reject title longer than 200 chars', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'a'.repeat(201) });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('200 characters');
  });

  test('should reject non-string title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 123 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('title is required');
  });

  test('should reject non-boolean completed', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', completed: 'yes' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('completed must be a boolean');
  });
});

describe('PUT /api/tasks/:id', () => {
  test('should update a task title', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ title: 'Updated title' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated title');
  });

  test('should update task completed status', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  test('should return 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/api/tasks/9999')
      .send({ title: 'Nope' });
    expect(res.statusCode).toBe(404);
  });

  test('should return 400 for invalid ID', async () => {
    const res = await request(app)
      .put('/api/tasks/abc')
      .send({ title: 'Nope' });
    expect(res.statusCode).toBe(400);
  });

  test('should reject empty title', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ title: '' });
    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  test('should delete a task', async () => {
    // Create a task to delete
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'To be deleted' });
    const id = createRes.body.id;

    const res = await request(app).delete(`/api/tasks/${id}`);
    expect(res.statusCode).toBe(204);

    // Verify it's gone
    const getRes = await request(app).get(`/api/tasks/${id}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('should return 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
  });

  test('should return 400 for invalid ID', async () => {
    const res = await request(app).delete('/api/tasks/abc');
    expect(res.statusCode).toBe(400);
  });
});

describe('404 handler', () => {
  test('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});

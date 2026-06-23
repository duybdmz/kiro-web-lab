# kiro-web-lab

A simple Node.js REST API for experimenting with Kiro Web.

## Features

- RESTful CRUD API for tasks
- Input validation
- Pagination support
- Request logging
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Global error handling
- Docker support

## Getting Started

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`

## Running Tests

```bash
npm test
```

## Docker

```bash
docker build -t kiro-web-lab .
docker run -p 3000:3000 kiro-web-lab
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/tasks` | List tasks (paginated) |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Pagination

`GET /api/tasks` supports query parameters:
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10, max: 100)

Example: `GET /api/tasks?page=2&limit=5`

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

### Input Validation

- `title` is required, must be a non-empty string (max 200 chars)
- `completed` must be a boolean if provided

### Error Responses

All errors return JSON:
```json
{ "error": "description of the error" }
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | — | Set to `production` to hide error details |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |

## Tech Stack

- Node.js
- Express
- cors
- express-rate-limit
- Jest + Supertest (testing)

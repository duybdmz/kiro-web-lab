# kiro-web-lab

A simple Node.js REST API for experimenting with Kiro Web.

## Getting Started

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Tech Stack

- Node.js
- Express

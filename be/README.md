# TaskHero - Backend

Simple Express + MongoDB backend for TaskHero.

Setup
1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. Install dependencies: `npm install`.
3. Start server: `npm run dev` (requires nodemon) or `npm start`.

API
- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks
- PUT /api/tasks/:id
- PATCH /api/tasks/:id/status
- DELETE /api/tasks/:id

Task shape:
{
  title: string,
  description?: string,
  dueDate: ISO date string,
  priority: "low"|"medium"|"high",
  status: "todo"|"in-progress"|"completed",
  tags: string[],
  points: number
}

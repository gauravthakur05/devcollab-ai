# DevCollab AI — AI-Powered Developer Collaboration Platform

A full-stack developer collaboration platform: projects, Kanban boards, sprint planning, team chat, notifications, and three AI-assisted tools (code review, bug detection, commit message generation) — built on **React + Vite** and **Node/Express + MongoDB**.

> **Built by an AI assistant without a live test run.** This codebase was written carefully to be correct and complete, but it was authored in a sandboxed environment with no internet access — I could not run `npm install`, start MongoDB, or exercise the app end-to-end myself. Follow the steps below on your own machine, and see **Troubleshooting** at the bottom if anything doesn't come up cleanly on the first try.

---

## 1. Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
  - Local install: https://www.mongodb.com/docs/manual/administration/install-community/
  - Or run it in Docker: `docker run -d -p 27017:27017 --name devcollab-mongo mongo:7`

## 2. Project structure

```text
devcollab-ai/
├── backend/     Express API + Mongoose models + Socket.IO
└── frontend/    React (Vite) + Tailwind CSS
```

## 3. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env` if needed (defaults work for a local MongoDB):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/devcollab
JWT_SECRET=replace_this_with_a_long_random_secret   # change this!
CLIENT_URL=http://localhost:5173
AI_PROVIDER=mock
```

Seed realistic demo data (users, projects, tasks, sprints, chat, notifications, AI examples):

```bash
npm run seed
```

You should see output ending with the demo login credentials. Start the API:

```bash
npm run dev
```

Confirm it's healthy: open **http://localhost:5000/api/health** — you should see `{"success":true, ..., "data":{"status":"ok","database":"connected"}}`.

## 4. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.

## 5. Log in

Use the seeded demo account:

```
Email:    demo@devcollab.com
Password: Demo@123
```

(All seeded users share this password — see `backend/seed/seed.js` for the full roster.) Or register a brand new account from the Sign Up page — it goes through the real registration flow end-to-end.

---

## Features

- **Auth**: JWT + bcrypt, register/login/logout, `/api/auth/me` session check, protected routes, role-based authorization (ADMIN / PROJECT_MANAGER / DEVELOPER / VIEWER)
- **Dashboard**: live stats and charts computed from MongoDB (not hard-coded)
- **Projects**: create/edit/delete, members & roles, status, deadlines
- **Kanban board**: 6 columns, drag-and-drop, persisted to MongoDB on every move
- **Sprints**: planning, start/complete, burndown-style progress chart
- **Team Chat**: real-time via Socket.IO, persisted messages, typing indicator, online status
- **Notifications**: bell dropdown + full page, mark read/mark all read, live push over sockets
- **AI Code Review / Bug Detection / Commit Generator**: powered by a local `MockAIService` (see below) — no external API key required
- **Seed data**: 8 users, 3 projects, 20+ tasks, 3 sprints, chat history, notifications, AI examples

## Swapping the mock AI for a real provider later

The AI endpoints are written against `backend/services/ai/AIServiceInterface.js`. To use a real provider (e.g. OpenAI):

1. Create `backend/services/ai/OpenAIService.js` implementing the same three methods (`reviewCode`, `detectBug`, `generateCommitMessage`) as `MockAIService.js`.
2. In `backend/services/ai/index.js`, uncomment the `case 'openai':` branch and point it at your new class.
3. Set `AI_PROVIDER=openai` and `AI_API_KEY=...` in `.env`.

No controller or route code needs to change.

## API overview

All endpoints are under `/api`. Every response follows `{ success, message, data }` (or `{ success: false, message, errors? }` on failure).

```
GET  /api/health
POST /api/auth/register        POST /api/auth/login
GET  /api/auth/me              POST /api/auth/logout

GET/POST /api/projects         GET/PUT/DELETE /api/projects/:id
POST/DELETE/PUT /api/projects/:id/members(/:userId)

GET/POST /api/tasks            GET/PUT/DELETE /api/tasks/:id
POST /api/tasks/:id/comments

GET/POST /api/sprints          GET/PUT/DELETE /api/sprints/:id

POST /api/ai/code-review       GET /api/ai/code-review/history
POST /api/ai/bug-detection     GET /api/ai/bug-detection/history
POST /api/ai/commit-message    GET /api/ai/commit-message/history

GET/POST /api/chat/:projectId

GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all

GET /api/dashboard/stats
GET /api/users/search?q=...
```

## AWS / Docker — later, not now

The app runs fully locally with no AWS credentials. The codebase is structured for a future cloud migration without a rewrite:

- `backend/services/storage/` — swap `LocalStorageService` for an S3-backed one behind the same `StorageServiceInterface`
- `backend/services/notifications/` — swap/extend `InAppNotificationService` for SES/SNS behind `NotificationServiceInterface`
- `backend/services/ai/` — swap `MockAIService` for a real provider (see above)
- `backend/services/cloud/CloudConfig.js` — reads AWS env vars but never requires them
- No hard-coded `localhost` URLs in application logic — everything goes through `VITE_API_URL` / `CLIENT_URL` / `MONGODB_URI`
- Stateless backend (JWT auth, no server-side sessions) — ready to run behind a load balancer on ECS/EC2

Dockerizing later is just adding a `Dockerfile` per app and a `docker-compose.yml` — no application code changes needed.

---

## Troubleshooting

**This section matters more than usual here** — since I (the AI that wrote this) couldn't run the app myself, these are the most likely first-run issues and exactly how to resolve them.

| Symptom | Fix |
|---|---|
| `MongoDB connection error` / backend exits on start | Make sure MongoDB is actually running (`mongosh` should connect) and `MONGODB_URI` in `backend/.env` is correct. |
| `Network Error` / `Failed to fetch` in the browser | Backend isn't running, or `VITE_API_URL` in `frontend/.env` doesn't match the port the backend is actually listening on. |
| CORS error in the browser console | `CLIENT_URL` in `backend/.env` must exactly match the URL the frontend is served from (default `http://localhost:5173`). Restart the backend after changing `.env`. |
| Login/register returns 401/400 unexpectedly | Check the backend terminal — `morgan` logs every request; the error message in the JSON response also states the exact validation failure. |
| Socket/chat doesn't update live | Confirm `VITE_SOCKET_URL` in `frontend/.env` points at the backend's base URL (no `/api` suffix), and that the JWT token is present (log in again if needed). |
| `npm install` fails on a specific package | Package versions in `package.json` were chosen for compatibility as of early-2026 releases; if one has since been yanked, bump that single package's version and retry. |
| Tailwind classes not applying / unstyled page | Confirm `frontend/postcss.config.js` and `tailwind.config.js` are present (they are, by default) and that you ran `npm install` in `frontend/`, not just `backend/`. |

If you hit something not listed here, check the backend terminal output first — nearly every failure mode in this app surfaces a specific, readable error message there rather than failing silently.

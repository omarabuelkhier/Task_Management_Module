# Task Management Module

A full-stack task management app with a Laravel 12 API (FrankenPHP + Caddy) and a React 18 + Vite + TypeScript frontend (Tailwind CSS), orchestrated via Docker Compose with MySQL and Redis.

## Features

- Laravel 12 API with Sanctum auth and policies
- Standardized JSON API responses (data + meta for pagination)
- Tasks CRUD, assignee selection, and completion toggle
- Searchable assignee dropdown (name/email) with debounce
- React + TypeScript frontend with protected routes
- Form validation using react-hook-form + Zod (Login, Register, Task form)
- Edit form includes Reset (revert changes) and Cancel actions
- Dark-mode friendly inputs (date/time icon visibility fix)
- Dockerized: FrankenPHP+Caddy backend, Nginx frontend, MySQL, Redis
- One-liner dev scripts to build, start, migrate, and seed

## Quick start

- Prerequisites: Docker, Docker Compose v2
- Copy env files if needed (defaults provided); you can override via root `.env`.
- Start using helper script (includes build, waits for health, migrations, seeds):
  - fish shell: `scripts/dev-up.fish`
  - bash/zsh: `bash scripts/dev-up.sh`

Services:

- Backend API: <http://localhost:8080>
- Frontend UI: <http://localhost:5173>

## Development notes

- Backend code is live-mounted; edits reflect without rebuild.
- Frontend is built into static assets served by Nginx; rebuild the image after UI changes or run `npm run dev` locally.
- To change frontend API base URL, set `VITE_API_BASE_URL` (compose ARG) and rebuild frontend.

## Minimal API

- Auth: `/api/register`, `/api/login`, `/api/logout`, `/api/user`
- Tasks: `/api/tasks` (CRUD, pagination), `/api/tasks/{id}/toggle`, `/api/tasks/{id}/assign`
- Users: `/api/users?q=...` (for assignee select)

## Troubleshooting

- If you reseed the DB, stale tokens will be invalid; the app clears auth on 401 and redirects to login.
- Ensure `APP_KEY` exists (the scripts generate it if missing).
- Check `docker compose logs backend` if healthcheck fails.

## Assessment compliance (summary)

This implementation aligns with the brief:

- Security: Laravel Sanctum auth, password hashing, validation via FormRequests, strict policies (assignee-only view/edit/toggle; creator can assign/delete), CORS configured.
- API design: RESTful endpoints for auth and tasks, standardized envelopes, pagination meta, correlation-ready logging (can add webhooks later).
- Performance: DB indexes on tasks.assignee_id and tasks.due_date, route throttling for auth/mutations.
- Usability: Responsive, mobile-friendly UI; derived statuses (Done, Missed/Late, Due Today, Upcoming); searchable assignee; loading spinners; optimistic toggles.
- Error handling: Clear messages, global 401 handling, friendly 403 edit message.
- Modularity: Service layer (TaskService), API Resources, and React services make it easy to plug into broader systems.

## Submission

Submit by emailing the repository link to <mailto:development.team@innovation-gate.ae> within 7 days of receipt.

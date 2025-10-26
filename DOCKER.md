# Docker setup

This project runs as two containers: backend (FrankenPHP+Caddy) and frontend (Nginx), plus MySQL/Redis and optional phpMyAdmin.

## Prerequisites

- Docker Engine and Docker Compose v2
- Set these variables in a `.env` at repo root or export in shell:
  - APP_KEY (run php artisan key:generate if missing)
  - DB_DATABASE, DB_USERNAME, DB_PASSWORD
  - VITE_API_BASE_URL (defaults to <http://localhost:8080/api>)

You can start by copying `.env.example` in the repo root to `.env` and adjusting values.

## Start

- Build and start:
  - `docker compose up --build`
- Backend API: <http://localhost:8080>
- Frontend UI: <http://localhost:5173>
- phpMyAdmin: <http://localhost:8081>

## First run (migrations & seed)

Exec into backend container and run artisan:

- `docker compose exec backend php artisan migrate --force`
- `docker compose exec backend php artisan db:seed --force`

## Notes

- Backend volume mounts `./backend` to `/app` for live code edits.
- Frontend is served as static files after each image build; rebuild when UI changes.
- To change API base URL for frontend, set `VITE_API_BASE_URL` and rebuild the frontend image.

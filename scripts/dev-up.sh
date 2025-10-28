#!/usr/bin/env bash
set -euo pipefail

red() { printf "\033[31m%s\033[0m\n" "$*"; }

echo "[1/5] Building and starting containers..."
docker compose up -d --build || { red "docker compose up failed"; exit 1; }

echo "[2/5] Waiting for backend container (taskmod-backend) to be healthy..."
MAX_TRIES=60
for i in $(seq 1 "$MAX_TRIES"); do
  status=$(docker inspect --format='{{json .State.Health.Status}}' taskmod-backend 2>/dev/null || true)
  if [ "$status" = '"healthy"' ]; then
    echo "Backend is healthy."
    break
  fi
  echo "Backend status: ${status:-unknown} (attempt $i/$MAX_TRIES)."
  sleep 2
  if [ "$i" -eq "$MAX_TRIES" ]; then
    red "Backend failed to become healthy in time. Check 'docker compose logs backend'."
    exit 1
  fi
done

echo "[3/5] Ensuring APP_KEY exists..."
docker compose exec -T backend sh -lc '
  if [ ! -f /app/.env ]; then
    cp /app/.env.example /app/.env 2>/dev/null || true
  fi
  KEY=$(grep -E "^APP_KEY=" /app/.env | cut -d= -f2-)
  if [ -z "$KEY" ]; then
    php artisan key:generate --force
  else
    echo "APP_KEY already set"
  fi
' || { red "APP_KEY generation step failed"; exit 1; }

echo "[4/5] Running database migrations..."
docker compose exec -T backend php artisan migrate --force || { red "artisan migrate failed"; exit 1; }

echo "[5/5] Seeding database..."
docker compose exec -T backend php artisan db:seed --force || { red "artisan db:seed failed"; exit 1; }

echo "All set!"
echo "- Backend:  http://localhost:8080"
echo "- Frontend: http://localhost:5173"

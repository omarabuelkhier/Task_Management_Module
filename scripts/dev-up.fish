#!/usr/bin/env fish

# Start Docker services, wait for backend health, run migrations and seeders.

function fail
  echo (set_color red)$argv( set_color normal)
  exit 1
end

echo "[1/5] Building and starting containers..."
docker compose build --no-cache; or fail "docker compose build failed"
docker compose up -d ; or fail "docker compose up failed"

echo "[2/5] Waiting for backend container (taskmod-backend) to be healthy..."
set max_tries 60
for i in (seq $max_tries)
  set hc (docker inspect --format='{{json .State.Health.Status}}' taskmod-backend 2>/dev/null)
  if test "$hc" = '"healthy"'
    echo "Backend is healthy."
    break
  end
  if test -z "$hc"
    echo "Container not ready yet (attempt $i/$max_tries)."
  else
    echo "Backend status: $hc (attempt $i/$max_tries)."
  end
  sleep 2
  if test $i -eq $max_tries
    fail "Backend failed to become healthy in time. Check 'docker compose logs backend'."
  end
end

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
'; or fail "APP_KEY generation step failed"

echo "[4/5] Running database migrations..."
docker compose exec -T backend php artisan migrate --force; or fail "artisan migrate failed"

echo "[5/5] Seeding database..."
docker compose exec -T backend php artisan db:seed --force; or fail "artisan db:seed failed"

echo "All set!"
echo "- Backend:  http://localhost:8080"
echo "- Frontend: http://localhost:5173"

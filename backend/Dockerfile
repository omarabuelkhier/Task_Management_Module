FROM dunglas/frankenphp:1.3-php8.4-bookworm AS base

ARG WWWUSER=1000
ARG WWWGROUP=1000

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    XDEBUG_MODE=off

WORKDIR /app

# Copy backend source only
COPY backend /app
COPY backend/Caddyfile /etc/caddy/Caddyfile

# Install required system packages and composer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl git unzip libicu-dev libzip-dev libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions commonly used by Laravel
RUN install-php-extensions \
    bcmath curl gd intl mbstring opcache pdo_mysql redis zip

# Install Composer
RUN curl -sLS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Create non-root user to avoid permission issues
RUN groupadd -f -g ${WWWGROUP} app && \
    useradd -ms /bin/bash -g app -u ${WWWUSER} app && \
    chown -R app:app /app

USER app

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader

# Ensure storage is writable at runtime
RUN mkdir -p /app/storage /app/bootstrap/cache

EXPOSE 80

# The entrypoint/command is provided in docker-compose (frankenphp run)

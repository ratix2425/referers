#!/bin/sh
set -e

echo "Running database migrations..."
npm run db:migrate

echo "Running seed (idempotent)..."
npm run db:seed

echo "Starting application..."
exec "$@"

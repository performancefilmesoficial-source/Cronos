#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Use the DATABASE_URL from environment or default to the production path
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/prod.db"
fi

echo "--- STARTING CRONOS MEDIA PRODUCTION INIT ---"
echo "Target Database: $DATABASE_URL"

# Move to app directory to run prisma commands
cd /app

echo "Step 1: Running Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "Step 2: Checking/Seeding Admin User..."
npx prisma db seed

echo "Step 3: Starting Next.js Server..."
cd /app/.next/standalone
exec node server.js

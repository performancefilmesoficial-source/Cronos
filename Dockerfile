FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDeps needed for build)
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set build env - use temp DB
ENV DATABASE_URL=file:/tmp/build.db
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy static and public files for standalone output
# This is required for Next.js standalone mode to serve static assets
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run migrations and start
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy 2>/dev/null || npx prisma migrate deploy 2>/dev/null || true && node .next/standalone/server.js"]

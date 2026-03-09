FROM node:20-alpine AS base

# ---- Deps ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# Install ALL deps including devDependencies (needed for tailwind/postcss at build time)
RUN npm ci --include=dev

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Use dev mode for build so devDeps are available
ENV NODE_ENV=development
ENV DATABASE_URL=file:/tmp/build.db

RUN npx prisma generate && npm run build

# ---- Runner ----
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Create directories for Next.js cache and SQLite data
RUN mkdir -p .next data
RUN chown -R nextjs:nodejs .next data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema and client for migrations at runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

USER nextjs

EXPOSE 80

# Run migrations using the prisma binary already in node_modules, then start
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy 2>/dev/null || true && node server.js"]

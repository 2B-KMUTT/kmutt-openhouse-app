# Stage 1: Build Stage using Bun (Debian glibc)
FROM oven/bun:1 AS builder
WORKDIR /app

# 1. ติดตั้ง Dependencies
COPY package.json ./
COPY yarn.lock* bun.lock* ./
RUN bun install

# 2. คัดลอก Code และ Build
COPY . .
RUN bunx prisma generate
RUN bunx next build

# Stage 2: Production Runner (Node 22 Slim - Debian glibc เดียวกับ Bun)
FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# คัดลอกเฉพาะ Standalone Bundle, Static Files และ Prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 80
CMD ["node", "server.js"]

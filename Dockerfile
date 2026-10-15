# syntax=docker/dockerfile:1

# Stage 1: Build Stage using Bun (Debian glibc)
FROM oven/bun:1 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 1. ติดตั้ง Dependencies (ใช้ BuildKit Cache Mount ลดเวลาดาวน์โหลด package)
COPY package.json ./
COPY yarn.lock* bun.lock* ./
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install

# 2. แยก Prisma Schema ออกมา generate ก่อน (แก้โค้ดหน้าเว็บจะไม่กระทบ Layer นี้ ทำให้ Cache 100%)
COPY prisma ./prisma
RUN bunx prisma generate

# 3. คัดลอก Source Code และ Build โดยใช้ Cache Mount สำหรับ .next/cache
COPY . .
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    bun run build

# Stage 2: Production Runner (Node 22 Slim - Debian glibc เดียวกับ Bun)
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# คัดลอกเฉพาะ Standalone Bundle, Static Files และ Prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 80
CMD ["node", "server.js"]


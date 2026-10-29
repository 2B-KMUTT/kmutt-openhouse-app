# KMUTT Openhouse Application

A comprehensive web application for managing the KMUTT Open House event. The platform supports multiple user roles (Students, Parents, Teachers, Guests, Staffs, and KMUTT Admins), activity registration, E-Stamp check-ins, E-Certificates, and secure external APIs with JWT authentication.

---

## 📝 Features

- **Multi-Role Authentication & Access Control**
  - Students, Parents, Teachers, and Guests can register and login via Email, Citizen ID, or Phone.
  - Staff and KMUTT Admins can login using Username or Email with password.
  - Role-based route protection and authorization guards on both internal and external APIs.
- **Activity & Workshop Management**
  - Browse, search, and register for workshops and open-house activities by faculty and department.
  - Capacity tracking and registration limits.
- **E-Stamp & Journey Tracking**
  - QR Code scanning for activity check-in and attendance verification.
  - Student event journey and completed activity logs.
- **E-Certificate**
  - Automatic certificate generation and downloadable PDF for eligible participants.
- **External API & OAuth2**
  - Secure API endpoints protected with JWT access tokens for external systems.
- **Monitoring & Metrics**
  - Integrated Prometheus, Grafana, and Node Exporter metrics.

---

## 💻 Tech Stack

- **Frontend:** Next.js (Pages Router), React 19, Chakra UI v2, Framer Motion
- **Backend:** Next.js API Routes, NextAuth.js (Credentials Provider)
- **Database & ORM:** MySQL 8.0, Prisma ORM
- **Object Storage:** RustFS (Self-hosted S3-compatible Object Storage)
- **Container & Deployment:** Docker (Multi-stage build with Bun & Node 22 Standalone), Docker Compose, Nginx Load Balancer
- **Monitoring:** Prometheus, Grafana, Node Exporter

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and fill in the required environment variables:

```bash
cp .env.example .env
```

Refer to [`.env.example`](./.env.example) for detailed descriptions and default values.

---

## 🚀 Deployment Guide

The production environment runs on a high-availability architecture with **3 Next.js App Containers** (`openhouse_app_1`, `openhouse_app_2`, `openhouse_app_3` on ports `81`, `82`, `83`) load-balanced behind an **Nginx Reverse Proxy** (port `80`).

### 1. Production Quick Deploy (One-Liner)

Pulls the latest code, builds the production Docker image, and restarts only the application containers with zero downtime:

```bash
git pull origin main && \
docker build -t kmutt_oph_prod . && \
docker compose up -d --no-deps openhouse_app_1 openhouse_app_2 openhouse_app_3
```

---

### 2. Step-by-Step Production Deploy

#### Step 1: Pull the latest code
```bash
git pull origin main
```

#### Step 2: Build the Docker image
Uses multi-stage build (assets built with Bun, executed with Node.js 22 Standalone runner):
```bash
docker build -t kmutt_oph_prod .
```

#### Step 3: Recreate & update application containers
Update the 3 application containers to the new image using `--no-deps` to avoid restarting Nginx or other services:
```bash
docker compose up -d --no-deps openhouse_app_1 openhouse_app_2 openhouse_app_3
```

#### Step 4: Verify status & view logs
```bash
# Check running containers
docker ps

# Stream logs from app containers
docker logs --tail 30 -f openhouse_app_1
docker logs --tail 30 -f openhouse_app_2
docker logs --tail 30 -f openhouse_app_3

# Verify HTTP response
curl -I http://localhost:80/
```

---

### 3. Production Service Management

#### Start application services (Nginx + Apps, monitoring stays dormant)
```bash
docker compose up -d
```

#### Start including Monitoring Stack (Prometheus, Grafana, Node Exporter)
```bash
docker compose --profile monitoring up -d
```

#### Restart Nginx reverse proxy
```bash
docker compose restart nginx
```

#### Stop all services
```bash
docker compose down
```

---

## 🛠️ Database & Scripts

### Prisma ORM
```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to the database
npx prisma db push
```

### Database Seeding & Data Protection Guard
ระบบ Seed มีระบบป้องกันอัตโนมัติ (**Safe Guard**) หากตรวจพบว่ามีข้อมูลอยู่ในฐานข้อมูลอยู่แล้ว สคริปต์จะหยุดการทำงานทันทีเพื่อป้องกันข้อมูลสูญหาย หรือการถูกรีเซ็ตรหัสผ่านของผู้ใช้งาน/แอดมิน:

```bash
# รัน Seed มาตรฐาน (จะหยุดทันทีหากมีข้อมูลอยู่ในฐานข้อมูลแล้ว)
npm run seed

# บังคับรัน Seed แม้มีข้อมูลอยู่แล้ว (รักษา Password เดิมของ Admin/Staff ไว้ ไม่เขียนทับ)
npm run seed:force
# หรือ
npm run seed -- --force

# รันเฉพาะส่วนที่ต้องการ
npm run seed:admins   # สร้างเฉพาะบัญชี Admin
npm run seed:staffs   # สร้างเฉพาะบัญชี Staff
npm run seed:test     # สร้างข้อมูล Mock สำหรับ Test Environment
```

### Full Backup (Read-Only / Export Only)
Safely exports MySQL database, RustFS storage volume, and certificates without deleting data:
```bash
bash scripts/backup-all.sh
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install
# or
bun install

# 2. Generate Prisma Client
npx prisma generate

# 3. Start development server (http://localhost:3000)
npm run dev
# or
bun run dev
```

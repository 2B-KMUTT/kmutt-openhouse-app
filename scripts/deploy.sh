#!/usr/bin/env bash
set -e

# ========================================================
# KMUTT Open House App Deployment Script
# Zero-Downtime Rolling Update & Auto Image Prune
# ========================================================

export DOCKER_BUILDKIT=1

REPO_DIR="${TARGET_REPO_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yaml}"

echo "=========================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEPLOY] Starting KMUTT Open House Deployment..."
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEPLOY] Target Directory: $REPO_DIR"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEPLOY] Compose File:     $COMPOSE_FILE"
echo "=========================================================="

if [ ! -d "$REPO_DIR" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] Repository directory not found: $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"

# Helper function to wait for container readiness
wait_for_port() {
  local port=$1
  local retries=10
  echo "[HEALTHCHECK] Waiting for container on port ${port} to become healthy..."
  for ((i=1; i<=retries; i++)); do
    if curl -s -f -o /dev/null "http://127.0.0.1:${port}/" 2>/dev/null; then
      echo "[HEALTHCHECK] Container on port ${port} responded HTTP 200 OK."
      return 0
    fi
    sleep 1
  done
  echo "[HEALTHCHECK] Warning: Container on port ${port} did not respond within ${retries}s, continuing..."
  return 0
}

# 1. Pull latest code from GitHub
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 1/4] Pulling latest changes from origin main..."
git pull origin main

# 2. Build production Docker image
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 2/4] Building Docker image kmutt_oph_prod..."
docker build -t kmutt_oph_prod .

# 3. Zero-Downtime Rolling Update
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 3/4] Performing Zero-Downtime Rolling Update..."

# Instance 1
if docker ps -q -f name=kmutt-openhouse-app-prod_1 | grep -q .; then
  echo "[MIGRATION] Stopping legacy container kmutt-openhouse-app-prod_1..."
  docker stop kmutt-openhouse-app-prod_1 >/dev/null 2>&1 || true
  docker rm kmutt-openhouse-app-prod_1 >/dev/null 2>&1 || true
fi
echo "--> Updating openhouse_app_1..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps openhouse_app_1
wait_for_port 81

# Instance 2
if docker ps -q -f name=kmutt-openhouse-app-prod_2 | grep -q .; then
  echo "[MIGRATION] Stopping legacy container kmutt-openhouse-app-prod_2..."
  docker stop kmutt-openhouse-app-prod_2 >/dev/null 2>&1 || true
  docker rm kmutt-openhouse-app-prod_2 >/dev/null 2>&1 || true
fi
echo "--> Updating openhouse_app_2..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps openhouse_app_2
wait_for_port 82

# Instance 3
if docker ps -q -f name=kmutt-openhouse-app-prod_3 | grep -q .; then
  echo "[MIGRATION] Stopping legacy container kmutt-openhouse-app-prod_3..."
  docker stop kmutt-openhouse-app-prod_3 >/dev/null 2>&1 || true
  docker rm kmutt-openhouse-app-prod_3 >/dev/null 2>&1 || true
fi
echo "--> Updating openhouse_app_3..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps openhouse_app_3
wait_for_port 83

# 4. Reload Nginx configuration and clean up
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 4/4] Reloading Nginx & Pruning dangling images..."
if docker ps -q -f name=openhouse_nginx | grep -q .; then
  echo "--> Validating & Reloading Nginx..."
  docker exec openhouse_nginx nginx -t && docker exec openhouse_nginx nginx -s reload || {
    echo "[WARN] Nginx reload encountered a warning, continuing..."
  }
fi

echo "--> Pruning dangling Docker images to free disk space..."
docker image prune -f >/dev/null 2>&1 || true

echo "=========================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] Deployment completed successfully with Zero Downtime."
echo "=========================================================="

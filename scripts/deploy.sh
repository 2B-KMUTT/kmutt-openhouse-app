#!/usr/bin/env bash
set -e

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

# 1. Pull latest code
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 1/3] Pulling latest changes from origin main..."
git pull origin main

# 2. Build production Docker image
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 2/3] Building Docker image kmutt_oph_prod..."
docker build -t kmutt_oph_prod .

# 3. Zero-Downtime Rolling Update (update one container at a time)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 3/3] Performing Zero-Downtime Rolling Update..."
echo "--> Updating openhouse_app_1..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps openhouse_app_1
sleep 3

echo "--> Updating openhouse_app_2..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps openhouse_app_2
sleep 3

echo "--> Updating openhouse_app_3..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps openhouse_app_3

echo "=========================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] Deployment completed successfully."
echo "=========================================================="

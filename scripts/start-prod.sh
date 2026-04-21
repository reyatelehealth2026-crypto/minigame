#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/root/.openclaw/workspace/projects/pharmacy-plus-liff-acquisition"
cd "$APP_DIR"

PORT="${PORT:-3105}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

exec ./node_modules/.bin/next start --hostname "$HOSTNAME" --port "$PORT"

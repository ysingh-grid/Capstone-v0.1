#!/usr/bin/env bash
# =============================================================================
# start.sh — Capstone full-stack launcher
# =============================================================================
# Starts all services and opens ForgeCAD studio with the AI assistant.
# Run from the project root: bash start.sh
#
# What it starts:
#   1.  Temporal worker       (background)
#   2.  FastAPI harness API   :8000 (background)
#   3.  ForgeCAD studio       :5173 (foreground, opens browser)
#
# Prerequisites:
#   - Temporal server already running  (temporal server start-dev)
#   - Langfuse Docker stack running    (docker compose up -d)
#   - .venv with project dependencies  (pip install -r requirements.txt)
#   - forgecad installed globally      (npm install -g forgecad)
#   - GEMINI_API_KEY or ANTHROPIC_API_KEY in .env
# =============================================================================

set -euo pipefail
cd "$(dirname "$0")"

WORKSPACE="${1:-$(pwd)/forgecad-workspace}"
HARNESS_PORT="${HARNESS_PORT:-8000}"
STUDIO_PORT="${STUDIO_PORT:-5173}"

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
ok()   { echo -e "  ${GREEN}✓${RESET}  $*"; }
info() { echo -e "  ${CYAN}→${RESET}  $*"; }
warn() { echo -e "  ${YELLOW}⚠${RESET}  $*"; }
die()  { echo -e "  ${RED}✗${RESET}  $*" >&2; exit 1; }

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Capstone Geometry Agent — Full Stack   ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ── Prereq checks ────────────────────────────────────────────────────────────
info "Checking prerequisites…"

# Python venv
if [ ! -f ".venv/bin/python3" ]; then
  die ".venv not found. Run: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
fi
ok "Python venv"

# Temporal
if ! lsof -ti tcp:7233 &>/dev/null; then
  warn "Temporal not detected on :7233. Start it first:"
  warn "   temporal server start-dev"
  warn "Continuing anyway — worker will retry…"
else
  ok "Temporal :7233"
fi

# forgecad CLI
if ! command -v forgecad &>/dev/null; then
  die "forgecad not found. Install: npm install -g forgecad"
fi
ok "forgecad $(forgecad --version 2>/dev/null)"

# Workspace
mkdir -p "$WORKSPACE"
ok "Workspace: $WORKSPACE"

# Re-inject assistant (idempotent — only injects if missing)
info "Checking ForgeCAD injection…"
bash scripts/inject-forgecad.sh 2>&1 | sed 's/^/      /'

echo ""

# ── Kill old processes ────────────────────────────────────────────────────────
info "Cleaning up old processes…"
lsof -ti tcp:$HARNESS_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
pgrep -f "harness.workflows.worker" 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
ok "Ports cleared"

# ── Start worker ──────────────────────────────────────────────────────────────
info "Starting Temporal worker…"
nohup .venv/bin/python3 -m harness.workflows.worker > worker.log 2>&1 &
WORKER_PID=$!
sleep 2
if kill -0 $WORKER_PID 2>/dev/null; then
  ok "Worker running (PID $WORKER_PID) — logs: worker.log"
else
  warn "Worker may have crashed — check worker.log"
fi

# ── Start FastAPI ─────────────────────────────────────────────────────────────
info "Starting Harness API on :$HARNESS_PORT…"
nohup .venv/bin/python3 -m uvicorn harness.api.app:app \
  --host 0.0.0.0 --port $HARNESS_PORT --reload > app.log 2>&1 &
API_PID=$!
sleep 3

# Health check
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$HARNESS_PORT/health 2>/dev/null)
if [ "$HTTP" = "200" ]; then
  ok "Harness API healthy (PID $API_PID) — logs: app.log"
else
  warn "API returned HTTP $HTTP — check app.log"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}═══════════════════════════════════════════${RESET}"
echo -e "${BOLD} Services ready${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════${RESET}"
echo ""
echo -e "  ${CYAN}Harness API${RESET}      http://localhost:$HARNESS_PORT"
echo -e "  ${CYAN}API docs${RESET}         http://localhost:$HARNESS_PORT/docs"
echo -e "  ${CYAN}Temporal UI${RESET}      http://localhost:8233"
echo -e "  ${CYAN}Langfuse${RESET}         http://localhost:3000"
echo ""
echo -e "  ${BOLD}${GREEN}Opening ForgeCAD studio on :$STUDIO_PORT…${RESET}"
echo -e "  ${YELLOW}Click 🤖 (bottom-right) to open the AI assistant${RESET}"
echo ""

# ── Launch ForgeCAD (foreground — CTRL+C to stop all) ────────────────────────
export FORGECAD_TOKEN="${FORGECAD_TOKEN:-fc_pat_localdev_bypass}"

# Trap CTRL+C to clean up background processes
cleanup() {
  echo ""
  info "Shutting down…"
  kill $WORKER_PID $API_PID 2>/dev/null || true
  echo -e "  ${GREEN}✓${RESET}  All services stopped"
}
trap cleanup EXIT INT TERM

forgecad studio "$WORKSPACE" --port $STUDIO_PORT

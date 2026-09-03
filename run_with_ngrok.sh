#!/usr/bin/env bash
# Bible Counselor Agent — local browser via ngrok (same strategy as dpia_agent)
# Uses NGROK_AUTHTOKEN from /workspace/npg_dpia/.env (or env var)
# Usage: ./run_with_ngrok.sh [port]  — default 8787
#        ./run_with_ngrok.sh stop   — kill tunnel + server
set -e
PORT=${1:-8787}
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="/tmp/bible-counselor.pid"
NGROK_PID="/tmp/bible-counselor-ngrok.pid"
LOG_FILE="/tmp/bible-counselor.log"
NGROK_LOG="/tmp/bible-counselor-ngrok.log"

if [ "$1" = "stop" ] || [ "$1" = "close" ]; then
  echo "Stopping Bible Counselor + ngrok..."
  [ -f "$PID_FILE" ] && kill "$(cat "$PID_FILE")" 2>/dev/null || true
  [ -f "$NGROK_PID" ] && kill "$(cat "$NGROK_PID")" 2>/dev/null || true
  pkill -f "bible-counselor.*8787" 2>/dev/null || true
  pkill -f "ngrok http.*8787" 2>/dev/null || true
  pkill -f "pyngrok" 2>/dev/null || true
  rm -f "$PID_FILE" "$NGROK_PID"
  echo "Stopped."
  exit 0
fi

# Load token same source as dpia_agent
if [ -f "/workspace/npg_dpia/.env" ]; then
  export $(grep -v '^#' /workspace/npg_dpia/.env | xargs)
fi
if [ -z "$NGROK_AUTHTOKEN" ]; then
  echo "ERROR: NGROK_AUTHTOKEN not set (expected in /workspace/npg_dpia/.env)"
  exit 1
fi

# Start server if not running
if ! curl -sf "http://localhost:$PORT/health" >/dev/null 2>&1; then
  echo "Starting Bible Counselor on :$PORT..."
  nohup bun "$BASE_DIR/src/server.js" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  sleep 2
  if ! curl -sf "http://localhost:$PORT/health" >/dev/null 2>&1; then
    echo "Server failed to start. Log:"
    cat "$LOG_FILE" | tail -n 30
    exit 1
  fi
  echo "Server running (PID $(cat $PID_FILE)) -> http://localhost:$PORT"
else
  echo "Server already running on :$PORT"
fi

# Start ngrok via pyngrok (same python strategy, no binary download flakiness)
echo "Opening ngrok tunnel..."
python3 - << PY &
import os, time
from pyngrok import ngrok, conf
token = os.environ["NGROK_AUTHTOKEN"]
conf.get_default().auth_token = token
conf.get_default().region = "eu"  # closest to Africa/Lagos, same as dpia pattern
# kill any existing
try:
    for t in ngrok.get_tunnels():
        ngrok.disconnect(t.public_url)
except: pass
# connect
url = ngrok.connect($PORT, "http", bind_tls=True)
print(f"NGROK_URL={url.public_url}", flush=True)
open("/tmp/bible-counselor-ngrok.url","w").write(url.public_url)
# keep alive
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    ngrok.disconnect(url.public_url)
PY

sleep 4
if [ -f /tmp/bible-counselor-ngrok.url ]; then
  URL=$(cat /tmp/bible-counselor-ngrok.url)
  echo ""
  echo "✅ Bible Counselor is publicly accessible:"
  echo "   $URL"
  echo "   Local: http://localhost:$PORT"
  echo "   Health: $URL/health"
  echo "   Counsel: $URL/counsel?q=cave%20of%20Adullam"
  echo ""
  echo "To close: ./run_with_ngrok.sh stop"
  echo "   or: pkill -f ngrok; kill \$(cat $PID_FILE)"
else
  echo "Waiting for ngrok..."
  sleep 3
  cat "$NGROK_LOG" 2>/dev/null || true
fi

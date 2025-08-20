#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE=".env"

is_port_free() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -lnt | awk '{print $4}' | grep -q ":$port$" && return 1 || return 0
  elif command -v netstat >/dev/null 2>&1; then
    netstat -lnt | awk '{print $4}' | grep -q ":$port$" && return 1 || return 0
  else
    # Fallback: attempt bind
    python3 - <<PY 2>/dev/null || exit 1
import socket,sys
s=socket.socket()
try:
  s.bind(("0.0.0.0", int(sys.argv[1])))
  s.close(); sys.exit(0)
except OSError:
  sys.exit(1)
PY
  fi
}

pick_free_port() {
  local start="$1"; local end="$2";
  for ((p=start; p<=end; p++)); do
    if is_port_free "$p"; then echo "$p"; return 0; fi
  done
  echo ""; return 1
}

# Load existing env if any
if [ -f "$ENV_FILE" ]; then
  echo "Using existing $ENV_FILE"
  exit 0
fi

api_port="${ECOMPTA_API_PORT:-}"
web_port="${ECOMPTA_WEB_PORT:-}"

if [ -z "$api_port" ]; then
  api_port=$(pick_free_port 18080 18999 || true)
  [ -z "$api_port" ] && api_port=28080
fi
if [ -z "$web_port" ]; then
  web_port=$(pick_free_port 18000 18079 || true)
  [ -z "$web_port" ] && web_port=28081
fi

cat > "$ENV_FILE" <<EOF
ECOMPTA_API_PORT=$api_port
ECOMPTA_WEB_PORT=$web_port
EOF

echo ".env created with ECOMPTA_API_PORT=$api_port and ECOMPTA_WEB_PORT=$web_port"
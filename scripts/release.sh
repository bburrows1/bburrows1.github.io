#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PAGES_DIR="$ROOT_DIR/pages/diggers4u"
WORKER_DIR="$ROOT_DIR/workers/diggers4u-contact"
WORKER_LOCAL_CONFIG="$WORKER_DIR/wrangler.local.toml"
WORKER_CONFIG="$WORKER_DIR/wrangler.toml"

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is required but was not found." >&2
  exit 1
fi

if [ ! -d "$PAGES_DIR" ]; then
  echo "Error: Pages directory not found: $PAGES_DIR" >&2
  exit 1
fi

if [ ! -d "$WORKER_DIR" ]; then
  echo "Error: Worker directory not found: $WORKER_DIR" >&2
  exit 1
fi

echo "Deploying Pages project from $PAGES_DIR ..."
npx wrangler pages deploy "$PAGES_DIR"

if [ -f "$WORKER_LOCAL_CONFIG" ]; then
  echo "Deploying Worker with local config: $WORKER_LOCAL_CONFIG ..."
  npx wrangler deploy --cwd "$WORKER_DIR" --config "$WORKER_LOCAL_CONFIG"
else
  echo "Deploying Worker with default config: $WORKER_CONFIG ..."
  npx wrangler deploy --cwd "$WORKER_DIR" --config "$WORKER_CONFIG"
fi

echo "Release completed."

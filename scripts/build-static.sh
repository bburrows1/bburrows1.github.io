#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/pages/diggers4u"
OUTPUT_DIR="$ROOT_DIR/dist/diggers4u"

if [ ! -d "$OUTPUT_DIR" ]; then
  echo "Error: build output directory not found: $OUTPUT_DIR" >&2
  exit 1
fi

for file in _headers robots.txt sitemap.xml 404.html error.html; do
  cp "$SOURCE_DIR/$file" "$OUTPUT_DIR/$file"
done

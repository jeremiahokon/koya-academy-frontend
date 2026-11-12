#!/usr/bin/env sh
# Renders scripts/opengraph-image.html to app/opengraph-image.jpg + app/twitter-image.jpg.
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=5000 \
  --screenshot="$TMP/og.png" "file://$PWD/scripts/opengraph-image.html"
magick "$TMP/og.png" -crop 1200x630+0+0 -strip -quality 85 src/app/opengraph-image.jpg
cp src/app/opengraph-image.jpg src/app/twitter-image.jpg
rm -rf "$TMP"

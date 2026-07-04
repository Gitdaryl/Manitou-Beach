#!/usr/bin/env bash
# optimize-gallery.sh — prep a batch of photos for a public event gallery.
#
# Usage:  ./scripts/optimize-gallery.sh <source-dir> <slug> <prefix>
# Example: ./scripts/optimize-gallery.sh ~/Desktop/july4pics july-4-2026 manitou-july-4-2026
#
# For each image in <source-dir> (filename-sorted), writes to
# public/images/galleries/<slug>/ :
#   <prefix>-NN.jpg         max 1600px — used for link previews (OG) + native share
#   <prefix>-NN.webp        max 1600px — lightbox / full view
#   thumbs/<prefix>-NN.webp max 600px  — masonry grid thumbnail
#
# After running, set  count: <N>  for this gallery in src/data/galleries.js.
set -euo pipefail

SRC="${1:?source dir required}"
SLUG="${2:?slug required}"
PREFIX="${3:?filename prefix required}"

DEST="public/images/galleries/$SLUG"
mkdir -p "$DEST/thumbs"

shopt -s nullglob nocaseglob
i=0
for f in "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.png; do
  i=$((i + 1))
  n=$(printf "%02d" "$i")
  magick "$f" -auto-orient -resize '1600x1600>' -quality 82 "$DEST/$PREFIX-$n.jpg"
  cwebp -quiet -q 80 "$DEST/$PREFIX-$n.jpg" -o "$DEST/$PREFIX-$n.webp"
  cwebp -quiet -q 75 -resize 600 0 "$DEST/$PREFIX-$n.jpg" -o "$DEST/thumbs/$PREFIX-$n.webp"
  echo "  $PREFIX-$n  <-  $(basename "$f")"
done

echo "Done: $i photo(s) -> $DEST"
echo "Now set  count: $i  for '$SLUG' in src/data/galleries.js"

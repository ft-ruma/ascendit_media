#!/usr/bin/env bash
# Encode one clip into the loop set: AV1, VP9 WebM, H.264 MP4, AVIF poster, plus a
# 720x1280 vertical crop for phones. 1280px wide, muted, 6-8 s, target < 1.5 MB.
# Usage: scripts/encode.sh in.mov [out-dir]
set -euo pipefail
in="$1"; out="${2:-./encoded}"; name="$(basename "${in%.*}")"
mkdir -p "$out"
ffmpeg -y -i "$in" -an -vf scale=1280:-2 -c:v libsvtav1 -crf 38 -preset 6 "$out/$name.av1.mp4"
ffmpeg -y -i "$in" -an -vf scale=1280:-2 -c:v libvpx-vp9 -crf 40 -b:v 0 "$out/$name.webm"
ffmpeg -y -i "$in" -an -vf scale=1280:-2 -c:v libx264 -crf 28 -preset slow -movflags +faststart "$out/$name.mp4"
ffmpeg -y -i "$in" -vframes 1 -vf scale=1280:-2 -q:v 3 "$out/$name.poster.jpg"
if command -v avifenc >/dev/null; then avifenc -q 60 "$out/$name.poster.jpg" "$out/$name.poster.avif"; fi
# Vertical crop for phones
ffmpeg -y -i "$in" -an -vf "crop=ih*9/16:ih,scale=720:-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart "$out/$name.vertical.mp4"
for f in "$out/$name".*; do
  size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
  [ "$size" -gt 1572864 ] && echo "WARN: $f is over 1.5 MB ($size bytes)"
done
echo "Done. Upload $name.mp4 to Media in Payload with the poster, then attach av1/webm/vertical under Sources."

#!/usr/bin/env bash
# Convierte las grabaciones de Playwright (tutorials/.output) en los videos que sirve el panel:
# public/tutoriales/<slug>.mp4 (H.264, sin audio, faststart) y <slug>.jpg (portada).
# Uso: pnpm tutorials -g votaciones && tutorials/build-videos.sh
set -euo pipefail
cd "$(dirname "$0")/.."
out=public/tutoriales
mkdir -p "$out"
shopt -s nullglob
found=0
for dir in tutorials/.output/votaciones.tutorial.ts-votaciones-*; do
  name=$(basename "$dir")
  slug=${name#votaciones.tutorial.ts-votaciones-?-}
  video="$dir/video.webm"
  [[ -f "$video" ]] || continue
  found=1
  ffmpeg -loglevel error -y -i "$video" -an -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p \
    -vf "scale=1280:-2" -movflags +faststart "$out/$slug.mp4"
  ffmpeg -loglevel error -y -ss 3 -i "$out/$slug.mp4" -frames:v 1 -vf "scale=960:-2" -q:v 4 "$out/$slug.jpg"
  echo "$slug: $(du -h "$out/$slug.mp4" | cut -f1)"
done
[[ $found == 1 ]] || { echo "No hay grabaciones en tutorials/.output; corre primero pnpm tutorials" >&2; exit 1; }

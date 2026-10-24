#!/usr/bin/env bash
# Convierte las grabaciones de Playwright (tutorials/.output) en los videos que sirve el panel:
# public/tutoriales/<slug>.mp4 (H.264, sin audio, faststart) y <slug>.jpg (portada).
# Uso: pnpm tutorials -g votaciones && tutorials/build-videos.sh
# Con voz (Google Text-to-Speech): TUTORIAL_VOICE=1 pnpm tutorials -g votaciones && tutorials/build-videos.sh
set -euo pipefail
cd "$(dirname "$0")/.."
out=${TUTORIALS_OUT:-public/tutoriales}
mkdir -p "$out"
shopt -s nullglob
found=0
for dir in ${TUTORIALS_SRC:-tutorials/.output}/votaciones.tutorial.ts-votaciones-*; do
  name=$(basename "$dir")
  slug=${name#votaciones.tutorial.ts-votaciones-?-}
  video="$dir/video.webm"
  [[ -f "$video" ]] || continue
  found=1
  narration="$dir/narration.json"
  if [[ -f "$narration" ]]; then
    # Voz: cada audio entra en el momento en que apareció su subtítulo (ver studio.ts).
    # La carga inicial de la página (trimMs) se recorta y la voz se corre lo mismo.
    trim=$(node -e 'console.log((require(require("path").resolve(process.argv[1])).trimMs || 0) / 1000)' "$narration")
    args=(); filters=""; n=0
    while IFS=$'\t' read -r at file; do
      args+=(-i "$file"); n=$((n + 1))
      filters+="[$n:a]adelay=${at}|${at}[a$n];"
    done < <(node -e 'const n=require(require("path").resolve(process.argv[1])); for (const c of n.clips) console.log(`${Math.max(0, c.at - (n.trimMs || 0))}\t${c.file}`)' "$narration")
    if [[ $n == 0 ]]; then
      ffmpeg -loglevel error -y -ss "$trim" -i "$video" -an -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p \
        -vf "scale=1280:-2" -movflags +faststart "$out/$slug.mp4"
    else
      mix=""; for i in $(seq 1 "$n"); do mix+="[a$i]"; done
      ffmpeg -loglevel error -y -ss "$trim" -i "$video" "${args[@]}" \
        -filter_complex "${filters}${mix}amix=inputs=$n:normalize=0,apad[aout]" \
        -map 0:v -map "[aout]" -shortest -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -vf "scale=1280:-2" \
        -c:a aac -b:a 96k -movflags +faststart "$out/$slug.mp4"
    fi
  else
    ffmpeg -loglevel error -y -i "$video" -an -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p \
      -vf "scale=1280:-2" -movflags +faststart "$out/$slug.mp4"
  fi
  # Portada: un cuadro representativo (en el de credenciales, la hoja del PDF hacia el final).
  poster_at=3
  if [[ $slug == credenciales-qr ]]; then
    poster_at=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$slug.mp4" | awk '{printf "%.1f", $1 * 0.8}')
  fi
  ffmpeg -loglevel error -y -ss "$poster_at" -i "$out/$slug.mp4" -frames:v 1 -vf "scale=960:-2" -q:v 4 "$out/$slug.jpg"
  echo "$slug: $(du -h "$out/$slug.mp4" | cut -f1)"
done
[[ $found == 1 ]] || { echo "No hay grabaciones en tutorials/.output; corre primero pnpm tutorials" >&2; exit 1; }

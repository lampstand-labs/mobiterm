#!/usr/bin/env bash
set -euo pipefail

FLAGS="--compile --production --bytecode --sourcemap"

TARGETS=(
  bun-linux-x64:mobiterm-linux-x64-gnu
  bun-linux-x64-musl:mobiterm-linux-x64-musl
  bun-linux-arm64:mobiterm-linux-arm64-gnu
  bun-linux-arm64-musl:mobiterm-linux-arm64-musl
  bun-darwin-x64:mobiterm-darwin-x64
  bun-darwin-arm64:mobiterm-darwin-arm64
)

for target in "${TARGETS[@]}"; do
  IFS=: read -r triple dir < <(echo "$target")
  bun build ./src/index.ts $FLAGS --target="$triple" --outfile "out/$dir/mobiterm"
  tar -czf "out/$dir.tar.gz" -C "out/$dir" mobiterm
done

# Package sourcemaps (deduplicate chunk map)
mkdir -p out/.sm
first_dir=
for dir in out/mobiterm-*/; do
  [[ "$dir" == out/.sm/ ]] && continue
  name=$(basename "$dir")
  mkdir -p "out/.sm/$name"
  cp "${dir}index.js.map" "out/.sm/$name/"
  if [ -z "$first_dir" ]; then
    first_dir="$dir"
  fi
done
cp "$first_dir"chunk-*.js.map out/.sm/
tar -czf out/mobiterm-sourcemaps.tar.gz -C out/.sm .
rm -rf out/.sm

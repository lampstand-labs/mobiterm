#!/usr/bin/env bash
set -euo pipefail

PUBLISH=false
if [ $# -eq 2 ] && [ "$2" = "--publish" ]; then
  PUBLISH=true
  set -- "$1"
fi

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version> [--publish]"
  echo "Example: $0 0.2.0"
  echo "  --publish  Actually publish to npm (otherwise dry-run)"
  exit 1
fi

VERSION="$1"

echo "==> Building all binaries..."

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
done

echo "==> Packaging binaries..."
for dir in out/mobiterm-*/; do
  name=$(basename "$dir")
  tar -czf "out/$name.tar.gz" -C "$dir" mobiterm
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

echo "==> Copying binaries to platform packages..."
for dir in packages/*/; do
  name=$(basename "$dir")
  mkdir -p "$dir/bin"
  cp "out/$name/mobiterm" "$dir/bin/mobiterm"
  chmod +x "$dir/bin/mobiterm"
done

echo "==> Bumping version to $VERSION..."
echo "mobiterm@$(npm version "$VERSION" --no-git-tag-version)"
for dir in packages/*/; do
  name=$(basename "$dir")
  echo "$name@$(cd "$dir" && npm version "$VERSION" --no-git-tag-version)"
done

echo "==> Publishing platform packages..."
for dir in packages/*/; do
  if [ "$PUBLISH" = true ]; then
    npm publish --access public "$dir" --provenance
  else
    npm publish --access public "$dir" --dry-run
  fi
done

if [ "$PUBLISH" = true ]; then
  npm publish --access public --provenance
else
  npm publish --access public --dry-run
  echo ""
  echo "==> Dry run complete. Review the output above."
  echo ""
  echo "To publish for real, use: bash scripts/release.sh $VERSION --publish"
  echo ""
  echo "Then: git add -A && git commit -m \"v$VERSION\" && git tag \"v$VERSION\" && git push && git push --tags"
fi

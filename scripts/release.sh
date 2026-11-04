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

# Bump BEFORE building: the version is imported from package.json and inlined
# into each compiled binary at build time, so building first would bake in the
# previous release's version.
echo "==> Bumping version to $VERSION..."
echo "mobiterm@$(npm version "$VERSION" --no-git-tag-version)"
for dir in packages/*/; do
  name=$(basename "$dir")
  echo "$name@$(cd "$dir" && npm version "$VERSION" --no-git-tag-version)"
done

echo "==> Building all binaries..."

# --sourcemap embeds each sourcemap into the executable, so release binaries
# symbolicate stack traces back to TypeScript on their own. Bun additionally
# writes a sidecar map next to the output (index.js.map before 1.4, mobiterm.map
# from 1.4 on); it is not needed at runtime and is not shipped.
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
  # Drop stale output so sidecar maps from a previous Bun version can't linger.
  rm -rf "out/$dir"
  bun build ./src/index.ts $FLAGS --target="$triple" --outfile "out/$dir/mobiterm"
done

echo "==> Packaging binaries..."
for dir in out/mobiterm-*/; do
  name=$(basename "$dir")
  tar -czf "out/$name.tar.gz" -C "$dir" mobiterm
done

echo "==> Copying binaries to platform packages..."
for dir in packages/*/; do
  name=$(basename "$dir")
  mkdir -p "$dir/bin"
  cp "out/$name/mobiterm" "$dir/bin/mobiterm"
  chmod +x "$dir/bin/mobiterm"
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

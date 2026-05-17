#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.2.0"
  exit 1
fi

VERSION="$1"

echo "==> Building all binaries..."
bash scripts/release.sh

echo "==> Copying binaries to platform packages..."
for dir in packages/*/; do
  name=$(basename "$dir")
  mkdir -p "$dir/bin"
  cp "out/$name/mobiterm" "$dir/bin/mobiterm"
  chmod +x "$dir/bin/mobiterm"
done

echo "==> Bumping version to $VERSION..."
npm version "$VERSION" --no-git-tag-version
for dir in packages/*/; do
  (cd "$dir" && npm version "$VERSION" --no-git-tag-version)
done

echo "==> Publishing platform packages..."
for dir in packages/*/; do
  npm publish --access public "$dir" --dry-run
done

echo ""
echo "==> Dry run complete. Review the output above."
echo ""
echo "To publish for real, run:"
echo "  for dir in packages/*/; do npm publish --access public \"\$dir\"; done"
echo "  npm publish --access public"
echo ""
echo "Then: git add -A && git commit -m \"v$VERSION\" && git tag \"v$VERSION\" && git push && git push --tags"

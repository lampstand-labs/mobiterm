#!/usr/bin/env bash
set -euo pipefail

REPO="lampstand-labs/mobiterm"
VERSION="${VERSION:-latest}"
BINDIR="${BINDIR:-$HOME/.local/bin}"

if [ "$VERSION" = "latest" ]; then
  api="https://api.github.com/repos/$REPO/releases/latest"
  if command -v curl &>/dev/null; then
    VERSION=$(curl -fsSL "$api" | grep '"tag_name"' | cut -d'"' -f4)
  elif command -v wget &>/dev/null; then
    VERSION=$(wget -qO- "$api" | grep '"tag_name"' | cut -d'"' -f4)
  else
    echo "need curl or wget"
    exit 1
  fi
fi

os=$(uname -s | tr '[:upper:]' '[:lower:]')
arch=$(uname -m)

case "$arch" in
  x86_64)  arch="x64" ;;
  aarch64|arm64) arch="arm64" ;;
  *) echo "unsupported architecture: $arch"; exit 1 ;;
esac

case "$os" in
  linux)
    libc=$(ldd --version 2>&1 | head -1 | grep -qi musl && echo "musl" || echo "gnu")
    target="mobiterm-linux-${arch}-${libc}"
    ;;
  darwin)
    target="mobiterm-darwin-${arch}"
    ;;
  *)
    echo "unsupported os: $os"
    exit 1
    ;;
esac

url="https://github.com/$REPO/releases/download/$VERSION/$target.tar.gz"

if command -v curl &>/dev/null; then
  curl -fsSL "$url" | tar -xz -C /tmp
elif command -v wget &>/dev/null; then
  wget -qO- "$url" | tar -xz -C /tmp
else
  echo "need curl or wget"
  exit 1
fi

install /tmp/mobiterm "$BINDIR/mobiterm"
rm -f /tmp/mobiterm

echo "installed mobiterm to $BINDIR/mobiterm"

if [[ ":$PATH:" != *":$BINDIR:"* ]]; then
  rc=""
  case "$SHELL" in
    *zsh)  rc="$HOME/.zshrc" ;;
    *bash) rc="$HOME/.bashrc" ;;
    *fish) rc="$HOME/.config/fish/config.fish" ;;
  esac
  echo "$BINDIR is not in PATH"
  if [ -n "$rc" ]; then
    echo "add to $rc:"
    echo "  export PATH=\"\$PATH:$BINDIR\""
    echo "then run: source $rc"
  else
    echo "add $BINDIR to your PATH"
  fi
fi

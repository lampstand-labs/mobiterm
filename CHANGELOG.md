# Changelog

## v0.2.2

### New Features

- Added `--version` / `-v` CLI flag, printing the package name and version

### Fixes

- Soft keyboard no longer dismissed when tapping toolbar buttons on iOS 27
- Top blur no longer misrendered on iOS 27

### Docs

- Expanded README with screenshots and reorganized installation, usage, and BYOT sections

### Build

- Version bump commit is now pushed alongside the release tag
- Release binaries embed their sourcemaps, so the separate sourcemaps tarball is no longer published; stack traces resolve to the original TypeScript on their own

## v0.2.1

### Fixes

- Escape sequences in toolbar buttons no longer mangled by the bundler — Esc, Tab, ^C, and other control characters now send the correct terminal codes

### Build

- Added GitHub Actions release workflow with npm trusted publishing and Homebrew formula auto-update

## v0.2.0

### Breaking Changes

- Push notification endpoints (`subscribe`, `unsubscribe`, `send`) now mounted under `/api/` prefix

### New Features

- Focus a specific tmux pane from push notification data via the `tmuxPane` field

### Refactors

- Consolidated `standardHandler`, `fitTerminal`, and `focusTerminal` into a single `terminalHandler` object
- Removed all `useCallback` wrappers from `ToolBar`
- Moved `hasTmux` fetch from `App` to `ToolBar`

### Fixes

- Top padding hidden on iPad after resize
- tmux `default-terminal` now uses `-s` (server option) instead of `-g`
- Fixed default port in README

### Build

- Consolidated build and release scripts
- `install.sh` now creates target directory if missing
- Added keywords to `package.json`
- Release script and version-bump logging fixes

## v0.1.0

Initial release.

### Features

- WebSocket-based PTY with xterm.js frontend
- tmux integration (auto-attaches to `tmux -L mobiterm new -A -s <identifier>`)
- Falls back to user's `$SHELL` when tmux is not installed
- Touch scroll support with correct x/y coordinate handling
- Native keyboard via TextInput component for reliable typing and pasting
- Toolbar with Esc, Tab, Ctrl, and arrow keys for tmux window navigation
- Ctrl key with latch support (tap to latch, hold for momentary)
- Auto-port selection (default 7130, increments on conflict unless `--port` is specified)
- PWA manifest, meta tags, and icons for install-to-homescreen support
- Safe-area inset handling for notched/rounded displays
- Visual viewport handling for docked vs floating keyboard on iOS
- Web push notifications with VAPID key auto-generation

### Build

- Cross-platform release script
- npm publish setup
- Install script for end users

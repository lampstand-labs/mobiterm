# mobiTerm

A mobile-first web terminal for remote access from any device.

## Features

- **Mobile-first** - Touch-optimized interface with support for gestures, scroll, and on-screen keyboards
- **Full terminal emulation** - Powered by xterm.js with support for tmux
- **Web push notifications** - Get notified when processes complete
- **WebSocket-based** - Low-latency, bidirectional communication

## Installation

<details open>
<summary>curl</summary>

```bash
curl -fsSL https://github.com/lampstand-labs/mobiterm/raw/main/scripts/install.sh | bash
```

</details>

<details>
<summary>Homebrew</summary>

```bash
brew install lampstand-labs/tap/mobiterm
```

</details>

<details>
<summary>npm</summary>

```bash
npm install -g @lampstand-labs/mobiterm
```

</details>

<details>
<summary>Manual</summary>

Download the latest release for your platform from the [releases page](https://github.com/lampstand-labs/mobiterm/releases), extract the archive, and move the `mobiterm` binary to a directory in your `PATH`:

```bash
tar xzf mobiterm-*.tar.gz
sudo mv mobiterm /usr/local/bin/
# or without sudo:
# mkdir -p ~/.local/bin && mv mobiterm ~/.local/bin/
```

</details>

## Usage

```
mobiterm [--port <port>] [--vapid-contact <email>] <identifier>
```

- `<identifier>` - A unique name for this instance (used for tmux session and push notification)
- `--port` - Port to listen on (default: 3000)
- `--vapid-contact` - Contact email for VAPID push notifications

## BYOT (bring-your-own-tunnel)

mobiTerm doesn't handle NAT traversal or expose itself to the internet. Run it locally and use your own tunnel (e.g. Tailscale, Microsoft devtunnel) to make it accessible from anywhere.

## How it works

mobiTerm spawns a tmux session (or falls back to a plain shell) on your machine and exposes it over a WebSocket. The frontend (React + xterm.js) renders the terminal in the browser with mobile-friendly touch handling. Optional web push notifications alert you when a long-running command finishes.

## License

MIT

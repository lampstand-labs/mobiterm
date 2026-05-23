<p align="center">
  <img src="https://wsrv.nl/?url=https://raw.githubusercontent.com/lampstand-labs/mobiterm/refs/heads/main/src/client/assets/icon-180.png&mask=circle" alt="mobiTerm Logo" width="90"/>
</p>

<h1 align="center">mobiTerm</h1>
<p align="center">
  <strong>A mobile-first web terminal for remote access from any device.</strong>
</p>

<p align="center">
  <table>
    <tr>
      <td><img width="150" alt="scrolling" src="https://github.com/user-attachments/assets/6437ef00-fc7f-484a-bd64-34505c793a9b" /></td>
      <td><img width="150" alt="copy" src="https://github.com/user-attachments/assets/9b9d4582-df54-4951-909c-4549ba98f862" /></td>
      <td><img width="150" alt="paste" src="https://github.com/user-attachments/assets/39afc05a-5903-497b-b4f9-31c5fa27fa78" /></td>
      <td><img width="150" alt="push notification" src="https://github.com/user-attachments/assets/f3b93565-e035-41af-ab12-35f9a56f0964" /></td>
    </tr>
    <tr>
      <td align="center">Scroll</td>
      <td align="center">Copy</td>
      <td align="center">Paste</td>
      <td align="center">Push Notification</td>
    </tr>
  </table>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-bring-your-own-tunnel">BYOT</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-faq">FAQ</a>
</p>

<p align="center">
  <a href="https://github.com/lampstand-labs/mobiterm/releases"><img src="https://img.shields.io/github/v/release/lampstand-labs/mobiterm?color=blue" alt="Version"/></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"/></a>
  <img src="https://img.shields.io/badge/PWA-ready-purple.svg" alt="PWA"/>
</p>

---

## ✨ Why mobiTerm?

**mobiTerm** is an open-source, mobile-first web terminal that lets you connect to your computer easily.

Designed for developers running AI agents on the go (e.g. **Claude Code**, **Codex**, **opencode**, **Pi**).

---

## 🎯 Features

|                                |                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| 📱 **Mobile-First**            | Touch-optimized interface with gestures, scroll, and on-screen toolbar (Ctrl, Esc, Tab, arrows) |
| 🏗️ **Zero Install Client**     | Open a URL — no app, no client setup on the device                                              |
| 🔔 **Push Notifications**      | Get notified when long-running commands finish (even when the tab is closed)                    |
| ♻️ **Persistent Sessions**     | Pick up where you left off instantly                                                            |
| 🖥️ **Full Terminal Emulation** | 256-color, Unicode, and tmux support via xterm.js                                               |
| 📲 **PWA Support**             | Install as a standalone app on iOS and Android                                                  |
| 📦 **Multi-Platform Binary**   | Native builds for Linux (x64/arm64) and macOS (x64/arm64)                                       |

---

## 🚀 Installation (Linux / macOS)

<details open>
<summary><strong>curl</strong></summary>

```bash
curl -fsSL https://github.com/lampstand-labs/mobiterm/raw/main/scripts/install.sh | bash
```

</details>

<details>
<summary><strong>Homebrew</strong></summary>

```bash
brew install lampstand-labs/tap/mobiterm
```

</details>

<details>
<summary><strong>npm</strong></summary>

```bash
npm install -g @lampstand-labs/mobiterm
```

</details>

<details>
<summary><strong>Manual</strong> (from releases)</summary>

Download the latest release for your platform from the [releases page](https://github.com/lampstand-labs/mobiterm/releases), extract the archive, and move the `mobiterm` binary to a directory in your `PATH`:

```bash
tar xzf mobiterm-*.tar.gz
sudo mv mobiterm /usr/local/bin/
# or without sudo:
# mkdir -p ~/.local/bin && mv mobiterm ~/.local/bin/
```

</details>

---

## 📡 Usage

```bash
mobiterm [--port <port>] [--vapid-contact <email>] <identifier>
```

| Argument          | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `<identifier>`    | Unique name for this instance (used for tmux session and push notification)    |
| `--port`          | Port to listen on (default: `7130`)                                            |
| `--vapid-contact` | Contact email for VAPID push notifications (default: `admin@<identifier>.com`) |

Start mobiTerm, set up your tunnel, then open `https://<your-host>:7130` in any browser.

---

## 🔌 Bring Your Own Tunnel

mobiTerm doesn't handle NAT traversal or TLS — it runs locally and expects you to bring your own tunnel. This keeps the tool simple and lets you use whatever auth and encryption layer you already trust.

| Tunnel                  | Why use it                                                   |
| ----------------------- | ------------------------------------------------------------ |
| **Tailscale**           | Zero-config mesh VPN, free for personal use                  |
| **Microsoft devtunnel** | Quick ephemeral tunnels, secured by GitHub/Microsoft account |

---

## 🧠 How It Works

mobiTerm spawns a **tmux** session (or falls back to a plain shell) on your machine and exposes it over a **WebSocket**. The frontend — built with **React** and **xterm.js** — renders the terminal in the browser with mobile-friendly touch handling. Optional **VAPID web push notifications** alert you when a long-running command finishes.

```
Browser ←→ WebSocket ←→ Bun Server ←→ tmux / Shell
```

---

## ❓ FAQ

<details>
<summary><strong>Push notifications aren't working</strong></summary>

Ensure your tunnel serves over **HTTPS**. On iOS, you also need to **add mobiTerm to your Home Screen** (Share → Add to Home Screen) — iOS only allows push notifications from installed PWAs.

</details>

<details>
<summary><strong>Can I run multiple instances on one computer?</strong></summary>

Yes. If the default port (7130) is already in use, mobiTerm automatically selects the next available port. You can also specify a port explicitly with `--port`.

</details>

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**mobiTerm** — A mobile-first web terminal for remote access from any device.

[📖 GitHub](https://github.com/lampstand-labs/mobiterm) · [🐛 Report Bug](https://github.com/lampstand-labs/mobiterm/issues) · [💡 Request Feature](https://github.com/lampstand-labs/mobiterm/issues) · [⬇️ Releases](https://github.com/lampstand-labs/mobiterm/releases)

</div>

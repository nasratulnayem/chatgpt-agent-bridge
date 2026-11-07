# ChatGPT Bridge: Universal Browser Extension + Agent Package

A zero-friction, cross-platform architecture that allows any user on **Windows, macOS, or Linux** to install a single Chrome/Brave/Edge extension, pair with Antigravity (or Claude, Cursor, Codex), and control their logged-in ChatGPT account for automated image generation, file editing, and media downloads without API keys.

---

## 1. The Core Vision & Frictionless UX

```text
[ Any Computer: Windows / Mac / Linux ]
  │
  ├── 1. User loads Chrome Extension (From Store / Zip)
  │      └── Extension generates a 6-Character Pairing Code (e.g., "AGY-789")
  │
  ├── 2. User tells Antigravity:
  │      "Connect to code AGY-789"
  │
  └── 3. Antigravity can now:
         - Open / read any ChatGPT chat
         - Send prompts with images/videos attached
         - Edit existing images
         - Auto-download generated media directly to local folders
```

---

## 2. Recommended Production Architecture

To make this work across different machines, laptops, and remote locations with zero firewall configuration:

### Component A: Chrome Web Extension (Manifest V3)
- **Role**: Sits inside the user's browser, acts as the hands and eyes on `chatgpt.com`.
- **Packaging**: Single `.crx` file or published on Chrome Web Store (Free).
- **Capabilities**:
  - Direct DOM automation on `chatgpt.com` (ProseMirror composer, upload dropzone, stop button, canvas).
  - Fetches original media blobs via browser session cookies (`credentials: 'include'`).
  - WebRTC DataChannel / Relay WebSocket client for secure peer-to-peer pairing.

### Component B: Agent Skill & MCP Package (`npx @chatgpt-bridge/mcp`)
- **Role**: The Antigravity / AI Agent plugin that provides tools to the LLM.
- **Distribution**: Published to npm (or GitHub). The user never has to build or compile anything.
- **Command**:
  ```bash
  npx chatgpt-bridge-mcp --connect AGY-789
  ```

### Component C: Zero-Config Cloud Relay (Free Tier / Serverless)
- To connect a remote laptop to Antigravity without local port forwarding:
- A free open-source WebRTC signaling server (e.g., Cloudflare Workers or free Railway/Fly.io instance) that pairs the browser extension and Antigravity securely using end-to-end encryption.

---

## 3. Toolset Exposed to Antigravity

| Tool Name | What Antigravity Does |
|---|---|
| `chatgpt_open_or_focus` | Opens `chatgpt.com` or focuses an existing conversation. |
| `chatgpt_list_conversations` | Scrapes current thread titles, URLs, and active conversation IDs. |
| `chatgpt_switch_conversation` | Switches to a specific chat (e.g., Storyboard Part 2). |
| `chatgpt_generate_image` | Types prompt into ChatGPT native composer and triggers generation. |
| `chatgpt_edit_image` | Selects a previously generated image on the page, enters edit mode, and applies modification prompt. |
| `chatgpt_upload_references` | Attaches one or more local reference images/videos to the composer. |
| `chatgpt_download_media` | Captures the original full-res generated image/video and saves it to a designated local path. |
| `chatgpt_stop_generation` | Clicks the native Stop button to halt generation. |

---

## 4. What This Achieves

1. **100% Free**: No OpenAI API billing, no token limits beyond whatever your normal browser account already allows.
2. **Cross-Platform**: Works identically on Windows, MacBook, iMac, Linux laptops.
3. **Zero Native Build Dependencies**: No Visual Studio C++, Python gyp, or heavy Electron binaries needed on the target machine.
4. **Total Portability**: When you move to another computer, you simply load the extension in Chrome and give Antigravity the connection link or run `npx chatgpt-bridge-mcp`.

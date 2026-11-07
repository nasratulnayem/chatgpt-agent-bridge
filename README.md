# ChatGPT Agent Bridge 🤖⚡

> **The Universal Agent Bridge connecting Antigravity Cortex, Claude Desktop, Cursor, and Autonomous Coding Agents directly to your active ChatGPT Web session.**

Developed by **[Nasratul Nayem](https://nasratulnayem.github.io)** · [Product Documentation & Licensing](https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/)

---

## 🌟 Overview

**ChatGPT Agent Bridge** bridges the gap between local AI developer tools (Antigravity Cortex, Claude, Cursor IDE) and the official ChatGPT Web interface. It allows external AI agents to:
- 🎨 **Generate high-resolution images & storyboards** directly via ChatGPT (4o / DALL-E) without burning expensive API credits.
- 📥 **Auto-download raw high-res artwork** into your local disk pipeline.
- 💬 **Control active conversations, prompt iterations, and visual editing** directly from your terminal or AI IDE.
- 🔄 **Fully automated WebSocket MCP Architecture** running locally with complete privacy.

---

## ⚡ Instant Setup (30 Seconds)

### 1. Run the MCP Bridge Server
Run directly with `npx` (no manual clone required):
```bash
npx @codex.nayem/chatgpt-agent-bridge
```
Or install globally:
```bash
npm install -g @codex.nayem/chatgpt-agent-bridge
chatgpt-agent-bridge
```

### 2. Load the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right switch).
3. Click **Load unpacked** and select the extension folder or download from [our official release page](https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/).
4. You will see **"ON"** in emerald green on the extension badge when connected to the local bridge!

---

## 🔌 Connecting to Antigravity Cortex / Claude Desktop

Add this configuration to your `mcp_servers` configuration (e.g. `claude_desktop_config.json` or Antigravity config):

```json
{
  "mcpServers": {
    "chatgpt-studio": {
      "command": "npx",
      "args": ["-y", "@codex.nayem/chatgpt-agent-bridge"]
    }
  }
}
```

---

## 💎 Licensing & Commercial Pro Version

The **Pro License** unlocks:
- Multi-computer remote relay support
- Unlimited automated batch storyboard generations
- Continuous visual feedback & prompt iteration loops
- Lifetime updates & priority VIP developer support

Get your license or start a 7-day trial at:  
👉 **[https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/](https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/)**

---

© 2026 Nasratul Nayem. All rights reserved.

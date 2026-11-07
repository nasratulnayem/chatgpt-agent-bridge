# ChatGPT Agent Bridge 🤖⚡

> **Connect your local AI coding agents directly to your open ChatGPT Web session. No OpenAI API keys, no per-token charges, and no manual copy-pasting.**

Developed by **[Nasratul Nayem](https://nasratulnayem.github.io)** · [Read the Full Story](https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/)

---

## 💡 The Real Story Behind This Tool

I already pay **$20 a month for ChatGPT Plus**. Every time my autonomous coding agent needed to generate an image, test a prompt, or build a 16-frame video storyboard, I had two bad choices:

1. **Pay expensive OpenAI API bills** per token and per image generation, completely separate from my personal web subscription.
2. **Do the annoying manual copy-paste loop:** Open ChatGPT in Chrome, write the prompt, wait, right-click the image, click "Save As", rename it, move it to my project folder, notice a character clothing mismatch, and repeat the whole thing 16 times.

So I asked myself: **Why can't my AI agents simply use the ChatGPT session I already have open in my browser?**

I built **ChatGPT Agent Bridge** to solve my own frustration. Now, my agent (Google Antigravity Cortex, Claude Desktop, Cursor) controls the ChatGPT tab itself, writes the prompts, inspects the responses, self-tests visual character continuity, and downloads 100% raw uncompressed PNGs straight to my hard drive.

---

## 🚀 100% Free & Open Source

This tool is completely free for any developer or creator to use.

### 1. Run the MCP Bridge Server
Run directly with `npx` (no cloning or manual build required):
```bash
npx @codex.nayem/chatgpt-agent-bridge
```
Or install globally:
```bash
npm install -g @codex.nayem/chatgpt-agent-bridge
chatgpt-agent-bridge
```

### 2. Connect Your AI Agent (Standard MCP)
Add this to your `claude_desktop_config.json` or `antigravity.json`:

```json
{
  "mcpServers": {
    "chatgpt-bridge": {
      "command": "npx",
      "args": ["-y", "@codex.nayem/chatgpt-agent-bridge"]
    }
  }
}
```

### 3. Load the Chrome Extension
1. Open Google Chrome and go to `chrome://extensions/`
2. Turn on **Developer mode** (top right switch).
3. Click **Load unpacked** and select the extension folder (or get it from the [Chrome Web Store](https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/)).
4. Open `chatgpt.com` in your browser.
5. The extension badge will glow **"ON"** in green. Your AI agent can now control ChatGPT automatically!

---

## ✨ Why It Feels Better Than the Official API

- **Zero Token Overhead:** Uses your existing ChatGPT Plus or Team web subscription.
- **Autonomous Prompt & Re-Prompt Loops:** If a storyboard frame doesn't match your character's clothes or camera angle, your agent sees it, writes a corrective instruction, and re-generates it automatically.
- **Full Uncompressed Raw PNGs:** Saves full-resolution images straight to your local project folders.
- **Complete Local Privacy:** Operates entirely on `127.0.0.1:3456`. Zero third-party cloud relays.

---

## 🛠️ Architecture

```
[ AI Agent: Antigravity Cortex / Claude / Cursor ]
                     │
          (Model Context Protocol - Stdio)
                     │
          [ Local Node.js Bridge Daemon ]
                     │
          (WebSocket on 127.0.0.1:3456)
                     │
          [ Chrome Companion Extension ]
                     │
        (DOM Automation & Content Script)
                     │
              [ chatgpt.com Tab ]
```

---

## 📄 License

MIT License — 100% Free for everyone. Created with ❤️ by [Nasratul Nayem](https://nasratulnayem.github.io).

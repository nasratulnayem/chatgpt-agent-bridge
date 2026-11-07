#!/usr/bin/env node

/**
 * @codex.nayem/chatgpt-agent-bridge
 * Universal CLI & MCP Daemon bridge for ChatGPT Browser Extension & AI Agents (Antigravity Cortex, Claude, Cursor)
 * Author: Nasratul Nayem (https://nasratulnayem.github.io)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.resolve(__dirname, '../mcp/server.js');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  🤖 ChatGPT Agent Bridge CLI
  Author: Nasratul Nayem (https://nasratulnayem.github.io/tools/chatgpt-agent-bridge/)
  
  Usage:
    npx @codex.nayem/chatgpt-agent-bridge [options]

  Options:
    --port <number>   Custom WebSocket port for Chrome Extension (default: 3456)
    --help, -h        Show this help message
    --version, -v     Show current version
  `);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log("1.0.0");
  process.exit(0);
}

console.log("🚀 Starting ChatGPT Agent Bridge MCP Server...");
import('../mcp/server.js');

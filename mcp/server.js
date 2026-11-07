import http from 'http';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';

const HTTP_PORT = 3456;
let extensionSocket = null;
let pendingRequests = new Map();
let requestIdCounter = 1;

// 1. Create HTTP & WebSocket Server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', extensionConnected: !!extensionSocket }));
    return;
  }

  if (req.url === '/api/call' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { action, payload } = JSON.parse(body);
        const result = await callExtension(action, payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.error('[ChatGPT Bridge Host] Chrome Extension connected via WebSocket!');
  extensionSocket = ws;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg);
      }
    } catch (e) {
      console.error('[ChatGPT Bridge Host] Error parsing extension message:', e);
    }
  });

  ws.on('close', () => {
    console.error('[ChatGPT Bridge Host] Chrome Extension disconnected');
    if (extensionSocket === ws) extensionSocket = null;
  });
});

server.listen(HTTP_PORT, '127.0.0.1', () => {
  console.error(`[ChatGPT Bridge Host] Listening on http://127.0.0.1:${HTTP_PORT}`);
});

// Helper: send command to Chrome extension
export function callExtension(action, payload = {}, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    if (!extensionSocket || extensionSocket.readyState !== 1) {
      return reject(new Error('ChatGPT Chrome Extension is not connected. Please open Chrome with the ChatGPT tab open.'));
    }

    const id = requestIdCounter++;
    const timer = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Timeout waiting for extension action: ${action}`));
      }
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve: (data) => {
        clearTimeout(timer);
        resolve(data);
      },
      reject
    });

    extensionSocket.send(JSON.stringify({ id, action, payload }));
  });
}

// 2. Define MCP Tools
const TOOLS = [
  {
    name: 'chatgpt_get_auth_status',
    description: 'Check if your active Chrome ChatGPT web tab is logged in and ready.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'chatgpt_list_conversations',
    description: 'List accessible conversation threads from your active ChatGPT web sidebar.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'chatgpt_open_conversation',
    description: 'Open or switch to a specific conversation thread by its ID in ChatGPT.',
    inputSchema: {
      type: 'object',
      properties: {
        chatgptId: { type: 'string', description: 'The conversation ID (e.g. 6aef2a1a-dacc-83ee-9ae5-f240c8a63348)' }
      },
      required: ['chatgptId']
    }
  },
  {
    name: 'chatgpt_get_current_conversation',
    description: 'Get the currently active conversation title and URL in your ChatGPT tab.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'chatgpt_send_message',
    description: 'Send a prompt or message to your current ChatGPT web session.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text message or image generation prompt' },
        thinkingLevel: { type: 'string', description: 'Optional thinking level (fast, balanced, advanced, ultra, pro, gpt-5.5)' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'chatgpt_stop_message',
    description: 'Click the Stop button on ChatGPT web to interrupt generation.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'chatgpt_add_photo_or_video',
    description: 'Upload a local photo or video into the ChatGPT composer.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Local path of the photo/video to attach' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'chatgpt_download_generated_media',
    description: 'Download the newly generated photos or videos from ChatGPT web into a local folder.',
    inputSchema: {
      type: 'object',
      properties: {
        destinationFolder: { type: 'string', description: 'Directory to save the media' },
        filename: { type: 'string', description: 'Target filename (e.g. frame-001.png or video.mp4)' }
      },
      required: ['destinationFolder', 'filename']
    }
  },
  {
    name: 'chatgpt_trigger_voice',
    description: 'Activate Voice Mode in the ChatGPT web interface.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'chatgpt_explore_plugins_library',
    description: 'Open and explore the GPTs and Plugins library in ChatGPT web.',
    inputSchema: { type: 'object', properties: {} }
  }
];

// 3. Handle Tool Calls
async function handleToolCall(name, args) {
  switch (name) {
    case 'chatgpt_get_auth_status': {
      const res = await callExtension('get_auth_status');
      return res.data;
    }

    case 'chatgpt_list_conversations': {
      const res = await callExtension('list_conversations');
      return res.data;
    }

    case 'chatgpt_open_conversation': {
      const res = await callExtension('open_conversation', { chatgptId: args.chatgptId });
      return res;
    }

    case 'chatgpt_get_current_conversation': {
      const res = await callExtension('get_current_conversation');
      return res.data;
    }

    case 'chatgpt_send_message': {
      const res = await callExtension('send_prompt', { prompt: args.prompt, thinkingLevel: args.thinkingLevel });
      return res.data;
    }

    case 'chatgpt_stop_message': {
      const res = await callExtension('stop_message');
      return res.data;
    }

    case 'chatgpt_add_photo_or_video': {
      const fullPath = path.resolve(args.filePath);
      if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${fullPath}`);
      const buf = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const mime = ext === '.mp4' ? 'video/mp4' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
      const fileData = [{
        name: path.basename(fullPath),
        type: mime,
        base64: buf.toString('base64')
      }];
      const res = await callExtension('upload_files', { files: fileData });
      return res.data;
    }

    case 'chatgpt_download_generated_media': {
      const imgRes = await callExtension('get_images');
      const vidRes = await callExtension('get_videos');
      const images = imgRes.data || [];
      const videos = vidRes.data || [];

      const targetSrc = (videos.length > 0 ? videos[videos.length - 1].src : null) ||
                        (images.length > 0 ? images[images.length - 1].src : null);

      if (!targetSrc) {
        throw new Error('No generated image or video found on current ChatGPT page.');
      }

      const mediaRes = await callExtension('fetch_media_base64', { src: targetSrc });
      const base64Data = mediaRes.data.dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      if (!fs.existsSync(args.destinationFolder)) {
        fs.mkdirSync(args.destinationFolder, { recursive: true });
      }
      const outPath = path.join(args.destinationFolder, args.filename);
      fs.writeFileSync(outPath, buffer);

      return {
        status: 'saved',
        path: outPath,
        size: buffer.length,
        type: mediaRes.data.type
      };
    }

    case 'chatgpt_trigger_voice': {
      const res = await callExtension('trigger_voice');
      return res.data;
    }

    case 'chatgpt_explore_plugins_library': {
      const res = await callExtension('explore_plugins');
      return res.data;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// 4. Stdio JSON-RPC MCP Server Protocol
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'chatgpt-bridge-extension-mcp', version: '1.0.0' }
      });
      return;
    }

    if (method === 'notifications/initialized') return;

    if (method === 'tools/list') {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    if (method === 'tools/call') {
      const toolName = params.name;
      const toolArgs = params.arguments || {};
      try {
        const result = await handleToolCall(toolName, toolArgs);
        sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        });
      } catch (err) {
        sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify({ error: err.message }, null, 2) }],
          isError: true
        });
      }
      return;
    }

    sendResponse(id, { error: { code: -32601, message: 'Method not found' } });
  } catch (err) {
    console.error('MCP Parsing Error:', err);
  }
});

function sendResponse(id, result) {
  if (id === undefined || id === null) return;
  const res = {
    jsonrpc: '2.0',
    id,
    ...(result.error ? { error: result.error } : { result })
  };
  process.stdout.write(JSON.stringify(res) + '\n');
}

console.error('[ChatGPT Extension MCP Server] Ready on Stdio & Port 3456');

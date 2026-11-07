/**
 * ChatGPT Bridge Extension - Background Service Worker
 * Maintains WebSocket / HTTP bridge with local Antigravity Cortex & MCP Server
 */

const BRIDGE_WS_URL = "ws://127.0.0.1:3456/extension-bridge";
let bridgeSocket = null;
let isConnecting = false;

function connectBridge() {
  if (bridgeSocket) {
    if (bridgeSocket.readyState === WebSocket.OPEN || bridgeSocket.readyState === WebSocket.CONNECTING) {
      return;
    }
  }

  if (isConnecting) return;
  isConnecting = true;

  try {
    bridgeSocket = new WebSocket(BRIDGE_WS_URL);

    bridgeSocket.onopen = () => {
      isConnecting = false;
      console.log("[ChatGPT Bridge] Connected to Antigravity Cortex / MCP Server on :3456");
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
    };

    bridgeSocket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        const { id, action, payload } = message;
        const response = await dispatchToChatGPTTab(action, payload);
        if (bridgeSocket && bridgeSocket.readyState === WebSocket.OPEN) {
          bridgeSocket.send(JSON.stringify({ id, ...response }));
        }
      } catch (err) {
        console.error("[ChatGPT Bridge] Error processing message:", err);
      }
    };

    bridgeSocket.onclose = () => {
      isConnecting = false;
      chrome.action.setBadgeText({ text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ color: "#6b7280" });
      bridgeSocket = null;
    };

    bridgeSocket.onerror = () => {
      isConnecting = false;
      bridgeSocket = null;
    };
  } catch (e) {
    isConnecting = false;
  }
}

// Find or open ChatGPT tab
async function getChatGPTTab() {
  const tabs = await chrome.tabs.query({ url: "*://chatgpt.com/*" });
  if (tabs.length > 0) {
    // Prefer the active tab if multiple
    const active = tabs.find(t => t.active);
    return active || tabs[0];
  }
  return await chrome.tabs.create({ url: "https://chatgpt.com/", active: false });
}

// Ensure content script is injected even if tab was open before extension install
async function ensureContentScriptInjected(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (e) {
    // Already injected or unable
  }
}

async function dispatchToChatGPTTab(action, payload = {}) {
  const tab = await getChatGPTTab();
  if (!tab || !tab.id) {
    return { ok: false, error: "No ChatGPT tab available" };
  }

  if (action === "open_conversation") {
    const url = payload.chatgptId ? `https://chatgpt.com/c/${payload.chatgptId}` : "https://chatgpt.com/";
    await chrome.tabs.update(tab.id, { url });
    await new Promise(r => setTimeout(r, 2000));
    await ensureContentScriptInjected(tab.id);
    return { ok: true, url };
  }

  if (action === "switch_tab") {
    await chrome.tabs.update(tab.id, { active: true });
    return { ok: true };
  }

  // First try sending message
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { action, payload }, async (res) => {
      if (chrome.runtime.lastError) {
        // Tab was likely loaded before extension was loaded: inject content script on the fly!
        await ensureContentScriptInjected(tab.id);
        // Retry message
        chrome.tabs.sendMessage(tab.id, { action, payload }, (resRetry) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(resRetry || { ok: true });
          }
        });
      } else {
        resolve(res || { ok: true });
      }
    });
  });
}

// Handle periodic check via alarms (standard Manifest V3 persistence)
chrome.alarms.create("keepAlive", { periodInMinutes: 0.1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    connectBridge();
  }
});

chrome.runtime.onInstalled.addListener(() => connectBridge());
chrome.runtime.onStartup.addListener(() => connectBridge());
connectBridge();

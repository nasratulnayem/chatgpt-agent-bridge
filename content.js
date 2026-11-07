/**
 * ChatGPT Bridge Extension - Content Script
 * Injected into chatgpt.com to execute actions directly on behalf of Antigravity & AI Agents:
 * - Read/browse conversations
 * - Add photos/videos/attachments
 * - Submit prompts
 * - Stop generation
 * - Download generated images and videos
 * - Trigger voice mode
 * - Explore GPTs / plugins library
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, payload } = request;

  handleAgentAction(action, payload)
    .then(result => sendResponse({ ok: true, data: result }))
    .catch(err => sendResponse({ ok: false, error: err.message }));

  return true; // async response
});

async function handleAgentAction(action, payload = {}) {
  switch (action) {
    case "get_auth_status":
      return getAuthStatus();

    case "list_conversations":
      return listConversations();

    case "get_current_conversation":
      return getCurrentConversation();

    case "send_prompt":
      return submitPrompt(payload.prompt, payload.thinkingLevel);

    case "stop_message":
      return stopGeneration();

    case "upload_files":
      return uploadFiles(payload.files); // array of { name, type, base64 }

    case "get_images":
      return getGeneratedImages();

    case "get_videos":
      return getGeneratedVideos();

    case "fetch_media_base64":
      return fetchMediaBase64(payload.src);

    case "trigger_voice":
      return triggerVoiceMode();

    case "explore_plugins":
      return explorePluginsLibrary();

    default:
      throw new Error(`Unknown bridge action: ${action}`);
  }
}

function getAuthStatus() {
  const text = document.body ? document.body.innerText : "";
  const isLoggedOut = (text.includes("Log in") && text.includes("Sign up")) ||
                      (text.includes("登录") && text.includes("免费注册"));
  const hasComposer = !!document.querySelector(
    'div#prompt-textarea[contenteditable="true"], [contenteditable="true"][role="textbox"], textarea[aria-label*="ChatGPT"]'
  );
  const profileEl = document.querySelector(
    'button[aria-label*="profile"], button[aria-label*="Profile"], button[id*="profile"], button[data-testid*="user-menu"]'
  );

  return {
    loggedIn: !isLoggedOut && (!!profileEl || hasComposer),
    hasComposer,
    title: document.title,
    url: window.location.href
  };
}

function listConversations() {
  const items = [];
  const links = Array.from(document.querySelectorAll('a[href^="/c/"], div[data-sidebar-chatgpt-conversation-key] a'));
  for (const link of links) {
    const href = link.getAttribute('href') || '';
    const match = href.match(/\/c\/([a-zA-Z0-9-]+)/);
    if (match) {
      const chatgptId = match[1];
      const title = (link.innerText || link.getAttribute('aria-label') || '').trim();
      if (title && !items.find(x => x.chatgptId === chatgptId)) {
        items.push({
          chatgptId,
          title,
          url: `https://chatgpt.com/c/${chatgptId}`
        });
      }
    }
  }
  return items;
}

function getCurrentConversation() {
  const url = window.location.href;
  const match = url.match(/\/c\/([a-zA-Z0-9-]+)/);
  return {
    chatgptId: match ? match[1] : null,
    title: document.title,
    url
  };
}

async function submitPrompt(promptText, thinkingLevel) {
  if (thinkingLevel) {
    selectThinkingLevel(thinkingLevel);
    await new Promise(r => setTimeout(r, 400));
  }

  // 1. Fill editor
  const editor = document.querySelector('div#prompt-textarea[contenteditable="true"], [contenteditable="true"][role="textbox"]');
  if (editor) {
    editor.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, promptText);
    editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: promptText }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    const textarea = document.querySelector('textarea');
    if (!textarea) throw new Error("ChatGPT prompt input not found on page");
    textarea.focus();
    textarea.value = promptText;
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: promptText }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  await new Promise(r => setTimeout(r, 500));

  // 2. Click send button
  const sendBtn = document.querySelector('button.composer-submit-btn:not(:disabled)') ||
                  document.querySelector('button[data-testid="send-button"]:not(:disabled)') ||
                  Array.from(document.querySelectorAll('button')).find(b => {
                    const label = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
                    return !b.disabled && (label.includes('send') || label.includes('submit') || label.includes('发送'));
                  });

  if (sendBtn) {
    sendBtn.click();
    return { submitted: true, method: 'button_click' };
  } else {
    // Fallback: Enter key
    const target = editor || document.activeElement;
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    return { submitted: true, method: 'enter_key' };
  }
}

function stopGeneration() {
  const stopBtn = document.querySelector('button[aria-label*="Stop"], button[data-testid*="stop-button"], button.composer-stop-btn');
  if (stopBtn) {
    stopBtn.click();
    return { stopped: true };
  }
  return { stopped: false, message: "No active stop button found" };
}

function selectThinkingLevel(level) {
  const labels = {
    "fast": "极速",
    "balanced": "均衡",
    "advanced": "高级",
    "ultra": "超高",
    "pro": "Pro 扩展",
    "gpt-5.5": "GPT-5.5"
  };
  const targetLabel = labels[level] || level;
  const pill = document.querySelector('button.__composer-pill');
  if (pill) {
    pill.click();
    setTimeout(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitemradio"], [role="menuitem"]'));
      const item = items.find(el => (el.innerText || '').trim() === targetLabel);
      if (item) item.click();
    }, 150);
  }
}

// Upload photos / videos / attachments to ChatGPT composer
async function uploadFiles(files = []) {
  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput) {
    throw new Error("ChatGPT file upload input not found on page.");
  }

  const dt = new DataTransfer();
  for (const f of files) {
    const byteChars = atob(f.base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], f.name, { type: f.type || 'image/png' });
    dt.items.add(file);
  }

  fileInput.files = dt.files;
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  return { uploadedCount: dt.files.length };
}

function getGeneratedImages() {
  return Array.from(document.querySelectorAll('main img'))
    .map(img => ({
      src: img.currentSrc || img.src || '',
      alt: img.alt || '',
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height
    }))
    .filter(x => /estuary\/content|files\/download|oaiusercontent|blob:/.test(x.src));
}

function getGeneratedVideos() {
  return Array.from(document.querySelectorAll('main video, main video source'))
    .map(v => ({
      src: v.currentSrc || v.src || '',
      poster: v.poster || ''
    }))
    .filter(x => x.src.length > 0);
}

async function fetchMediaBase64(mediaSrc) {
  const res = await fetch(mediaSrc, { credentials: 'include' });
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
  const blob = await res.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return {
    dataUrl,
    size: blob.size,
    type: blob.type
  };
}

function triggerVoiceMode() {
  const voiceBtn = document.querySelector('button[aria-label*="Voice"], button[aria-label*="语音"], button[data-testid*="voice-mode"]');
  if (voiceBtn) {
    voiceBtn.click();
    return { activated: true };
  }
  return { activated: false, error: "Voice mode button not available on this interface" };
}

function explorePluginsLibrary() {
  // Navigate to GPT store / explore
  const exploreLink = document.querySelector('a[href^="/gpts"], a[data-sidebar-destination="builtin:skills"], button[data-sidebar-destination="builtin:skills"]');
  if (exploreLink) {
    exploreLink.click();
    return { opened: true, destination: 'gpts_store' };
  }
  window.location.href = "https://chatgpt.com/gpts";
  return { opened: true, url: "https://chatgpt.com/gpts" };
}

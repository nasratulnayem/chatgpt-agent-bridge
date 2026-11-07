import http from 'http';
import fs from 'fs';
import path from 'path';

const FRAMES_DIR = `C:\\Users\\nasra\\Desktop\\all clips\\Aloo_Bhai_Undercover_Billionaire_Part_2\\Ddwg_Production_Frames`;

export function callBridge(action, payload = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://127.0.0.1:3456/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ action, payload }));
    req.end();
  });
}

export async function downloadLatestImage(filename) {
  const imgRes = await callBridge('get_images');
  const images = (imgRes.result && imgRes.result.data) || [];
  if (images.length === 0) {
    throw new Error('No images found on page to download.');
  }

  const latest = images[images.length - 1];
  console.log(`Downloading latest image: ${latest.src}`);

  const mediaRes = await callBridge('fetch_media_base64', { src: latest.src });
  const dataUrl = mediaRes.result.data.dataUrl;
  const base64 = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }

  const targetPath = path.join(FRAMES_DIR, filename);
  fs.writeFileSync(targetPath, buffer);
  console.log(`Saved ${filename} (${buffer.length} bytes) to ${targetPath}`);
  return { path: targetPath, size: buffer.length };
}

export async function sendPromptAndWait(prompt, filename, timeoutSec = 240) {
  const preRes = await callBridge('get_images');
  const preSources = new Set(((preRes.result && preRes.result.data) || []).map(x => x.src));

  console.log(`Submitting prompt for ${filename}...`);
  await callBridge('send_prompt', { prompt });

  console.log(`Waiting for new generated image in ChatGPT web...`);
  const deadline = Date.now() + (timeoutSec * 1000);
  let candidateSrc = null;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));
    const currRes = await callBridge('get_images');
    const currList = (currRes.result && currRes.result.data) || [];
    const newItems = currList.filter(x => !preSources.has(x.src));

    if (newItems.length > 0) {
      candidateSrc = newItems[newItems.length - 1].src;
      console.log(`New image detected: ${candidateSrc}. Settling bytes...`);
      await new Promise(r => setTimeout(r, 5000));
      break;
    }
  }

  if (!candidateSrc) {
    throw new Error(`Timeout waiting for generated image for ${filename}`);
  }

  return await downloadLatestImage(filename);
}

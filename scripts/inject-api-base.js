import { readFileSync, writeFileSync } from 'fs';

const HTML_PATH = 'index.html';
const apiBase = process.env.API_BASE || '';

if (apiBase) {
  const html = readFileSync(HTML_PATH, 'utf8');
  const updated = html.replace(
    "window.API_BASE=''",
    `window.API_BASE='${apiBase}'`
  );
  writeFileSync(HTML_PATH, updated);
  console.log(`[inject] API_BASE injected: ${apiBase}`);
} else {
  console.log('[inject] API_BASE not set, keeping default empty string');
}

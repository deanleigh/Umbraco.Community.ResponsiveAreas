// Records the ResponsiveAreas demo in a hidden browser, timed to the narration.
// Adapted from the Tailored Travel video POC: screencast frames -> 30fps MP4, plus
// cursor/zoom events for Remotion. Changes it saves are put back at the end.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const { baseUrl, viewport, steps } = JSON.parse(readFileSync(path.join(here, 'steps.json'), 'utf8'));
const durations = JSON.parse(readFileSync(path.join(here, 'audio', 'durations.json'), 'utf8'));
const env = Object.fromEntries(
  readFileSync(path.join(here, '..', 'src', 'Umbraco.Community.ResponsiveAreas', 'Client', '.env'), 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);

const SCALE = 2;
const GAP_MS = 900;
const POST_ACTION_MS = 900;
const PRE_CLICK_MS = 600;
const DATA_TYPE = '9490ca3c-7a5e-4be3-aa73-712136b2a5a1';
const blockAreasUrl = key => `${baseUrl}/umbraco/section/settings/workspace/data-type/edit/${DATA_TYPE}/modal/umb-modal-workspace/blocks/block-grid-type/edit/${key}/view/areas`;
const OLD_BLOCK = 'f170b29c-338f-4ab8-a5c4-f72c90826f69';
const DEMO_BLOCK = 'a20f0a6e-87ad-4672-8686-877c1a055c66';
const FRONT_URL = `${baseUrl}/layouts/responsive-areas-demo/`;

const recDir = path.join(here, 'recording');
const framesDir = path.join(recDir, 'frames');
rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport, deviceScaleFactor: SCALE, ignoreHTTPSErrors: true });
const page = await context.newPage();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t0 = Date.now();
const now = () => Date.now() - t0;
const events = [];

// ---------- Helpers ----------

const view = () => page.locator('responsive-areas-workspace-view');
const layout = n => view().locator('.layout').nth(n); // 0 = "9", 1 = "6", 2 = "3"
const area = (n, alias) => layout(n).locator('.area').filter({ has: page.locator('strong.alias', { hasText: new RegExp(`^${alias}$`) }) });

async function centre(loc) {
  const b = await loc.boundingBox();
  if (!b) throw new Error('Element has no bounding box');
  return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
}

async function scrollIntoView(loc) {
  await loc.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await sleep(900);
}

async function glide(p) {
  events.push({ t: now(), type: 'move', ...p });
  await page.mouse.move(p.x, p.y, { steps: 12 });
  await sleep(PRE_CLICK_MS);
}

async function click(loc) {
  await scrollIntoView(loc);
  const p = await centre(loc);
  await glide(p);
  events.push({ t: now(), type: 'click', ...p });
  await page.mouse.click(p.x, p.y);
}

// Zoom the finished video onto an element for a while, without clicking it.
async function spotlight(loc, holdMs) {
  await scrollIntoView(loc);
  const p = await centre(loc);
  await glide(p);
  events.push({ t: now(), type: 'zoom', ...p, holdMs });
}

// Drag from one point to another slowly, so the page's own feedback is visible.
async function drag(from, to, ms = 1600) {
  await glide(from);
  const start = now();
  events.push({ t: start, type: 'click', ...from, holdMs: ms + 500 });
  await page.mouse.down();
  const n = 30;
  for (let i = 1; i <= n; i++) {
    const x = from.x + ((to.x - from.x) * i) / n;
    const y = from.y + ((to.y - from.y) * i) / n;
    await page.mouse.move(x, y);
    events.push({ t: now(), type: 'move', x: Math.round(x), y: Math.round(y), instant: true });
    await sleep(ms / n);
  }
  await page.mouse.up();
  await sleep(400);
}

async function dragGripOnto(n, fromAlias, toAlias) {
  const grip = area(n, fromAlias).locator('.grip');
  await scrollIntoView(layout(n));
  await drag(await centre(grip), await centre(area(n, toAlias)));
}

async function dragCorner(n, alias, columns, rows) {
  const box = area(n, alias);
  await scrollIntoView(layout(n));
  const grid = await layout(n).locator('.layout-grid').boundingBox();
  const layoutColumns = Number(await layout(n).locator('.layout-header uui-input[label="Columns"] input').inputValue());
  const handle = await centre(box.locator('.resize'));
  const b = await box.boundingBox();
  const colW = grid.width / layoutColumns;
  await drag(handle, { x: handle.x + columns * colW, y: handle.y + rows * b.height });
}

async function submitAndSave() {
  await click(page.getByRole('button', { name: 'Submit' }));
  await sleep(1200);
  await click(page.getByRole('button', { name: 'Save', exact: true }));
  await sleep(2500);
}

async function openBlockAreas(key) {
  await page.goto(blockAreasUrl(key), { waitUntil: 'load' });
  await page.locator('umb-property[alias="areas"]').first().waitFor({ timeout: 30000 });
  await sleep(1200);
}

// A full-screen card, rendered as a page so it is part of the recording.
async function card(html) {
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;height:100%;font-family:Lato,system-ui,sans-serif;background:#1b264f;color:#fff}
    body{display:grid;place-items:center;text-align:center}
    h1{font-size:120px;margin:0;color:#f5c1bc} p{font-size:56px;margin:24px 0 0}
    .bar{width:160px;height:8px;background:#f5c1bc;margin:32px auto}
  </style></head><body><div>${html}</div></body></html>`);
}

// The front end inside a frame whose width we control, so the video size never changes.
// Each device is zoomed so the block fills the space above the captions.
const DEVICES = { 12: ['Big screen', 1400, 0.6], 9: ['Laptop', 1100, 0.75], 6: ['Tablet', 820, 0.9], 3: ['Phone', 420, 1] };
const VISIBLE_HEIGHT = 760; // on-screen pixels for the frame
const frameCss = ([, width, scale]) =>
  `width:${width}px;height:${VISIBLE_HEIGHT / scale}px;transform:scale(${scale})`;
async function frontEnd(layoutId) {
  const device = DEVICES[layoutId];
  const [name, width, scale] = device;
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;height:100%;background:#2b2f3a;font-family:Lato,system-ui,sans-serif;overflow:hidden}
    #label{color:#fff;font-size:30px;font-weight:700;text-align:center;padding:14px 0 12px}
    #holder{margin:0 auto;height:${VISIBLE_HEIGHT}px;width:${width * scale}px;transition:width 1.4s ease-in-out}
    #frame{display:block;border:0;border-radius:16px;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.5);
      transform-origin:0 0;transition:width 1.4s ease-in-out,height 1.4s ease-in-out,transform 1.4s ease-in-out}
  </style></head><body><div id="label">${name} · ${width}px</div>
  <div id="holder"><iframe id="frame" style="${frameCss(device)}" src="${FRONT_URL}"></iframe></div></body></html>`);
  await waitForFrame();
}

async function waitForFrame() {
  const frame = page.frameLocator('#frame');
  const block = frame.locator('.areas[data-layoutalias="layoutResponsiveDemo"]');
  await block.waitFor({ timeout: 30000 });
  // Hide the site's sticky header so it can't cover the block, then put the block at the top.
  await frame.locator('body').evaluate(() => {
    const s = document.createElement('style');
    s.textContent = 'header.screen--header { display: none !important; }';
    document.head.append(s);
  });
  await block.evaluate(el => el.scrollIntoView({ block: 'start' }));
  await frame.locator('body').evaluate(() => window.scrollBy(0, -12));
  await sleep(600);
}

async function resizeFrame(layoutId) {
  const device = DEVICES[layoutId];
  const [name, width, scale] = device;
  await page.evaluate(([label, css, holderWidth]) => {
    document.getElementById('label').textContent = label;
    document.getElementById('frame').style.cssText = css;
    document.getElementById('holder').style.width = `${holderWidth}px`;
  }, [`${name} · ${width}px`, frameCss(device), width * scale]);
  await sleep(1600);
  await page.frameLocator('#frame').locator('.areas[data-layoutalias="layoutResponsiveDemo"]').evaluate(el => el.scrollIntoView({ block: 'start' }));
}

// ---------- The steps ----------

const actions = {
  '01-intro': async () => card('<p style="font-size:64px">Site not looking right on the<br>Google Nest Hub?</p><p style="font-size:120px;margin-top:40px">📟</p>'),
  '02-title': async () => card('<h1>ResponsiveAreas</h1><div class="bar"></div><p>for the Umbraco Block Grid</p>'),
  '03-old-tab': async () => {
    await openBlockAreas(OLD_BLOCK);
    // "The old days": hide our Layouts section so the tab looks exactly like core's.
    await view().evaluate(el => {
      const layouts = el.shadowRoot?.querySelector('umb-property-layout[label="Layouts"]');
      if (layouts) layouts.style.display = 'none';
    });
    await spotlight(page.locator('umb-block-area-config-entry').first(), 4000);
  },
  '04-old-alias': async () => {
    await click(page.locator('umb-block-area-config-entry').filter({ hasText: 'primary g-col-12' }).getByLabel('edit'));
    await page.locator('umb-property[alias="alias"]').first().waitFor();
    await sleep(800);
    await spotlight(page.locator('umb-property[alias="alias"]').first(), 3500);
  },
  '05-front-tablet': async () => frontEnd(6),
  '06-backoffice': async () => {
    await openBlockAreas(DEMO_BLOCK);
    await scrollIntoView(layout(1));
  },
  '07-drag-a': async () => {
    await dragGripOnto(1, 'a', 'd');
    await spotlight(layout(1).locator('uui-input[label^="Order for a"]'), 1500);
  },
  '08-resize-b': async () => dragCorner(1, 'b', 3, 0),
  '09-save': async () => submitAndSave(),
  '10-front-fixed': async () => frontEnd(6),
  '11-phone-edit': async () => {
    await openBlockAreas(DEMO_BLOCK);
    await dragGripOnto(2, 'd', 'c');
    await spotlight(layout(2).locator('uui-input[label^="Order for d"]'), 1500);
    await submitAndSave();
  },
  '12-front-phone': async () => frontEnd(3),
  '13-widths': async () => {
    await frontEnd(12);
    await sleep(1500);
    await resizeFrame(9);
    await sleep(1200);
    await resizeFrame(6);
    await sleep(1200);
    await resizeFrame(3);
  },
  '14-end': async () => card('<h1>ResponsiveAreas</h1><div class="bar"></div><p>No CSS framework required.</p><p style="font-size:36px;opacity:.8">Umbraco Builder Day 2026</p>'),
};

// Put the demo data back exactly as committed (off camera).
async function restore() {
  await openBlockAreas(DEMO_BLOCK);
  const set = async (n, field, alias, value) => {
    const input = layout(n).locator(`uui-input[label^="${field} for ${alias} "] input`);
    await input.fill(String(value));
    await input.press('Tab');
  };
  const committed = {
    1: { a: [6, 1, 2], b: [3, 1, 3], c: [3, 1, 4], d: [6, 1, 1] },
    2: { a: [3, 1, 2], b: [3, 1, 4], c: [3, 1, 1], d: [3, 1, 3] },
  };
  for (const [n, areas] of Object.entries(committed)) {
    for (const [alias, [cols, rows, order]] of Object.entries(areas)) {
      await set(Number(n), 'Columns', alias, cols);
      await set(Number(n), 'Rows', alias, rows);
      await set(Number(n), 'Order', alias, order);
    }
  }
  await page.getByRole('button', { name: 'Submit' }).click();
  await sleep(1000);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await sleep(2500);
  console.log('Demo data restored.');
}

// ---------- Run ----------

// Log in off camera.
await page.goto(`${baseUrl}/umbraco`, { waitUntil: 'load' });
await page.getByLabel('EmailE-mail').fill(env.UMBRACO_USER_LOGIN);
await page.getByLabel('PasswordPassword').fill(env.UMBRACO_USER_PASSWORD);
await page.getByRole('button', { name: 'Login' }).click();
await page.waitForURL(/\/umbraco\/section\//, { timeout: 30000 });
await actions['01-intro']();
await sleep(500);

const frames = [];
const writes = [];
const cdp = await context.newCDPSession(page);
t0 = Date.now();
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  const file = `${String(frames.length).padStart(5, '0')}.jpg`;
  frames.push({ file, ms: metadata.timestamp * 1000 - t0 });
  writes.push(writeFile(path.join(framesDir, file), Buffer.from(data, 'base64')));
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: viewport.width * SCALE, maxHeight: viewport.height * SCALE });

const timedSteps = [];
let totalMs = 0;
let saved = false;
try {
  for (const step of steps) {
    const startMs = now();
    const audioMs = Math.round(durations[step.id] * 1000);
    console.log(`${step.id} @ ${(startMs / 1000).toFixed(2)}s`);
    if (step.id !== '01-intro') {
      try {
        await actions[step.id]();
      } catch (err) {
        throw new Error(`Step ${step.id} failed: ${err.message}`);
      }
    }
    if (step.id === '09-save') saved = true;
    const done = now();
    await sleep(Math.max(startMs + audioMs + GAP_MS - now(), done + POST_ACTION_MS - now(), 0));
    timedSteps.push({ id: step.id, narration: step.narration, startMs, endMs: now(), audioMs });
  }
  await sleep(600);
} finally {
  totalMs = now();
  await cdp.send('Page.stopScreencast').catch(() => {});
  await Promise.all(writes);
  if (saved) await restore().catch(err => console.error(`RESTORE FAILED, run a uSync import: ${err.message}`));
  await context.close();
  await browser.close();
}

// Assemble the variable-rate frames into a constant 30fps video.
const lines = [];
for (const [i, f] of frames.entries()) {
  const start = i === 0 ? 0 : f.ms;
  const end = i + 1 < frames.length ? frames[i + 1].ms : totalMs;
  lines.push(`file 'frames/${f.file}'`, `duration ${Math.max(0, end - start) / 1000}`);
}
lines.push(`file 'frames/${frames.at(-1).file}'`);
writeFileSync(path.join(recDir, 'frames.txt'), lines.join('\n'));
execFileSync(FFMPEG, [
  '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(recDir, 'frames.txt'),
  '-vf', `scale=${viewport.width * SCALE}:${viewport.height * SCALE}`,
  '-fps_mode', 'cfr', '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p',
  path.join(recDir, 'recording.mp4'),
], { stdio: 'inherit' });

writeFileSync(path.join(recDir, 'timings.json'), JSON.stringify({ viewport, videoStartMs: 0, totalMs, steps: timedSteps, events }, null, 2));
mkdirSync(path.join(here, 'remotion', 'public'), { recursive: true });
copyFileSync(path.join(recDir, 'recording.mp4'), path.join(here, 'remotion', 'public', 'recording.mp4'));
copyFileSync(path.join(recDir, 'timings.json'), path.join(here, 'remotion', 'src', 'timings.json'));
console.log(`Saved recording.mp4 (${(totalMs / 1000).toFixed(1)}s, ${frames.length} frames)`);

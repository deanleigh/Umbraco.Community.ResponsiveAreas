// Records the ResponsiveAreas tutorial in a hidden browser, timed to the narration.
// Screencast frames -> 30fps MP4, plus cursor/zoom events for Remotion.
// The demo data type is copied through the Management API before recording and put
// back exactly afterwards, so the changes made on camera never stay.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // local test site, self-signed certificate

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const { baseUrl, viewport, steps } = JSON.parse(readFileSync(path.join(here, 'steps.json'), 'utf8'));
const durations = JSON.parse(readFileSync(path.join(here, 'audio', 'durations.json'), 'utf8'));
const env = Object.fromEntries(
  readFileSync(path.join(here, '..', 'src', 'Umbraco.Community.ResponsiveAreas', 'Client', '.env'), 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
// The Umbraco MCP API user (gitignored .mcp.json) is used to copy and restore the data type.
const api = JSON.parse(readFileSync(path.join(here, '..', '.mcp.json'), 'utf8')).mcpServers['umbraco-mcp'].env;

const SCALE = 2;
const GAP_MS = 900;
const POST_ACTION_MS = 900;
const PRE_CLICK_MS = 600;
const DATA_TYPE = '9490ca3c-7a5e-4be3-aa73-712136b2a5a1';
const DEMO_BLOCK = 'a20f0a6e-87ad-4672-8686-877c1a055c66';
const blockAreasUrl = `${baseUrl}/umbraco/section/settings/workspace/data-type/edit/${DATA_TYPE}/modal/umb-modal-workspace/blocks/block-grid-type/edit/${DEMO_BLOCK}/view/areas`;
const FRONT_URL = `${baseUrl}/layouts/responsive-areas-demo/`;
const BLOCK_SELECTOR = '.areas[data-layoutalias="layoutResponsiveDemo"]';

const recDir = path.join(here, 'recording');
const framesDir = path.join(recDir, 'frames');
rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });

// ---------- Management API: copy and restore the data type ----------

async function apiToken() {
  const res = await fetch(`${baseUrl}/umbraco/management/api/v1/security/back-office/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: api.UMBRACO_CLIENT_ID, client_secret: api.UMBRACO_CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  return (await res.json()).access_token;
}

async function getDataType() {
  const res = await fetch(`${baseUrl}/umbraco/management/api/v1/data-type/${DATA_TYPE}`, { headers: { authorization: `Bearer ${await apiToken()}` } });
  if (!res.ok) throw new Error(`Reading the data type failed: ${res.status}`);
  return res.json();
}

async function putDataType({ name, editorAlias, editorUiAlias, values }) {
  const res = await fetch(`${baseUrl}/umbraco/management/api/v1/data-type/${DATA_TYPE}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${await apiToken()}`, 'content-type': 'application/json' },
    body: JSON.stringify({ name, editorAlias, editorUiAlias, values }),
  });
  if (!res.ok) throw new Error(`Restoring the data type failed: ${res.status} ${await res.text()}`);
}

const original = await getDataType();
writeFileSync(path.join(recDir, 'data-type-before.json'), JSON.stringify(original, null, 2));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport, deviceScaleFactor: SCALE, ignoreHTTPSErrors: true });
const page = await context.newPage();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t0 = Date.now();
const now = () => Date.now() - t0;
const events = [];

// ---------- Helpers ----------

// 0 = first layout, 1 = lg, 2 = md, 3 = sm.
const layout = n => page.locator('responsive-areas-areas-editor .layout').nth(n);
const area = (n, alias) => layout(n).locator('.area').filter({ has: page.locator('strong.alias', { hasText: new RegExp(`^${alias}$`) }) });

async function centre(loc) {
  const b = await loc.boundingBox();
  if (!b) throw new Error('Element has no bounding box');
  return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
}

async function scrollIntoView(loc, block = 'center') {
  await loc.evaluate((el, block) => el.scrollIntoView({ behavior: 'smooth', block }), block);
  await sleep(1000);
}

async function glide(p, holdMs = PRE_CLICK_MS) {
  events.push({ t: now(), type: 'move', ...p });
  await page.mouse.move(p.x, p.y, { steps: 14 });
  await sleep(holdMs);
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
  await sleep(holdMs);
}

// Drag slowly, so the page's own feedback is visible.
async function drag(from, to, ms = 1800) {
  await glide(from);
  events.push({ t: now(), type: 'click', ...from, holdMs: ms + 600 });
  await page.mouse.down();
  const n = 36;
  for (let i = 1; i <= n; i++) {
    const x = from.x + ((to.x - from.x) * i) / n;
    const y = from.y + ((to.y - from.y) * i) / n;
    await page.mouse.move(x, y);
    events.push({ t: now(), type: 'move', x: Math.round(x), y: Math.round(y), instant: true });
    await sleep(ms / n);
  }
  await sleep(300);
  await page.mouse.up();
  await sleep(600);
}

async function dragCorner(n, alias, columns) {
  await scrollIntoView(layout(n));
  const grid = await layout(n).locator('responsive-areas-layout-grid').boundingBox();
  const layoutColumns = Number(await layout(n).locator('uui-input[label="Grid columns"] input').inputValue());
  const handle = await centre(area(n, alias).locator('#handler'));
  await drag(handle, { x: handle.x + (columns * grid.width) / layoutColumns, y: handle.y });
}

// Drop one box onto the left half of another, so it lands in front of it.
async function dragBoxBefore(n, fromAlias, toAlias) {
  await scrollIntoView(layout(n));
  const from = await centre(area(n, fromAlias).locator('strong.alias'));
  const target = await area(n, toAlias).boundingBox();
  await drag(from, { x: Math.round(target.x + target.width * 0.25), y: Math.round(target.y + target.height / 2) });
}

async function submitAndSave() {
  await click(page.getByRole('button', { name: 'Submit' }));
  await sleep(1400);
  await click(page.getByRole('button', { name: 'Save', exact: true }));
  await sleep(2500);
}

async function openBlockAreas() {
  await page.goto(blockAreasUrl, { waitUntil: 'load' });
  await page.locator('responsive-areas-areas-editor .layout').first().waitFor({ timeout: 30000 });
  await sleep(1500);
}

// ---------- Cards: cover, code and end, in Umbraco's colours ----------

const NAVY = '#1b264f';
const PINK = '#f5c1bc';
const CARD_CSS = `
  html,body{margin:0;height:100%;font-family:Lato,system-ui,sans-serif;background:${NAVY};color:#fff}
  body{display:flex;flex-direction:column;justify-content:center;padding:70px 120px 190px;box-sizing:border-box}
  h2{font-size:52px;margin:0 0 12px;font-weight:700}
  .lead{font-size:32px;margin:0 0 40px;color:#d8dcec}
  .bar{width:120px;height:8px;background:${PINK};margin:0 0 36px;border-radius:4px}
  pre{margin:0;font-family:'Cascadia Mono',Consolas,monospace;font-size:30px;line-height:1.55;background:#0f1733;
      padding:34px 40px;border-radius:16px;white-space:pre;color:#e8ebf7;border:1px solid #33407a}
  .p{color:#9fb4ff}.v{color:${PINK};font-weight:700}.c{color:#7f89b3}
  .hl{background:${PINK};color:${NAVY};border-radius:6px;padding:0 6px}
  .old{color:#7f89b3;text-decoration:line-through}
  .row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px}
  .row pre{font-size:22px;padding:26px 28px}
  .label{font-size:26px;font-weight:700;color:${PINK};margin:0 0 12px}
  .map{display:grid;grid-template-columns:auto 1fr;gap:18px 34px;font-size:30px;align-items:center}
  .map .k{color:#d8dcec}
`;

async function card(body, extraCss = '') {
  await page.setContent(`<!doctype html><html><head><style>${CARD_CSS}${extraCss}</style></head><body>${body}</body></html>`);
  await sleep(300);
}

// Four boxes rearranged in three mini grids: the idea of the tool at a glance.
const miniGrid = (cols, items) => `<div class="mini" style="grid-template-columns:repeat(${cols},1fr)">${items
  .map(([name, span]) => `<div style="grid-column:span ${span}">${name}</div>`).join('')}</div>`;

const COVER = `
  <div class="cover">
    <div>
      <h1>ResponsiveAreas</h1>
      <div class="bar"></div>
      <p class="strap">Different area layouts for every screen size</p>
      <p class="sub">for the Umbraco Block Grid</p>
    </div>
    <div class="minis">
      ${miniGrid(12, [['A', 6], ['B', 6], ['C', 3], ['D', 3]])}
      ${miniGrid(6, [['D', 6], ['A', 6], ['B', 3], ['C', 3]])}
      ${miniGrid(3, [['C', 3], ['A', 3], ['D', 3], ['B', 3]])}
    </div>
  </div>`;
const COVER_CSS = `
  body{padding:0 140px}
  .cover{display:grid;grid-template-columns:1.2fr 1fr;gap:90px;align-items:center}
  h1{font-size:118px;margin:0 0 30px;letter-spacing:-1px}
  .strap{font-size:46px;margin:0 0 14px}.sub{font-size:34px;margin:0;color:${PINK}}
  .minis{display:flex;gap:26px;align-items:flex-start}
  .mini{display:grid;gap:6px;width:200px}
  .mini:nth-child(2){width:150px}.mini:nth-child(3){width:100px}
  .mini div{background:${PINK};color:${NAVY};font-weight:700;font-size:22px;border-radius:6px;padding:16px 0;text-align:center}
`;

const CODE_OUTPUT = `
  <h2>What the page outputs</h2>
  <div class="bar"></div>
  <p class="lead">Area B, in the medium layout. The breakpoint alias is on the end of each name.</p>
  <div class="map">
    <span class="k">Grid columns 6</span>
    <pre><span class="p">--umb-block-grid--area-grid-columns--</span><span class="v">md</span>: 6;</pre>
    <span class="k">B is 3 &times; 1</span>
    <pre><span class="p">--umb-block-grid--area-column-span--</span><span class="v">md</span>: 3;
<span class="p">--umb-block-grid--area-row-span--</span><span class="v">md</span>: 1;</pre>
    <span class="k">B is third</span>
    <pre><span class="p">--umb-block-grid--area-order--</span><span class="v">md</span>: 3;</pre>
  </div>`;

const CODE_BOOTSTRAP = `
  <h2>Your CSS: Bootstrap</h2>
  <div class="bar"></div>
  <p class="lead">The medium layout at Bootstrap's medium width. Without a medium layout, it falls back to the first layout.</p>
<pre><span class="c">/* md: 768px to 991px */</span>
@media (768px &lt;= width &lt; 992px) {
  .responsive-areas {
    --bs-columns: var(<span class="p">--umb-block-grid--area-grid-columns--</span><span class="v">md</span>, 12);
  }
  .responsive-area {
    grid-column: auto / span var(
      <span class="p">--umb-block-grid--area-column-span--</span><span class="v">md</span>,
      var(--umb-block-grid--area-column-span));
    order: var(<span class="p">--umb-block-grid--area-order--</span><span class="v">md</span>, 0);
  }
}</pre>`;

const CODE_FRAMEWORKS = `
  <h2>Same variables, any CSS</h2>
  <div class="bar"></div>
  <p class="lead">Name the breakpoint alias after your own breakpoints. Only the breakpoint rule changes.</p>
  <div class="row">
    <div><p class="label">Tailwind</p>
<pre>.responsive-area {
  @variant <span class="v">md</span> {
    grid-column: span var(
      <span class="p">--umb-block-grid--</span>
      <span class="p">area-column-span--</span><span class="v">md</span>);
  }
}</pre></div>
    <div><p class="label">Foundation</p>
<pre>.responsive-area {
  @include breakpoint(<span class="v">medium</span>) {
    grid-column: span var(
      <span class="p">--umb-block-grid--</span>
      <span class="p">area-column-span--</span><span class="v">medium</span>);
  }
}</pre></div>
    <div><p class="label">Your own CSS</p>
<pre>@media (width &gt;= 768px) {
  .responsive-area {
    grid-column: span var(
      <span class="p">--umb-block-grid--</span>
      <span class="p">area-column-span--</span><span class="v">md</span>);
  }
}</pre></div>
  </div>`;

const CODE_CHANGE = `
  <h2>One value changes</h2>
  <div class="bar"></div>
  <p class="lead">Area B, in the medium layout.</p>
<pre><span class="p">--umb-block-grid--area-column-span--</span><span class="v">md</span>: <span class="old">3</span> <span class="hl">6</span>;</pre>`;

const CODE_ORDER = `
  <h2>The order values update</h2>
  <div class="bar"></div>
  <p class="lead">The small layout. D is now first.</p>
<pre><span class="c">/* area D */</span> <span class="p">--umb-block-grid--area-order--</span><span class="v">sm</span>: <span class="old">3</span> <span class="hl">1</span>;
<span class="c">/* area C */</span> <span class="p">--umb-block-grid--area-order--</span><span class="v">sm</span>: <span class="old">1</span> <span class="hl">2</span>;
<span class="c">/* area A */</span> <span class="p">--umb-block-grid--area-order--</span><span class="v">sm</span>: <span class="old">2</span> <span class="hl">3</span>;
<span class="c">/* area B */</span> <span class="p">--umb-block-grid--area-order--</span><span class="v">sm</span>: 4;</pre>`;

const END = `
  <div class="end">
    <h1>ResponsiveAreas</h1>
    <div class="bar"></div>
    <p class="strap">Set up in the backoffice. Styled with your own CSS.</p>
    <p class="sub">for the Umbraco Block Grid</p>
  </div>`;
const END_CSS = `body{align-items:center;text-align:center}.end .bar{margin:0 auto 36px}
  h1{font-size:118px;margin:0 0 30px}.strap{font-size:46px;margin:0 0 14px}.sub{font-size:34px;margin:0;color:${PINK}}`;

// ---------- The front end ----------

async function hideHeaderAndShowBlock(frame) {
  await frame.locator(BLOCK_SELECTOR).waitFor({ timeout: 30000 });
  // For the video only: hide the site header, and the demo text that describes each
  // area's position (the video changes those positions). The area names stay.
  await frame.locator('body').evaluate(() => {
    const s = document.createElement('style');
    s.textContent = `header.screen--header { display: none !important; }
      [data-areaalias] p { display: none !important; }
      [data-areaalias] { min-height: 150px; }`;
    document.head.append(s);
  });
  await frame.locator(BLOCK_SELECTOR).evaluate(el => el.scrollIntoView({ block: 'start' }));
  await frame.locator('body').evaluate(() => window.scrollBy(0, -24));
}

// Full screen, as a visitor would see it.
async function frontEndFull() {
  await page.goto(FRONT_URL, { waitUntil: 'load' });
  await hideHeaderAndShowBlock(page);
  await sleep(600);
}

// Narrower screens in a frame, so the video size never changes.
const SCREENS = {
  first: ['Wide screen · 1400px · first layout', 1400, 0.66],
  lg: ['Laptop · 1100px · lg', 1100, 0.75],
  md: ['Tablet · 900px · md', 900, 0.8],
  sm: ['Phone · 600px · sm', 600, 0.8],
};
const VISIBLE_HEIGHT = 780;
const frameCss = ([, width, scale]) => `width:${width}px;height:${VISIBLE_HEIGHT / scale}px;transform:scale(${scale})`;

async function frontEnd(key) {
  const screen = SCREENS[key];
  const [label, width, scale] = screen;
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;height:100%;background:${NAVY};font-family:Lato,system-ui,sans-serif;overflow:hidden}
    #label{color:#fff;font-size:30px;font-weight:700;text-align:center;padding:16px 0 14px}
    #holder{margin:0 auto;height:${VISIBLE_HEIGHT}px;width:${width * scale}px;transition:width 1.4s ease-in-out}
    #frame{display:block;border:0;border-radius:16px;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.5);
      transform-origin:0 0;transition:width 1.4s ease-in-out,height 1.4s ease-in-out,transform 1.4s ease-in-out}
  </style></head><body><div id="label">${label}</div>
  <div id="holder"><iframe id="frame" style="${frameCss(screen)}" src="${FRONT_URL}"></iframe></div></body></html>`);
  await hideHeaderAndShowBlock(page.frameLocator('#frame'));
  await sleep(600);
}

async function resizeFrame(key) {
  const screen = SCREENS[key];
  const [label, width, scale] = screen;
  await page.evaluate(([label, css, holderWidth]) => {
    document.getElementById('label').textContent = label;
    document.getElementById('frame').style.cssText = css;
    document.getElementById('holder').style.width = `${holderWidth}px`;
  }, [label, frameCss(screen), width * scale]);
  await sleep(1600);
  await page.frameLocator('#frame').locator(BLOCK_SELECTOR).evaluate(el => el.scrollIntoView({ block: 'start' }));
}

// ---------- The steps ----------

const actions = {
  '01-cover': async () => card(COVER, COVER_CSS),
  '02-front-wide': async () => frontEndFull(),
  '03-front-narrow': async () => {
    await frontEnd('first');
    await sleep(1400);
    for (const key of ['lg', 'md', 'sm']) {
      await resizeFrame(key);
      await sleep(1400);
    }
  },
  '04-backoffice': async () => openBlockAreas(),
  '05-grid': async () => spotlight(page.locator('#grid-columns'), 2500),
  '06-first-layout': async () => spotlight(layout(0), 3500),
  '07-layouts': async () => {
    for (const n of [1, 2, 3]) {
      await spotlight(layout(n).locator('.layout-header'), 1800);
    }
  },
  '08-drag-hint': async () => {
    await scrollIntoView(layout(2));
    const box = area(2, 'b');
    await glide(await centre(box.locator('strong.alias')), 1400);
    await glide(await centre(box.locator('#handler')), 1800);
  },
  '09-code-output': async () => card(CODE_OUTPUT),
  '10-code-bootstrap': async () => card(CODE_BOOTSTRAP),
  '11-code-frameworks': async () => card(CODE_FRAMEWORKS),
  '12-resize-b': async () => {
    await openBlockAreas();
    await dragCorner(2, 'b', 3);
    await sleep(800);
    await submitAndSave();
  },
  '13-code-change': async () => card(CODE_CHANGE),
  '14-front-tablet': async () => frontEnd('md'),
  '15-move-d': async () => {
    await openBlockAreas();
    await dragBoxBefore(3, 'd', 'c');
    await sleep(800);
    await submitAndSave();
  },
  '16-code-order': async () => card(CODE_ORDER),
  '17-front-phone': async () => frontEnd('sm'),
  '18-end': async () => card(END, END_CSS),
};

// ---------- Run ----------

// Log in off camera.
await page.goto(`${baseUrl}/umbraco`, { waitUntil: 'load' });
await page.getByLabel('EmailE-mail').fill(env.UMBRACO_USER_LOGIN);
await page.getByLabel('PasswordPassword').fill(env.UMBRACO_USER_PASSWORD);
await page.getByRole('button', { name: 'Login' }).click();
await page.waitForURL(/\/umbraco\/section\//, { timeout: 30000 });
await actions['01-cover']();
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
try {
  for (const step of steps) {
    const startMs = now();
    const audioMs = Math.round(durations[step.id] * 1000);
    console.log(`${step.id} @ ${(startMs / 1000).toFixed(2)}s`);
    if (step.id !== '01-cover') {
      try {
        await actions[step.id]();
      } catch (err) {
        throw new Error(`Step ${step.id} failed: ${err.message}`);
      }
    }
    const done = now();
    await sleep(Math.max(startMs + audioMs + GAP_MS - now(), done + POST_ACTION_MS - now(), 0));
    timedSteps.push({ id: step.id, narration: step.narration, startMs, endMs: now(), audioMs });
  }
  await sleep(600);
} finally {
  totalMs = now();
  await cdp.send('Page.stopScreencast').catch(() => {});
  await Promise.all(writes);
  await context.close();
  await browser.close();
  // Put the data type back exactly as it was before recording.
  await putDataType(original)
    .then(() => console.log('Demo data restored through the Management API.'))
    .catch(err => console.error(`RESTORE FAILED: ${err.message}. The copy is in recording/data-type-before.json.`));
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

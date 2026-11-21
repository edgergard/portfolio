#!/usr/bin/env node
/**
 * Dev-only tool (never imported by the app): records a short muted loop of a live web demo.
 *
 *   node scripts/record-demo.mjs <url> <out-basename> [--seconds 10] [--script <steps.json>]
 *                                [--out-dir public/videos] [--chrome <path>] [--max-mb 2] [--poster]
 *
 * Launches headless Chrome over CDP at 1280x800, runs a scripted interaction while capturing
 * Page.startScreencast frames, resamples them onto a constant 25 fps timeline and encodes with
 * ffmpeg-static to <out-dir>/<out-basename>.webm (VP9, CRF ~38) and .mp4 (H.264, CRF ~30), no
 * audio. If a file comes out above --max-mb it is re-encoded at a higher CRF.
 *
 * steps.json is either an array of steps, or { "before": [...], "steps": [...] } where "before"
 * runs ahead of the recording (e.g. waiting for a slow API). Step shapes:
 *   { "wait": 800 }                                  pause (ms)
 *   { "waitFor": "css", "timeout": 30000 }           wait until a selector exists
 *   { "scroll": 600, "ms": 1200 }                    wheel-scroll by N px (negative = up)
 *   { "scrollTo": "css", "ms": 1200 }                wheel-scroll until the element is centred
 *   { "hover": "css", "ms": 500 }                    glide the mouse onto the element
 *   { "click": "css" }                               glide + click
 *     (hover/click/scrollTo also take "nth": 2 and "text": "°C" to pick among matches)
 *   { "type": "text", "delay": 90 }                  type into the focused element
 *   { "key": "Enter" }                               press a key
 *   { "eval": "js expression" }                      run JS in the page
 *   { "goto": "url" }                                navigate (recording continues)
 */
import { spawn, execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';

const run = promisify(execFile);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const W = 1280;
const H = 800;
const FPS = 25;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const seconds = Number(flag('seconds', '10'));
const scriptPath = flag('script', '');
const outDir = flag('out-dir', 'public/videos');
const maxBytes = Number(flag('max-mb', '2')) * 1024 * 1024;
const wantPoster = args.includes('--poster') && Boolean(args.splice(args.indexOf('--poster'), 1));
const chromePath = flag('chrome', process.env.CHROME_PATH || defaultChrome());
const [url, base] = args;

if (!url || !base) {
  console.error('usage: node scripts/record-demo.mjs <url> <out-basename> [--seconds 10] [--script <steps.json>]');
  process.exit(1);
}

function defaultChrome() {
  if (process.platform === 'win32') return 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return 'google-chrome';
}

const loadSteps = () => {
  if (!scriptPath) return { before: [], steps: [{ wait: 1500 }, { scroll: 900, ms: 3000 }, { wait: 1500 }, { scroll: -900, ms: 2500 }] };
  const json = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  return Array.isArray(json) ? { before: [], steps: json } : { before: json.before ?? [], steps: json.steps ?? [] };
};

// ---- Chrome + CDP ---------------------------------------------------------------------------

const udd = fs.mkdtempSync(path.join(os.tmpdir(), 'record-demo-'));
const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, [
  '--headless=new', '--hide-scrollbars', '--no-first-run', '--disable-extensions', '--mute-audio',
  `--user-data-dir=${udd}`, `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' });

let target;
for (let i = 0; i < 75 && !target; i++) {
  await sleep(200);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page');
  } catch { /* not up yet */ }
}
if (!target) throw new Error(`Chrome did not expose a page target (is ${chromePath} correct?)`);

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });

let nextId = 0;
const pending = new Map();
const frames = [];
let recording = false;

ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(`${m.error.message}`)) : resolve(m.result);
  }
  if (m.method === 'Page.screencastFrame') {
    const { data, metadata, sessionId } = m.params;
    if (recording) frames.push({ t: metadata.timestamp, data });
    send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  }
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async expression => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(`eval failed: ${r.exceptionDetails.exception?.description ?? expression}`);
  return r.result?.value;
};

const shutdown = async () => {
  try { ws.close(); } catch { /* already closed */ }
  chrome.kill();
  await sleep(400);
  try { fs.rmSync(udd, { recursive: true, force: true }); } catch { /* Chrome may hold files briefly */ }
};

// ---- Interaction ----------------------------------------------------------------------------

const mouse = { x: W / 2, y: H / 2 };

const centreOf = async (selector, nth = 0, text = '') => {
  const box = await evaluate(`(() => {
    const all = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .filter(e => e.textContent.includes(${JSON.stringify(text)}));
    const el = all[${nth}];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!box) throw new Error(`no element for selector: ${selector} [${nth}] ${text}`);
  return box;
};

const ease = k => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

/** Calls tick(progress 0..1) on a wall-clock schedule, so slow CDP round trips never stretch it. */
const animate = async (ms, tick) => {
  const start = Date.now();
  for (;;) {
    const k = Math.min(1, (Date.now() - start) / Math.max(1, ms));
    await tick(ease(k));
    if (k >= 1) return;
    await sleep(16);
  }
};

const glide = (x, y, ms = 500) => {
  const from = { ...mouse };
  return animate(ms, async e => {
    mouse.x = from.x + (x - from.x) * e;
    mouse.y = from.y + (y - from.y) * e;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mouse.x, y: mouse.y });
  });
};

const wheel = (dy, ms = 1000) => {
  let done = 0;
  return animate(ms, async e => {
    const target = Math.round(dy * e);
    if (target === done) return;
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: mouse.x, y: mouse.y, deltaX: 0, deltaY: target - done });
    done = target;
  });
};

const runStep = async step => {
  if ('wait' in step) return sleep(step.wait);
  if ('waitFor' in step) {
    const deadline = Date.now() + (step.timeout ?? 30000);
    while (!(await evaluate(`!!document.querySelector(${JSON.stringify(step.waitFor)})`))) {
      if (Date.now() > deadline) throw new Error(`timed out waiting for ${step.waitFor}`);
      await sleep(250);
    }
    return undefined;
  }
  if ('scroll' in step) return wheel(step.scroll, step.ms);
  if ('scrollTo' in step) {
    const { y } = await centreOf(step.scrollTo, step.nth, step.text);
    return wheel(y - H / 2, step.ms);
  }
  if ('hover' in step) {
    const { x, y } = await centreOf(step.hover, step.nth, step.text);
    return glide(x, y, step.ms);
  }
  if ('click' in step) {
    const { x, y } = await centreOf(step.click, step.nth, step.text);
    await glide(x, y, step.ms ?? 450);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await sleep(70);
    return send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  if ('type' in step) {
    for (const ch of step.type) {
      await send('Input.insertText', { text: ch });
      await sleep(step.delay ?? 90);
    }
    return undefined;
  }
  if ('key' in step) {
    const key = step.key;
    const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
    const vk = { Enter: 13, Escape: 27, Tab: 9, ArrowDown: 40, ArrowUp: 38 }[key];
    const common = { key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...common, text: key === 'Enter' ? '\r' : undefined });
    return send('Input.dispatchKeyEvent', { type: 'keyUp', ...common });
  }
  if ('eval' in step) return evaluate(step.eval);
  if ('goto' in step) return send('Page.navigate', { url: step.goto });
  throw new Error(`unknown step: ${JSON.stringify(step)}`);
};

// ---- Encode ---------------------------------------------------------------------------------

/** Lay the irregular screencast frames onto a constant FPS timeline (repeat the latest frame). */
const writeTimeline = dir => {
  const t0 = frames[0].t;
  const total = Math.round(seconds * FPS);
  let src = 0;
  for (let i = 0; i < total; i++) {
    const t = t0 + i / FPS;
    while (src + 1 < frames.length && frames[src + 1].t <= t) src++;
    fs.writeFileSync(path.join(dir, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(frames[src].data, 'base64'));
  }
  return total;
};

const encode = async (dir, out, codec, crf) => {
  const input = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%05d.jpg'), '-an',
    '-vf', `scale=${W}:${H}:flags=lanczos,format=yuv420p`];
  const video = codec === 'webm'
    ? ['-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0', '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1']
    : ['-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart'];
  await run(ffmpegPath, [...input, ...video, '-r', String(FPS), out], { maxBuffer: 1 << 26 });
  return fs.statSync(out).size;
};

const encodeWithinBudget = async (dir, codec, startCrf, maxCrf) => {
  const out = path.join(outDir, `${base}.${codec}`);
  for (let crf = startCrf; ; crf += 4) {
    const size = await encode(dir, out, codec, crf);
    console.log(`  ${path.basename(out)}  crf ${crf}  ${(size / 1024).toFixed(0)} KB`);
    if (size <= maxBytes) return out;
    if (crf + 4 > maxCrf) throw new Error(`${out} is still above budget at crf ${crf}`);
  }
};

// ---- Main -----------------------------------------------------------------------------------

try {
  const { before, steps } = loadSteps();
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Page.navigate', { url });
  await sleep(1500);
  for (const step of before) await runStep(step);

  await send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  recording = true;
  const started = Date.now();
  let failed;
  let finished = false;
  const script = (async () => {
    for (const step of steps) {
      await runStep(step);
      console.log(`  ${((Date.now() - started) / 1000).toFixed(1)}s  ${JSON.stringify(step)}`);
    }
    finished = true;
  })().catch(e => { failed = e; });
  // Stop at the time budget; if the script finished early, idle out the rest.
  await Promise.race([script, sleep(seconds * 1000)]);
  const left = seconds * 1000 - (Date.now() - started);
  if (left > 0) await sleep(left);
  recording = false;
  await send('Page.stopScreencast');
  if (failed) throw failed;
  // A loop of a half-run flow (e.g. stuck on loading skeletons) is not a demo: refuse to encode it.
  if (!finished) throw new Error(`the steps did not finish within ${seconds}s; nothing was written`);
  if (frames.length < 2) throw new Error('no screencast frames captured');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'record-demo-frames-'));
  try {
    const n = writeTimeline(tmp);
    console.log(`${base}: ${frames.length} screencast frames -> ${n} frames @ ${FPS} fps`);
    fs.mkdirSync(outDir, { recursive: true });
    await encodeWithinBudget(tmp, 'webm', 38, 54);
    await encodeWithinBudget(tmp, 'mp4', 30, 42);
    // Optional poster from the first frame, matching the loop's opening.
    if (wantPoster) await run(ffmpegPath, ['-y', '-loglevel', 'error', '-i', path.join(tmp, 'f00000.jpg'), '-q:v', '4',
      path.join(outDir, `${base}.jpg`)]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
} catch (e) {
  console.error(`record-demo failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  await shutdown();
}

#!/usr/bin/env node
/**
 * Dev-only tool: renders the link-preview image (public/og-image.jpg, 1200×630).
 *
 *   node scripts/og-image.mjs [url]     (default http://localhost:4173/portfolio/, `npm run preview`)
 *
 * Left half: black panel with the name, role, a short line, key facts and skills (HTML below,
 * Geist from public/fonts). Right half: a real frame of the site's hero panel (the live Wine
 * shader with the 3D knot) captured from the running site in the dark theme.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const url = process.argv[2] || 'http://localhost:4173/portfolio/';
const OUT = path.resolve('public/og-image.jpg');
const W = 1200;
const H = 630;
const chromePath = process.env.CHROME_PATH
  || (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/usr/bin/google-chrome');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const font = file => fs.readFileSync(path.resolve('public/fonts', file)).toString('base64');

async function withChrome(fn) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
  const chrome = spawn(chromePath, [
    '--headless=new', '--hide-scrollbars', '--no-first-run', '--disable-extensions',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--user-data-dir=${profile}`,
    '--remote-debugging-port=0', 'about:blank',
  ], { windowsHide: true });

  try {
    // Port 0 lets Chrome pick a free port and write it to DevToolsActivePort in our own profile,
    // so we can never attach to some other browser that already listens on a fixed port.
    let target;

    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200);
      try {
        const port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0].trim();

        target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page');
      } catch {
        // Chrome is still starting.
      }
    }

    if (!target) throw new Error('Chrome did not start');

    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise(r => ws.addEventListener('open', r));
    let id = 0;
    const pending = new Map();

    ws.addEventListener('message', e => {
      const m = JSON.parse(e.data);

      if (m.id && pending.has(m.id)) {
        pending.get(m.id)(m);
        pending.delete(m.id);
      }
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const i = ++id;

      pending.set(i, m => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: i, method, params }));
    });
    const evaluate = async expression =>
      (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

    await send('Page.enable');
    await send('Runtime.enable');

    return await fn({ send, evaluate });
  } finally {
    chrome.kill();
    await sleep(300);
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

/** A 2x PNG of the hero's right panel (wine + knot), caption hidden, after the scene has drawn. */
const captureHero = ({ send, evaluate }) => (async () => {
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 2, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: "try{localStorage.setItem('theme','dark');localStorage.setItem('locale','en')}catch(e){}",
  });
  await send('Page.navigate', { url });

  const deadline = Date.now() + 30000;

  // The caption shows a frame rate once the scene renders; until then it reads "—".
  while (!(await evaluate("/[0-9]/.test(document.querySelector('.hero-caption b')?.textContent ?? '')"))) {
    if (Date.now() > deadline) throw new Error('the hero scene never rendered (no WebGL?)');
    await sleep(300);
  }

  await sleep(2500);
  // Hide the caption and fixed overlays (the custom page scrollbar) that sit over the panel.
  await evaluate(`(() => {
    document.querySelector('.hero-caption').style.visibility = 'hidden';
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).position === 'fixed') el.style.visibility = 'hidden';
    }
  })()`);
  const rect = await evaluate(`(() => {
    const r = document.querySelector('#hero .hero-wine-fallback').parentElement.getBoundingClientRect();
    return { x: r.x + 1, y: r.y, width: r.width - 1, height: r.height };
  })()`);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { ...rect, scale: 1 } });

  return Buffer.from(shot.data, 'base64');
})();

const LEFT = `
  <div class="kicker"><i></i>React Native &amp; Frontend Developer</div>
  <h1>Oleksandr<br>Bryksin</h1>
  <p class="lead">Mobile apps with React Native &amp; Expo,<br>web products with React &amp; Next.js.</p>
  <dl>
    <div><dt>Experience</dt><dd><b>2.5+</b> years</dd></div>
    <div><dt>Commercial projects</dt><dd><b>12</b> 8 mobile · 4 web</dd></div>
    <div><dt>Apps shipped</dt><dd><b>5</b> iOS &amp; Android</dd></div>
  </dl>
  <ul>${['React Native', 'Expo', 'React', 'Next.js', 'TypeScript'].map(s => `<li>${s}</li>`).join('')}</ul>
  <div class="url">edgergard.github.io/portfolio</div>
`;

const page = heroPng => `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Geist; src: url(data:font/woff2;base64,${font('geist-latin.woff2')}) format('woff2'); font-weight: 300 700; }
  @font-face { font-family: 'Geist Mono'; src: url(data:font/woff2;base64,${font('geist-mono-latin.woff2')}) format('woff2'); font-weight: 400 500; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; background: #0A0A0B; overflow: hidden; }
  body { display: grid; grid-template-columns: 600px 600px; font-family: Geist, sans-serif; color: #fff; }
  .left { padding: 54px 48px 44px 56px; display: flex; flex-direction: column; }
  .kicker { display: flex; align-items: center; gap: 12px; font: 500 14px 'Geist Mono', monospace;
    letter-spacing: .06em; text-transform: uppercase; color: #D6D6DB; }
  .kicker i { width: 32px; height: 2px; background: #CC2E4D; }
  h1 { margin-top: 26px; font-size: 76px; font-weight: 500; line-height: .92; letter-spacing: -.05em; }
  .lead { margin-top: 22px; font-size: 19px; line-height: 1.4; color: #CFCFD5; max-width: 30ch; }
  dl { margin-top: 26px; border-top: 1px solid #26262B; }
  dl div { display: flex; justify-content: space-between; align-items: baseline; padding: 9px 0; border-bottom: 1px solid #26262B; }
  dt { font: 400 12px 'Geist Mono', monospace; letter-spacing: .06em; text-transform: uppercase; color: #A3A3AB; }
  dd { font-size: 14px; color: #BEBEC4; }
  dd b { font-size: 21px; font-weight: 500; color: #fff; margin-right: 6px; letter-spacing: -.02em; }
  ul { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 8px; list-style: none; }
  li { font: 500 12px 'Geist Mono', monospace; letter-spacing: .04em; text-transform: uppercase; color: #fff;
    padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(204, 46, 77, .55); background: rgba(139, 20, 38, .35); }
  .url { margin-top: auto; font: 400 13px 'Geist Mono', monospace; letter-spacing: .04em; color: #8E8E96; }
  .right { position: relative; background: #0A0A0B url(data:image/png;base64,${heroPng.toString('base64')}) center / cover no-repeat;
    border-left: 1px solid #1E1E22; }
</style></head><body><div class="left">${LEFT}</div><div class="right"></div></body></html>`;

await withChrome(async cdp => {
  const hero = await captureHero(cdp);

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: 'about:blank' });
  await sleep(300);
  const frameId = (await cdp.send('Page.getFrameTree')).frameTree.frame.id;

  await cdp.send('Page.setDocumentContent', { frameId, html: page(hero) });
  await cdp.evaluate('document.fonts.ready.then(() => true)');
  await sleep(400);
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });

  await sharp(Buffer.from(shot.data, 'base64')).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
});

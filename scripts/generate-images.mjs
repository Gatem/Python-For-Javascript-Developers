// Generates the social share image and app icons into public/ using a local
// Chrome (no download). Run when the branding changes:
//   CHROME_PATH="/path/to/chrome" node scripts/generate-images.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const logo = await fs.readFile(path.join(pub, "favicon.svg"), "utf8");
const chrome =
  process.env.CHROME_PATH ||
  {
    win32: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  }[process.platform] ||
  "/usr/bin/google-chrome";

const FONTS =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@500;600;700&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@500&display=block">';

const chip = (js, py) =>
  `<span class="pair"><span class="js">${js}</span><span class="arrow">→</span><span class="py">${py}</span></span>`;

const og = `<!doctype html><html><head>${FONTS}<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #090c13; color: #e6ebf3; font-family: Geist, sans-serif; overflow: hidden; position: relative; }
  .grid { position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(230,235,243,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,235,243,.06) 1px, transparent 1px); background-size: 60px 60px; -webkit-mask-image: radial-gradient(ellipse 80% 70% at 30% 40%, #000 30%, transparent 80%); }
  .glow { position: absolute; width: 700px; height: 700px; right: -200px; top: -260px; background: radial-gradient(circle, rgba(16,185,129,.28), transparent 65%); }
  .glow2 { position: absolute; width: 600px; height: 600px; left: -260px; bottom: -330px; background: radial-gradient(circle, rgba(245,158,11,.18), transparent 65%); }
  .wrap { position: relative; padding: 64px 72px; height: 100%; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 16px; font-size: 26px; font-weight: 600; letter-spacing: -.01em; }
  .brand svg { width: 56px; height: 56px; }
  .brand i { font-family: "Instrument Serif", serif; font-weight: 400; color: #8a96aa; font-size: 30px; }
  h1 { margin-top: 54px; font-size: 76px; line-height: 1.02; letter-spacing: -.045em; font-weight: 600; max-width: 900px; }
  h1 em { font-family: "Instrument Serif", serif; font-weight: 400; color: #6ee7b7; letter-spacing: -.01em; font-size: 1.08em; }
  .pairs { margin-top: auto; display: flex; gap: 22px; }
  .pair { display: flex; align-items: center; gap: 10px; font-family: "JetBrains Mono", monospace; font-size: 21px; font-variant-ligatures: none; }
  .js { color: #fbbf24; background: rgba(251,191,36,.12); padding: 6px 10px; border-radius: 8px; }
  .py { color: #34d399; background: rgba(52,211,153,.12); padding: 6px 10px; border-radius: 8px; }
  .arrow { color: #8a96aa; }
  .foot { margin-top: 30px; display: flex; justify-content: space-between; font-size: 21px; color: #8a96aa; }
  .foot b { color: #e6ebf3; font-weight: 600; }
</style></head><body><div class="grid"></div><div class="glow"></div><div class="glow2"></div>
<div class="wrap">
  <div class="brand">${logo}<span>Python <i>for</i> JS Developers</span></div>
  <h1>Learn Python <em>through</em> the JavaScript you already know.</h1>
  <div class="pairs">${chip(".push(x)", ".append(x)")}${chip("===", "==")}${chip("null", "None")}${chip("arr.length", "len(arr)")}</div>
  <div class="foot"><span>Free · 33 interactive lessons · Real Python in your browser</span><span>by <b>Sabry E. Farrag</b></span></div>
</div></body></html>`;

const icon = (size) =>
  `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:#0a0f1c}svg{width:${size}px;height:${size}px;display:block}</style></head><body>${logo}</body></html>`;

const browser = await puppeteer.launch({ executablePath: chrome, headless: "new" });
const shot = async (html, w, h, file) => {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(pub, file), type: "png" });
  await page.close();
  console.log("wrote", file);
};
await shot(og, 1200, 630, "og-image.png");
await shot(icon(180), 180, 180, "apple-touch-icon.png");
await shot(icon(192), 192, 192, "icon-192.png");
await shot(icon(512), 512, 512, "icon-512.png");
await shot(icon(32), 32, 32, "favicon-32.png");
await browser.close();

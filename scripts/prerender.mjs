// Pre-renders every route to static HTML after `vite build`, so search
// engines and link previews get real content, titles and descriptions.
// Also writes sitemap.xml, robots.txt and 404.html.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const ssr = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
const HEAD_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
if (!HEAD_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error("index.html is missing the <!--seo:start--> block or the #root element");
}

const page = (key, routePath, opts) =>
  template
    .replace(HEAD_BLOCK, ssr.headFor(key, opts))
    .replace('<div id="root"></div>', `<div id="root">${ssr.render(routePath)}</div>`);

const routes = ssr.allRoutes();
for (const r of routes) {
  const file = path.join(dist, r.file);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, page(r.key, r.path));
}

// GitHub Pages serves 404.html for unknown paths; the app then falls back
// to the landing page. Not indexed.
await fs.writeFile(path.join(dist, "404.html"), page(ssr.HOME, routes[0].path, { noindex: true }));

const today = new Date().toISOString().slice(0, 10);
await fs.writeFile(path.join(dist, "sitemap.xml"), ssr.sitemapXml(today));
await fs.writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ssr.SITE_URL}sitemap.xml\n`);

await fs.rm(ssrDir, { recursive: true, force: true });
console.log(`Pre-rendered ${routes.length} pages + 404.html, sitemap.xml, robots.txt`);

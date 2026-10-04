// Server entry used at build time to pre-render every page to static HTML
// (see scripts/prerender.mjs). Not shipped to the browser.
import { renderToString } from "react-dom/server";
import App from "./App";

export { headFor, allRoutes, sitemapXml } from "./lib/seo";
export { HOME } from "./lib/routes";
export { SITE_URL } from "./config";

export function render(path) {
  return renderToString(<App initialPath={path} />);
}

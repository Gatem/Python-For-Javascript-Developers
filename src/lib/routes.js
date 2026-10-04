// URL scheme (path based, so every lesson is a real, indexable page):
//   {BASE}                          -> landing page
//   {BASE}learn/<module>/<lesson>/  -> a lesson
// BASE is Vite's base path: "/" in dev, "/<repo>/" on GitHub Pages.
// Links from the first release used hashes (#/module/lesson); those are
// still understood and rewritten to the new paths.

export const BASE = import.meta.env.BASE_URL || "/";
export const HOME = "home";

export const pathFor = (key) => (key === HOME ? BASE : `${BASE}learn/${key}/`);

export function routeFromLocation(pathname, hash, isKnown) {
  const legacy = decodeURIComponent((hash || "").replace(/^#\/?/, ""));
  if (legacy && isKnown(legacy)) return legacy;

  let rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  rest = decodeURIComponent(rest).replace(/^\/+|\/+$/g, "").replace(/\/index\.html$/, "");
  if (!rest || rest === "index.html") return HOME;
  const m = rest.match(/^learn\/([^/]+)\/([^/]+)$/);
  if (m && isKnown(`${m[1]}/${m[2]}`)) return `${m[1]}/${m[2]}`;
  return null;
}

// Props for an <a> that navigates inside the app but stays a real link
// (crawlable, and Ctrl/Cmd-click or middle-click still opens a new tab).
export function linkProps(key, navigate) {
  return {
    href: pathFor(key),
    onClick: (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(key);
    },
  };
}

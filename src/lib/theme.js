// Theme preference: "light" | "dark", or null to follow the OS setting.
// index.html runs the same logic inline before first paint to avoid a flash.
export const THEME_KEY = "py4js-theme";

const media = () =>
  typeof window !== "undefined" ? window.matchMedia?.("(prefers-color-scheme: dark)") : null;

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function resolveTheme(pref) {
  return pref || (media()?.matches ? "dark" : "light");
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#090c13" : "#f5f7fb");
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function onSystemThemeChange(fn) {
  const m = media();
  if (!m) return () => {};
  const handler = () => fn(m.matches ? "dark" : "light");
  m.addEventListener("change", handler);
  return () => m.removeEventListener("change", handler);
}

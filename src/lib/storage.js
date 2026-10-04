// All persistence goes through here. Everything lives in localStorage, keyed by
// stable lesson keys ("module-id/lesson-id") so adding or reordering lessons
// never corrupts a learner's progress.

export const KEYS = {
  state: "py4js-state-v2",
  notes: "py4js-notes-v3",
  activity: "py4js-activity",
  quoteHintSeen: "py4js-quote-learned",
};

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the app keeps working in memory.
  }
}

export function readFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function writeFlag(key) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // ignore
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

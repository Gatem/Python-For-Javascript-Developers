import { useState, useEffect, useCallback } from "react";
import { lessonList } from "../data";
import { KEYS, readJSON, writeJSON } from "../lib/storage";

const indexByKey = new Map(lessonList.map((entry, i) => [entry.key, i]));
const FIRST_KEY = lessonList[0].key;

// The current lesson lives in the URL hash (#/module-id/lesson-id), so lessons
// can be bookmarked and shared and the browser back button works. Hash routing
// needs no server config, which keeps GitHub Pages happy.
function keyFromHash() {
  const key = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  return indexByKey.has(key) ? key : null;
}

const hashFor = (key) => `#/${key}`;

function onlyKnownKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(([k]) => indexByKey.has(k)),
  );
}

export function useCourseState() {
  const [saved] = useState(() => readJSON(KEYS.state, {}));
  const [done, setDone] = useState(() => onlyKnownKeys(saved.done));
  const [codes, setCodes] = useState(() => saved.codes || {});
  const [current, setCurrent] = useState(
    () =>
      keyFromHash() || (indexByKey.has(saved.current) ? saved.current : FIRST_KEY),
  );
  useEffect(() => {
    if (window.location.hash !== hashFor(current)) {
      window.history.replaceState(null, "", hashFor(current));
    }
    const onHashChange = () => {
      const key = keyFromHash();
      if (key) setCurrent(key);
      else window.history.replaceState(null, "", hashFor(current));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [current]);

  useEffect(() => {
    writeJSON(KEYS.state, { current, done, codes });
  }, [current, done, codes]);

  const goTo = useCallback((key) => {
    if (!indexByKey.has(key)) return;
    if (window.location.hash !== hashFor(key)) window.location.hash = hashFor(key);
    setCurrent(key);
  }, []);

  const index = indexByKey.get(current);
  const entry = lessonList[index];

  const nav = useCallback(
    (dir) => {
      const next = lessonList[indexByKey.get(current) + dir];
      if (next) goTo(next.key);
    },
    [current, goTo],
  );

  const markComplete = useCallback((key) => {
    setDone((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const updateCode = useCallback(
    (newCode) => {
      setCodes((prev) => {
        if ((prev[current] || "") === newCode) return prev;
        const next = { ...prev };
        if (newCode) next[current] = newCode;
        else delete next[current];
        return next;
      });
    },
    [current],
  );

  const resetProgress = useCallback(() => {
    setDone({});
    setCodes({});
    goTo(FIRST_KEY);
  }, [goTo]);

  return {
    current,
    entry,
    mod: entry.mod,
    lesson: entry.lesson,
    index,
    isFirst: index === 0,
    isLast: index === lessonList.length - 1,
    done,
    completedCount: Object.keys(done).length,
    totalLessons: lessonList.length,
    code: codes[current] || "",
    goTo,
    nav,
    markComplete,
    updateCode,
    resetProgress,
  };
}

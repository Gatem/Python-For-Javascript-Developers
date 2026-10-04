import { useState, useEffect, useCallback } from "react";
import { lessonList } from "../data";
import { KEYS, readJSON, writeJSON } from "../lib/storage";
import { HOME, pathFor, routeFromLocation } from "../lib/routes";

const indexByKey = new Map(lessonList.map((entry, i) => [entry.key, i]));
const FIRST_KEY = lessonList[0].key;
const isKnown = (key) => indexByKey.has(key);
const isBrowser = typeof window !== "undefined";

function currentRoute(initialPath) {
  if (!isBrowser) return routeFromLocation(initialPath || "/", "", isKnown) ?? HOME;
  return routeFromLocation(window.location.pathname, window.location.hash, isKnown);
}

function onlyKnownKeys(obj) {
  return Object.fromEntries(Object.entries(obj || {}).filter(([k]) => isKnown(k)));
}

// `initialPath` is only used when rendering on the server (pre-rendering).
export function useCourseState(initialPath) {
  const [saved] = useState(() => readJSON(KEYS.state, {}));
  const [done, setDone] = useState(() => onlyKnownKeys(saved.done));
  const [codes, setCodes] = useState(() => saved.codes || {});
  const [route] = useState(() => currentRoute(initialPath));
  const [view, setView] = useState(() => (route && route !== HOME ? "lesson" : "home"));
  const [current, setCurrent] = useState(() => {
    if (route && route !== HOME) return route;
    return isKnown(saved.current) ? saved.current : FIRST_KEY;
  });

  // Normalise the URL once (legacy #/ links, unknown paths), then follow
  // the browser's back/forward buttons.
  useEffect(() => {
    const target = view === "lesson" ? pathFor(current) : pathFor(HOME);
    if (window.location.pathname !== target || window.location.hash) {
      window.history.replaceState(null, "", target);
    }
    const onPop = () => {
      const r = routeFromLocation(window.location.pathname, window.location.hash, isKnown);
      if (r && r !== HOME) {
        setCurrent(r);
        setView("lesson");
      } else {
        setView("home");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // Runs once: later navigation goes through goTo/goHome/popstate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    writeJSON(KEYS.state, { current, done, codes });
  }, [current, done, codes]);

  const goTo = useCallback((key) => {
    if (!isKnown(key)) return;
    if (window.location.pathname !== pathFor(key)) window.history.pushState(null, "", pathFor(key));
    setCurrent(key);
    setView("lesson");
  }, []);

  const goHome = useCallback(() => {
    if (window.location.pathname !== pathFor(HOME)) window.history.pushState(null, "", pathFor(HOME));
    setView("home");
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
    view,
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
    goHome,
    nav,
    markComplete,
    updateCode,
    resetProgress,
  };
}

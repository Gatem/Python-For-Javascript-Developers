import { useState, useCallback, useEffect } from "react";
import { lessonList } from "../data";
import { KEYS, readJSON, writeJSON } from "../lib/storage";

const DEFAULT_TARGET = 2;

// Local calendar date (YYYY-MM-DD). toISOString() would use UTC and roll the
// day over at the wrong hour for anyone outside UTC.
function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
}

// Rolls the stored activity over to today. The streak survives only if the
// last active day was yesterday and that day's target was reached.
export function freshDay(prev) {
  const today = localDate();
  if (prev && prev.date === today) return prev;
  const target = prev?.dailyTarget || DEFAULT_TARGET;
  const streakAlive =
    prev && prev.date === yesterday() && prev.todayDone >= target;
  return {
    date: today,
    todayDone: 0,
    dailyTarget: target,
    streak: streakAlive ? prev.streak : 0,
    bestStreak: prev?.bestStreak || 0,
    totalEver: prev?.totalEver || 0,
    completedModules: prev?.completedModules || [],
  };
}

export function useActivity() {
  const [data, setData] = useState(() => freshDay(readJSON(KEYS.activity)));
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    writeJSON(KEYS.activity, data);
  }, [data]);

  // Called once when a lesson is completed for the first time.
  // `doneBefore` is the done-map before this lesson was added.
  const recordCompletion = useCallback((key, doneBefore) => {
    const entry = lessonList.find((e) => e.key === key);
    if (!entry) return;
    const isDone = (k) => k === key || doneBefore[k];
    const moduleDone = entry.mod.lessons.every((l) =>
      isDone(`${entry.mod.id}/${l.id}`),
    );
    const totalCompleted = Object.keys(doneBefore).length + 1;
    const courseDone = lessonList.every((e) => isDone(e.key));

    setData((prev) => {
      const d = freshDay(prev);
      const hitTarget = d.todayDone + 1 === d.dailyTarget;
      const streak = hitTarget ? d.streak + 1 : d.streak;
      return {
        ...d,
        todayDone: d.todayDone + 1,
        totalEver: d.totalEver + 1,
        streak,
        bestStreak: Math.max(d.bestStreak, streak),
        completedModules:
          moduleDone && !d.completedModules.includes(entry.mod.id)
            ? [...d.completedModules, entry.mod.id]
            : d.completedModules,
      };
    });

    const level = courseDone ? "course" : moduleDone ? "module" : "lesson";
    const nextEntry = lessonList[lessonList.indexOf(entry) + 1];
    setCelebration({
      level,
      lessonTitle: entry.lesson.title,
      moduleTitle: entry.mod.title,
      moduleIcon: entry.mod.icon,
      nextModule:
        level === "module" && nextEntry && nextEntry.mod !== entry.mod
          ? nextEntry.mod
          : null,
      totalCompleted,
      totalLessons: lessonList.length,
    });
  }, []);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  return {
    activity: data,
    celebration,
    recordCompletion,
    dismissCelebration,
  };
}

// One-time migration from the first release, which stored progress by array
// index ("0-1") and used older module/lesson ids. Safe to run on every load.
import { KEYS, readJSON, writeJSON, removeKey } from "./storage";

// Module order and lesson ids exactly as they were in the first release.
const LEGACY_COURSE = [
  ["syntax", ["variables", "strings", "conditionals"]],
  ["collections", ["lists", "dicts", "tuples_sets"]],
  ["functions", ["basics", "comprehensions", "decorators"]],
  ["oop", ["classes", "dunder"]],
  ["modules", ["imports", "errors"]],
  ["gotchas", ["none_is", "scope"]],
  ["loops", ["loops_basic"]],
  ["fileio", ["files", "json_regex"]],
  ["advanced1", ["generators"]],
  ["advanced2", ["dataclasses", "typehints", "pattern_match"]],
  ["advanced3", ["async_py", "testing"]],
  ["pythonic", ["patterns"]],
  ["ecosystem", ["stdlib", "tooling"]],
];

const MODULE_RENAMES = {
  advanced1: "generators",
  advanced2: "modern",
  advanced3: "async-testing",
};

const LESSON_RENAMES = {
  tuples_sets: "tuples-sets",
  none_is: "none-is",
  loops_basic: "loops",
  json_regex: "json-regex",
  pattern_match: "pattern-match",
  async_py: "async",
};

export const renameModule = (id) => MODULE_RENAMES[id] || id;
const renameLesson = (id) => LESSON_RENAMES[id] || id;
const newKey = (modId, lessonId) => `${renameModule(modId)}/${renameLesson(lessonId)}`;

function indexKeyToNew(indexKey) {
  const [mi, li] = String(indexKey).split("-").map(Number);
  const mod = LEGACY_COURSE[mi];
  const lessonId = mod?.[1][li];
  return lessonId ? newKey(mod[0], lessonId) : null;
}

function remapKeys(obj, mapKey) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const nk = mapKey(k);
    if (nk) out[nk] = v;
  }
  return out;
}

export function migrateStorage() {
  const old = readJSON("py4js-state");
  if (old && !readJSON(KEYS.state)) {
    writeJSON(KEYS.state, {
      current: indexKeyToNew(`${old.curMod ?? 0}-${old.curLes ?? 0}`),
      done: remapKeys(old.done, indexKeyToNew),
      codes: remapKeys(old.codes, indexKeyToNew),
    });
  }
  if (old) removeKey("py4js-state");

  const oldNotes = readJSON("py4js-notes-v2");
  if (oldNotes && !readJSON(KEYS.notes)) {
    const valid = new Map(
      LEGACY_COURSE.flatMap(([m, ls]) => ls.map((l) => [`${m}-${l}`, newKey(m, l)])),
    );
    writeJSON(KEYS.notes, remapKeys(oldNotes, (k) => valid.get(k)));
  }
  if (oldNotes) removeKey("py4js-notes-v2");

  const activity = readJSON(KEYS.activity);
  if (activity?.completedModules?.some((id) => MODULE_RENAMES[id])) {
    activity.completedModules = activity.completedModules.map(renameModule);
    writeJSON(KEYS.activity, activity);
  }
}

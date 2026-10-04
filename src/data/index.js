import syntax from "./modules/syntax";
import collections from "./modules/collections";
import functions from "./modules/functions";
import oop from "./modules/oop";
import modulesAndErrors from "./modules/modulesAndErrors";
import gotchas from "./modules/gotchas";
import loops from "./modules/loops";
import fileio from "./modules/fileio";
import generators from "./modules/generators";
import modernPython from "./modules/modernPython";
import asyncTesting from "./modules/asyncTesting";
import pythonic from "./modules/pythonic";
import ecosystem from "./modules/ecosystem";

// Order matters: it is the "Next lesson" order, and it must stay grouped by tier
// so the sidebar (grouped by tier) shows lessons in the same order.
export const courseModules = [
  syntax,
  collections,
  loops,
  functions,
  gotchas,
  oop,
  modulesAndErrors,
  fileio,
  generators,
  modernPython,
  asyncTesting,
  pythonic,
  ecosystem,
];

export const lessonKey = (modId, lessonId) => `${modId}/${lessonId}`;

// Flat, ordered list of every lesson with its position and stable key.
export const lessonList = courseModules.flatMap((mod, mi) =>
  mod.lessons.map((lesson, li) => ({
    key: lessonKey(mod.id, lesson.id),
    mod,
    lesson,
    mi,
    li,
  })),
);

export const TIERS = {
  1: { label: "Foundations", icon: "\u{1F331}", color: "emerald" },
  2: { label: "Core Python", icon: "\u{1F40D}", color: "blue" },
  3: { label: "Professional", icon: "\u{26A1}", color: "violet" },
  4: { label: "Mastery", icon: "\u{1F451}", color: "amber" },
};

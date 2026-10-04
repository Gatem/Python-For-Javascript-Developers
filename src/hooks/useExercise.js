import { useState, useCallback } from "react";
import { validateCode } from "../lib/validation";
import { runPython } from "../lib/pythonRunner";

// Drives one exercise:
//  run()   executes the learner's code and shows its real output
//  check() static checks (JS habits, required technique), then executes the
//          code together with the exercise's hidden tests
// `result` shape: { kind: "run" | "check", pass, errors, warnings, stdout, error, testFailure }
export function useExercise(lesson, code, onPass) {
  const exercise = lesson.exercise;
  const [ui, setUi] = useState({ lesson, showHint: false, showAnswer: false });
  // Results are tagged with their lesson so a slow run that finishes after
  // the learner moved on is simply ignored.
  const [outcome, setOutcome] = useState(null); // { lesson, result }
  const [pending, setPending] = useState(null); // { lesson, kind }

  // Reset hint/answer visibility when the lesson changes.
  if (ui.lesson !== lesson) setUi({ lesson, showHint: false, showAnswer: false });

  const result = outcome?.lesson === lesson ? outcome.result : null;
  const busy = pending?.lesson === lesson ? pending.kind : null;

  const execute = useCallback(
    async (kind) => {
      if (!exercise) return;
      const show = (r) => setOutcome({ lesson, result: { kind, ...r } });
      if (!code.trim()) {
        show({ pass: false, errors: [{ type: "error", msg: "Nothing to run yet. Write some Python first." }], warnings: [] });
        return;
      }
      let errors = [];
      let warnings = [];
      if (kind === "check") {
        const s = validateCode(code, exercise.checks, { checkComments: !!exercise.checkComments });
        errors = s.errors;
        warnings = s.warnings;
        if (!s.pass) {
          show({ pass: false, errors, warnings });
          return;
        }
      }
      setPending({ lesson, kind });
      setOutcome(null);
      try {
        const r = await runPython({
          setup: exercise.setup || "",
          code,
          tests: exercise.tests || "",
          runTests: kind === "check",
        });
        const pass = kind === "check" && r.ok;
        show({ pass, errors, warnings, stdout: r.stdout, error: r.error, testFailure: r.testFailure });
        if (pass) onPass(lesson);
      } catch (err) {
        show({ pass: false, errors: [{ type: "error", msg: err.message }], warnings: [] });
      } finally {
        setPending((p) => (p?.lesson === lesson ? null : p));
      }
    },
    [exercise, lesson, code, onPass],
  );

  const run = useCallback(() => execute("run"), [execute]);
  const check = useCallback(() => execute("check"), [execute]);
  const toggleAnswer = useCallback(() => setUi((u) => ({ ...u, showAnswer: !u.showAnswer })), []);
  const toggleHint = useCallback(() => setUi((u) => ({ ...u, showHint: !u.showHint })), []);
  const clearResult = useCallback(() => setOutcome(null), []);

  return {
    showAnswer: ui.showAnswer,
    toggleAnswer,
    showHint: ui.showHint,
    toggleHint,
    result,
    busy,
    run,
    check,
    clearResult,
  };
}

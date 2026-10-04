// Verifies every lesson and exercise in the course:
//  - lesson shape and unique ids
//  - the reference answer passes the static checks
//  - the reference answer passes the hidden tests when executed in Pyodide
//  - the hidden tests reject an empty solution (so they actually test something)
// Run: npm run test:exercises   (filter: npm run test:exercises -- -t "syntax")
import { describe, it, expect, beforeAll } from "vitest";
import { loadPyodide } from "pyodide";
import { courseModules } from "./index";
import { validateCode } from "../lib/validation";
import { PY_HARNESS, runInPyodide } from "../lib/pyHarness";

let py;
beforeAll(async () => {
  py = await loadPyodide();
  await py.runPythonAsync(PY_HARNESS);
}, 300000);

describe("course structure", () => {
  it("has unique module ids and lesson ids per module", () => {
    const modIds = courseModules.map((m) => m.id);
    expect(new Set(modIds).size).toBe(modIds.length);
    for (const m of courseModules) {
      const ids = m.lessons.map((l) => l.id);
      expect(new Set(ids).size, m.id).toBe(ids.length);
      for (const id of [m.id, ...ids]) expect(id, m.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  for (const m of courseModules) {
    for (const l of m.lessons) {
      it(`${m.id}/${l.id} has all lesson fields`, () => {
        for (const f of ["title", "content", "jsCode", "pyCode"]) {
          expect(typeof l[f], f).toBe("string");
        }
        expect(Array.isArray(l.keyDiffs)).toBe(true);
        expect(Array.isArray(l.tips)).toBe(true);
        for (const d of l.keyDiffs) expect(JSON.stringify(d), "no literal \n in tables").not.toMatch(/\\n/);
        const ex = l.exercise;
        expect(ex, "exercise").toBeTruthy();
        for (const f of ["question", "answer", "hint", "tests"]) {
          expect(typeof ex[f], f).toBe("string");
          expect(ex[f].trim().length, f).toBeGreaterThan(0);
        }
        expect(typeof ex.checks).toBe("function");
      });
    }
  }
});

for (const m of courseModules) {
  describe(m.id, () => {
    for (const l of m.lessons) {
      const ex = l.exercise;
      if (!ex) continue;
      const opts = { checkComments: !!ex.checkComments };

      it(`${l.id}: answer passes static checks`, () => {
        const r = validateCode(ex.answer, ex.checks, opts);
        expect(r.errors, JSON.stringify(r.errors)).toEqual([]);
      });

      it(`${l.id}: answer passes hidden tests`, async () => {
        const r = await runInPyodide(py, { setup: ex.setup || "", code: ex.answer, tests: ex.tests, runTests: true });
        expect(r.ok, JSON.stringify(r, null, 2)).toBe(true);
        if (ex.output != null) expect(r.stdout.trim()).toBe(ex.output.trim());
      }, 180000);

      it(`${l.id}: hidden tests reject an empty solution`, async () => {
        const r = await runInPyodide(py, { setup: ex.setup || "", code: "pass", tests: ex.tests, runTests: true });
        expect(r.ok).toBe(false);
      }, 180000);
    }
  });
}

describe("harness", () => {
  it("does not leak fake modules from one run's setup into the next", async () => {
    const setup = "import sys, types\nsys.modules['fakemod'] = types.ModuleType('fakemod')";
    const first = await runInPyodide(py, { setup, code: "import fakemod" });
    expect(first.ok).toBe(true);
    const second = await runInPyodide(py, { code: "import fakemod" });
    expect(second.ok).toBe(false);
    expect(second.error).toMatch(/ModuleNotFoundError/);
  });

  it("reports errors with line numbers from the learner's code", async () => {
    const r = await runInPyodide(py, { code: "x = 1\ny = x + 'a'" });
    expect(r.error).toMatch(/line 2/);
    expect(r.error).toMatch(/TypeError/);
  });
});

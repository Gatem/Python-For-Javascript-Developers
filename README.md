# 🐍 Python for JS Developers

An interactive course that teaches Python by mapping it to what you already know from JavaScript. Every lesson puts JS and Python side by side, points out the traps JS habits lead you into, and ends with an exercise that runs **real Python in your browser**. You don't need to install anything.

**[▶ Start learning](https://gatem.github.io/Python-For-Javascript-Developers/)**

## What's inside

33 lessons in 13 modules, from first steps to professional tooling. The course targets Python 3.12+, and your code runs on Python 3.14 in the browser via [Pyodide](https://pyodide.org).

| Tier | Modules |
|---|---|
| 🌱 Foundations | Syntax Bridge · Data Structures · Loops & Iteration |
| 🐍 Core Python | Functions · Gotchas & Pitfalls · OOP · Modules & Errors |
| ⚡ Professional | File I/O · Generators & Context Managers · Modern Python · Async & Testing |
| 👑 Mastery | Pythonic Patterns · Ecosystem & Tooling (venv, pip, uv, ruff) |

Each lesson has:

- **An explanation** written for JS developers ("this is `Array.push`, but…")
- **A quick-reference table** of JS → Python equivalents
- **Heads-up tips** for the mistakes everyone makes
- **Side-by-side JS and Python code**
- **An exercise** with a hint, a reference answer, and hidden tests that actually run your code

Other features:

- **Notes**: write notes per lesson, or select lesson text to quote it.
- **Saved progress**: progress and code are stored in your browser.
- **Daily streaks.**
- **Deep links**: every lesson has its own URL (`#/module/lesson`).

## How exercises are checked

1. **Static checks** catch JS habits (`console.log`, `===`, `null`, `.push()`, braces…) and make sure you used the technique the lesson teaches. Comments are ignored, so an answer typed into a comment doesn't count.
2. **Your code runs** in Pyodide inside a Web Worker, so the page never freezes. Runs are stopped after 10 seconds, which catches infinite loops.
3. **Hidden tests** (plain Python `assert`s) check what your code actually does. Any correct solution passes, not only the one in the reference answer.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (including accessibility rules) |
| `npm test` | Fast unit tests |
| `npm run test:exercises` | Runs **every** reference answer and its hidden tests in real Python (slower; filter with `-- -t "oop"`) |

## Deploying to GitHub Pages

The repo includes `.github/workflows/deploy.yml`, which lints, tests, builds and deploys on every push to `main`.

1. Push the repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run the workflow manually from the **Actions** tab.

The build uses a relative base path and hash routing, so it works under any repo name without extra configuration.

## Adding or editing lessons

Lessons live in `src/data/modules/*.js`. A lesson looks like this:

```js
{
  id: "my-lesson",              // kebab-case, never change it after publishing (progress is keyed on it)
  title: "My Lesson",
  content: "Paragraphs separated by \n\n",
  keyDiffs: [{ js: "arr.push(x)", py: "arr.append(x)", note: "..." }],
  tips: ["..."],
  jsCode: "// JavaScript example",
  pyCode: "# Python example",
  exercise: {
    question: "What to do",
    prompt: "Optional starter / JS code to convert",
    hint: "A nudge, not the answer",
    answer: "reference solution",
    setup: "optional Python run before the learner's code",
    tests: "assert result == 42, 'helpful message'",  // runs after the learner's code; can use __output__ (stdout) and __source__
    output: "optional exact expected stdout",
    checks: (code) => [has(code, /\.append\(/, "Use .append()")],
  },
}
```

Run `npm run test:exercises` after editing. It confirms that every reference answer passes its tests and that the tests reject an empty solution.

**Ids are permanent.** Learners' progress, saved code and notes are keyed on `module-id/lesson-id`. If you ever have to rename one, add a mapping in `src/lib/migrate.js`.

## Tech

React 19, Vite, Tailwind CSS 4, Pyodide (loaded from the jsDelivr CDN on first run), Vitest, and ESLint with `jsx-a11y`.

## License

[MIT](LICENSE)

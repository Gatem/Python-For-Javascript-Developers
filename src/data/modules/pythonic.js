import { has, hasNot } from "../../lib/validation";

export default {
  id: "pythonic", title: "Pythonic Patterns", icon: "🎯", subtitle: "Write like a pro", tier: 4,
  lessons: [
    {
      id: "patterns", title: "Idiomatic Python",
      content: `Every language has its preferred style. Code can be correct but not idiomatic. These patterns are what separate "someone who writes JS in Python" from "a Python developer". Adopting them makes your code shorter and easier for other Python developers to read.

The biggest mindset shift: Python favors comprehensions, built-in functions, and plain loops over long method chains. Instead of arr.filter().map().reduce(), you reach for a comprehension plus sum(), max(), any(), or all(). And instead of checking sizes (arr.length > 0), you rely on truthiness (if arr:).

The collections module is your secret weapon. Counter counts things, defaultdict removes "does this key exist yet?" checks, and deque gives you fast appends and pops at both ends. For small record types, use a dataclass or typing.NamedTuple instead of a loose dict.

When you are unsure, write the plain loop first. If a comprehension or a built-in makes it clearer, switch; if it makes it cleverer but harder to read, keep the loop.`,
      keyDiffs: [
        { js: "if (arr.length > 0)", py: "if arr:", note: "Truthiness check" },
        { js: "arr.forEach((x, i) => ...)", py: "for i, x in enumerate(arr):", note: "enumerate gives the index" },
        { js: "[a, b] = [b, a]", py: "a, b = b, a", note: "Tuple swap" },
        { js: "[1, 2, 3].includes(x)", py: "x in (1, 2, 3)", note: "Membership test" },
        { js: "Object.fromEntries(keys.map((k, i) => [k, vals[i]]))", py: "dict(zip(keys, vals))", note: "zip + dict" },
        { js: "Manual counting loop", py: "Counter(items)", note: "collections.Counter" },
        { js: "(obj[k] ??= []).push(v)", py: "groups[k].append(v)", note: "defaultdict(list)" },
      ],
      tips: [
        "Run 'import this' in a Python REPL to read the Zen of Python. It captures the philosophy behind these patterns.",
        "Counter('hello') gives character frequencies in one call, and .most_common(3) gives the top three.",
        "Use sum(), min(), max(), any(), and all() with generator expressions instead of reduce().",
        "When in doubt, write it as a loop first, then see if a comprehension makes it clearer. Do not force it.",
      ],
      jsCode: "// JavaScript patterns\nif (arr.length === 0) { }\narr.forEach((item, i) => console.log(i, item));\n[a, b] = [b, a];\nif ([1, 2, 3].includes(x)) { }\n\nconst obj = Object.fromEntries(\n  keys.map((k, i) => [k, vals[i]])\n);\n\nconst counts = {};\nfor (const w of words) counts[w] = (counts[w] ?? 0) + 1;",
      pyCode: `# Pythonic patterns
if not arr:                    # empty check
    pass
for i, item in enumerate(arr): # index + value
    print(i, item)
a, b = b, a                    # swap
if x in (1, 2, 3):             # membership
    pass

d = dict(zip(keys, vals))      # zip + dict

from collections import Counter
counts = Counter(words)        # count anything
top_3 = counts.most_common(3)

from collections import defaultdict
grouped = defaultdict(list)
for item in items:
    grouped[item.category].append(item)`,
      exercise: {
        question: "Refactor this non-Pythonic code (my_list, x, y and text are already defined):",
        prompt: "# 1\nif len(my_list) > 0:\n    print(\"not empty\")\n# 2\ni = 0\nfor item in my_list:\n    print(str(i) + \": \" + str(item))\n    i = i + 1\n# 3\ntemp = x\nx = y\ny = temp\n# 4\nresult = []\nfor num in range(20):\n    if num % 2 == 0:\n        result.append(num * num)\n# 5\nword_freq = {}\nfor word in text.split():\n    if word in word_freq:\n        word_freq[word] += 1\n    else:\n        word_freq[word] = 1",
        hint: "Use truthiness (if my_list:), enumerate() with an f-string, tuple swap (x, y = y, x), a list comprehension with an if clause, and collections.Counter.",
        setup: `my_list = ["a", "b", "c"]
x, y = 1, 2
text = "the cat saw the hat"`,
        answer: `if my_list:
    print("not empty")

for i, item in enumerate(my_list):
    print(f"{i}: {item}")

x, y = y, x

result = [num * num for num in range(20) if num % 2 == 0]

from collections import Counter
word_freq = Counter(text.split())`,
        tests: `_lines = __output__.splitlines()
assert "not empty" in _lines, "Step 1 should still print 'not empty'"
for _expected in ("0: a", "1: b", "2: c"):
    assert _expected in _lines, f"Step 2 should print {_expected!r}"
assert (x, y) == (2, 1), "Step 3: x and y should be swapped"
assert result == [n * n for n in range(20) if n % 2 == 0], "Step 4: result should hold the squares of the even numbers below 20"
assert dict(word_freq) == {"the": 2, "cat": 1, "saw": 1, "hat": 1}, "Step 5: word_freq should count each word"`,
        checks: (code) => [
          has(code, /if\s+my_list\s*:/, "Use 'if my_list:' (truthiness check)"),
          has(code, /enumerate\(/, "Use enumerate() instead of a manual counter"),
          has(code, /\bx\s*,\s*y\s*=\s*y\s*,\s*x/, "Use tuple swap: x, y = y, x"),
          has(code, /\[[^\]]*\bfor\b[^\]]*\bin\b[^\]]*\bif\b/, "Use a list comprehension with an if clause"),
          has(code, /Counter\(/, "Use collections.Counter"),
          hasNot(code, /len\(my_list\)\s*>/, "Truthiness is more Pythonic than len() > 0", "warning"),
          hasNot(code, /\bi\s*=\s*i\s*\+\s*1|\bi\s*\+=\s*1/, "Use enumerate() instead of incrementing a counter", "warning"),
        ],
      },
    },
    {
      id: "modern-idioms", title: "Modern Idioms",
      content: `Python keeps adding small features that remove boilerplate. You will see them in any recent codebase, so it pays to recognize them.

The walrus operator := (3.8) assigns and returns a value inside an expression. It shines in while loops (while (line := f.readline()):) and in comprehensions where you would otherwise compute something twice: [s for r in rows if (s := r.strip())].

f-strings have a debugging shortcut: f"{total=}" prints total=42, with the expression text included. It is the console.log({ total }) trick, built into the language.

The * and ** operators also unpack at call sites: f(*args) spreads a list into positional arguments and f(**options) spreads a dict into keyword arguments, like fn(...args) in JS.

Dicts can be merged with | (3.9): merged = defaults | overrides, where the right side wins, like { ...defaults, ...overrides }. And d |= other updates in place.

Strings gained removeprefix() and removesuffix() (3.9). Unlike lstrip()/rstrip(), which remove any of the given CHARACTERS, these remove an exact substring once, which is almost always what you meant.

itertools.batched(iterable, n) (3.12) splits any iterable into tuples of n items, a chunk() helper you no longer need to write. And for file paths, prefer pathlib.Path over the older os.path functions.`,
      keyDiffs: [
        { js: "let m; while ((m = re.exec(s)))", py: "while (m := pattern.search(s)):", note: "Walrus :=" },
        { js: "console.log({ total })", py: "print(f\"{total=}\")", note: "Prints total=42" },
        { js: "fn(...args)", py: "fn(*args)", note: "Spread into positional args" },
        { js: "fn({ ...options })", py: "fn(**options)", note: "Spread into keyword args" },
        { js: "{ ...defaults, ...overrides }", py: "defaults | overrides", note: "Dict merge (3.9+)" },
        { js: "s.startsWith(p) ? s.slice(p.length) : s", py: "s.removeprefix(p)", note: "Exact prefix, once" },
        { js: "lodash _.chunk(arr, 3)", py: "itertools.batched(arr, 3)", note: "Built in (3.12+)" },
      ],
      tips: [
        "Use the walrus operator sparingly: it is great in while loops and comprehensions, confusing in long expressions.",
        "\"report.csv\".rstrip(\".csv\") is a classic bug: it strips the characters ., c, s, v. Use removesuffix(\".csv\").",
        "f\"{value=}\" also works with format specs: f\"{price=:.2f}\" prints price=9.99.",
        "batched() yields tuples, and the last batch may be shorter.",
      ],
      jsCode: "// JavaScript\nconst cleaned = rows\n  .map(r => r.trim())\n  .filter(s => s.length > 0);\n\nconsole.log({ total });\n\nconst settings = { ...defaults, ...overrides };\n\nconst name = file.endsWith(\".csv\")\n  ? file.slice(0, -4)\n  : file;\n\n// chunk() helper or lodash\nconst batches = _.chunk(items, 3);",
      pyCode: `# Walrus: assign inside an expression
cleaned = [s for r in rows if (s := r.strip())]

# Self-documenting debug output
total = 42
print(f"{total=}")          # total=42

# Unpacking at the call site
def connect(host, port, timeout=5): ...
args = ["localhost", 8080]
options = {"timeout": 10}
connect(*args, **options)

# Dict merge
settings = defaults | overrides
settings |= {"debug": True}

# Exact prefix/suffix removal
"report_2024.csv".removeprefix("report_")   # '2024.csv'
"report_2024.csv".removesuffix(".csv")      # 'report_2024'

# Batching (3.12+)
from itertools import batched
list(batched(range(7), 3))  # [(0, 1, 2), (3, 4, 5), (6,)]`,
      exercise: {
        question: "Use modern idioms (readings, defaults, overrides and filenames are already defined):",
        prompt: "readings = [\"  temp=21  \", \"\", \"humidity=40\", \"   \", \"temp=23\"]\ndefaults = {\"unit\": \"C\", \"precision\": 1}\noverrides = {\"precision\": 2}\nfilenames = [\"report_2024.csv\", \"report_2025.csv\", \"notes.txt\"]\n\n1. cleaned: the stripped, non-empty readings, using the walrus operator\n   in a comprehension\n2. settings: defaults merged with overrides using |\n3. names: each filename with the \"report_\" prefix and \".csv\" suffix removed\n   (use removeprefix/removesuffix)\n4. batches: list(batched(range(7), 3))\n5. Print settings with the f\"{settings=}\" debug syntax",
        hint: "For step 1: [s for r in readings if (s := r.strip())]. For step 3 chain the calls: f.removeprefix(\"report_\").removesuffix(\".csv\").",
        setup: `readings = ["  temp=21  ", "", "humidity=40", "   ", "temp=23"]
defaults = {"unit": "C", "precision": 1}
overrides = {"precision": 2}
filenames = ["report_2024.csv", "report_2025.csv", "notes.txt"]`,
        answer: `from itertools import batched

cleaned = [s for r in readings if (s := r.strip())]
settings = defaults | overrides
names = [f.removeprefix("report_").removesuffix(".csv") for f in filenames]
batches = list(batched(range(7), 3))
print(f"{settings=}")`,
        output: "settings={'unit': 'C', 'precision': 2}",
        tests: `for _name in ("cleaned", "settings", "names", "batches"):
    assert _name in globals(), f"Define {_name}"
assert cleaned == ["temp=21", "humidity=40", "temp=23"], f"cleaned should be the stripped non-empty readings, got {cleaned!r}"
assert settings == {"unit": "C", "precision": 2}, "settings should be defaults merged with overrides (overrides win)"
assert defaults == {"unit": "C", "precision": 1}, "Do not modify defaults; | creates a new dict"
assert names == ["2024", "2025", "notes.txt"], f"names should be ['2024', '2025', 'notes.txt'], got {names!r}"
assert [tuple(b) for b in batches] == [(0, 1, 2), (3, 4, 5), (6,)], "batches should be [(0, 1, 2), (3, 4, 5), (6,)]"
assert "settings={" in __output__, "Print with the debug syntax: print(f\\"{settings=}\\")"`,
        checks: (code) => [
          has(code, /:=/, "Use the walrus operator := in the comprehension"),
          has(code, /defaults\s*\|\s*overrides/, "Merge with defaults | overrides"),
          has(code, /removeprefix\(/, "Use removeprefix()"),
          has(code, /removesuffix\(/, "Use removesuffix()"),
          has(code, /batched\(/, "Use itertools.batched()"),
          has(code, /f["']\{settings=\}/, "Print with f\"{settings=}\""),
          hasNot(code, /rstrip\(\s*["']\.csv/, "rstrip('.csv') strips characters, not the suffix. Use removesuffix()"),
        ],
      },
    },
  ],
};

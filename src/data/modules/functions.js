import { has, hasNot } from "../../lib/validation";

export default {
  id: "functions", title: "Functions", icon: "⚡", subtitle: "Args, Comprehensions, Decorators", tier: 2,
  lessons: [
    {
      id: "basics", title: "Function Basics",
      content: "Functions in Python are defined with 'def' instead of 'function'. No curly braces: just a colon and indentation, like conditionals. Arrow functions become lambdas, but lambdas are limited to a single expression.\n\nThe real upgrade is keyword arguments. In JS, if a function takes 5 parameters, you have to remember the order or pass an options object and destructure it. Python lets you call greet(greeting=\"Hi\", name=\"Alice\"), specifying arguments by name in any order. This makes function calls self-documenting, and it removes most of the reasons JS code uses options objects.\n\nPython also has **kwargs, which collects any extra named arguments into a dictionary. It plays the role of the JS 'options object' pattern, but the caller just passes normal named arguments instead of building an object. Combined with *args (which collects extra positional arguments into a tuple, like JS rest parameters), this gives you a lot of flexibility.\n\nParameter ordering is strict. The order is: regular parameters (those with defaults after those without), then *args, then keyword-only parameters, then **kwargs. def fn(a, b=2, *args, option=True, **kwargs) is valid. Getting the order wrong is a SyntaxError.\n\nLambda functions are limited to a single expression. You cannot put statements (if blocks, for loops, assignments) inside a lambda. If your logic is more than one line, use a regular def function. A lambda returns its expression automatically; you never write 'return' inside it.",
      keyDiffs: [
        { js: "function greet(name) {}", py: "def greet(name):", note: "'def' keyword, colon, indent" },
        { js: "(a, b) => a + b", py: "lambda a, b: a + b", note: "Single expression only" },
        { js: "...args (rest)", py: "*args", note: "Collects into a tuple" },
        { js: "fn(a, { verbose: true })", py: "fn(a, verbose=True)", note: "Named args replace options objects" },
        { js: "function fn(a, opts = {})", py: "def fn(a, **kwargs):", note: "Extra named args land in a dict" },
        { js: "fn(a, b)", py: "fn(b=2, a=1)", note: "Can name args in any order" },
        { js: "return undefined", py: "return None", note: "Implicit return is None" },
      ],
      tips: [
        "Functions without a return statement implicitly return None (similar to JS returning undefined).",
        "You can enforce keyword-only args: def fn(a, *, b) means b MUST be passed by name.",
        "Type hints are optional but helpful: def add(a: int, b: int) -> int:",
        "Parameters with defaults must come after parameters without them: def fn(a, b, c=3, **kwargs). Getting the order wrong is a SyntaxError.",
        "Lambda functions are limited to a single expression. For anything more complex, use a regular def function.",
      ],
      jsCode: "// JavaScript\nfunction greet(name, greeting = \"Hello\") {\n  return `${greeting}, ${name}!`;\n}\n\nconst add = (a, b) => a + b;\n\nfunction sum(...numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}\n\nfunction create(name, opts = {}) {\n  return { name, ...opts };\n}",
      pyCode: "# Python\ndef greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\nadd = lambda a, b: a + b\n\ndef total(*numbers):    # *args = rest\n    return sum(numbers)\n\ndef create(name, **kwargs):   # **kwargs = extra named args\n    return {\"name\": name, **kwargs}\n\ncreate(\"box\", color=\"red\", size=3)\n\n# Named arguments in any order!\ngreet(greeting=\"Hi\", name=\"Alice\")\n\n# Type hints (optional)\ndef add_typed(a: int, b: int) -> int:\n    return a + b",
      exercise: {
        question: "Write a Python function called build_profile:",
        prompt: "Requirements:\n1. Takes name (required), age (required)\n2. Takes any additional keyword arguments (**kwargs)\n3. Returns a dict with name, age, and all extra kwargs\n\nExample:\nbuild_profile(\"Alice\", 25, city=\"NYC\", job=\"Dev\")\n-> {\"name\": \"Alice\", \"age\": 25, \"city\": \"NYC\", \"job\": \"Dev\"}",
        answer: "def build_profile(name, age, **kwargs):\n    return {\"name\": name, \"age\": age, **kwargs}",
        hint: "Put **kwargs last in the parameter list. Inside the function kwargs is a plain dict, and {**kwargs} unpacks it into a new dict literal.",
        tests: String.raw`
assert callable(globals().get("build_profile")), "Define a function called build_profile"
r = build_profile("Alice", 25, city="NYC", job="Dev")
assert r == {"name": "Alice", "age": 25, "city": "NYC", "job": "Dev"}, f"build_profile('Alice', 25, city='NYC', job='Dev') returned {r!r}"
r = build_profile("Bob", 30)
assert r == {"name": "Bob", "age": 30}, f"With no extra keyword arguments, return only name and age. Got {r!r}"
`,
        checks: (code) => [
          has(code, /def build_profile\s*\(\s*name\s*,\s*age/, "Define: def build_profile(name, age, **kwargs):"),
          has(code, /\*\*\w+/, "Use **kwargs to collect additional keyword arguments"),
          hasNot(code, "function ", "SyntaxError: Python uses 'def', not 'function'"),
        ],
      },
    },
    {
      id: "comprehensions", title: "List Comprehensions",
      content: "This is the feature that makes Python developers smug. List comprehensions replace map() and filter() with a single, readable expression. Instead of arr.filter(x => x > 5).map(x => x * 2), you write [x * 2 for x in arr if x > 5]. Same result, one clean line.\n\nThe syntax reads like English: \"give me [expression] FOR each item IN iterable IF condition\". Once this pattern locks into your brain, you will reach for it constantly. It works for dictionaries ({k: v for ...}), sets ({x for ...}), and generators ((x for ...)) too.\n\nGenerator expressions (with parentheses instead of brackets) are lazy: they compute values one at a time as needed instead of building the entire list in memory. sum(x**2 for x in range(1000000)) processes a million values without storing a million results.\n\nA word of caution: do not make comprehensions too complex. One nested for (like flattening a matrix) plus a simple condition is fine. If you need three for-clauses, several conditions, or you have to read it twice to understand it, use a regular loop. Readability matters more than cleverness. Also avoid side effects inside comprehensions (like calling functions that modify external state). Comprehensions are for building new collections, not for running actions.",
      keyDiffs: [
        { js: "arr.map(x => x * 2)", py: "[x * 2 for x in arr]", note: "List comprehension" },
        { js: "arr.filter(x => x > 5)", py: "[x for x in arr if x > 5]", note: "Add 'if' clause" },
        { js: "arr.filter().map()", py: "[expr for x in arr if cond]", note: "One expression" },
        { js: "arr.flat()", py: "[x for row in arr for x in row]", note: "Nested for, outer loop first" },
        { js: "Object.fromEntries(arr.map(...))", py: "{k: v for k, v in items}", note: "Dict comprehension" },
        { js: "Iterator helpers (lazy)", py: "(x for x in arr)", note: "Generator expression" },
      ],
      tips: [
        "Keep comprehensions simple: one nested for is fine, but if you need more loops or several conditions, write a regular loop.",
        "Generator expressions (parentheses) are memory-efficient for large datasets. Use them with sum(), any(), all().",
        "You can omit the extra parentheses when passing a generator to a function: sum(x**2 for x in nums).",
        "In a nested comprehension, the for-clauses read in the same order as nested loops: [x for row in matrix for x in row].",
      ],
      jsCode: "// JavaScript\nconst nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\nconst doubled = nums.map(x => x * 2);\nconst evens = nums.filter(x => x % 2 === 0);\nconst doubledEvens = nums\n  .filter(x => x % 2 === 0)\n  .map(x => x * 2);\n\nconst matrix = [[1,2],[3,4],[5,6]];\nconst flat = matrix.flat();\n\nconst lengths = Object.fromEntries(\n  [\"hello\", \"world\"].map(w => [w, w.length])\n);",
      pyCode: "# Python List Comprehensions\nnums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\ndoubled = [x * 2 for x in nums]\nevens = [x for x in nums if x % 2 == 0]\ndoubled_evens = [x * 2 for x in nums if x % 2 == 0]\n\nmatrix = [[1,2],[3,4],[5,6]]\nflat = [x for row in matrix for x in row]\n\n# Dict + Set comprehension\nlengths = {w: len(w) for w in [\"hello\", \"world\"]}\nuniq_len = {len(w) for w in [\"hi\", \"hey\", \"yo\"]}\n\n# Generator (lazy, memory-efficient)\ntotal = sum(x**2 for x in range(1000000))",
      exercise: {
        question: "Write these using comprehensions (one line each):",
        prompt: "1. squares: list of squares of 1 to 20\n2. odds: list of only odd numbers from 1 to 50\n3. char_map: dict mapping each char in \"python\" to its uppercase\n4. flat: flatten [[1,2,3], [4,5,6], [7,8,9]]",
        answer: "squares = [x**2 for x in range(1, 21)]\nodds = [x for x in range(1, 51) if x % 2 != 0]\nchar_map = {c: c.upper() for c in \"python\"}\nflat = [x for row in [[1,2,3],[4,5,6],[7,8,9]] for x in row]",
        hint: "range(1, 21) stops before 21. For the dict, use {key: value for c in \"python\"}; for flattening, write the outer loop (for row in ...) before the inner one (for x in row).",
        tests: String.raw`
for _name in ("squares", "odds", "char_map", "flat"):
    assert _name in globals(), f"Define a variable named {_name}"
assert squares == [x * x for x in range(1, 21)], f"squares should be [1, 4, 9, ..., 400] (1 through 20 squared). Got {squares!r}"
assert odds == list(range(1, 51, 2)), "odds should be [1, 3, 5, ..., 49]"
assert char_map == {"p": "P", "y": "Y", "t": "T", "h": "H", "o": "O", "n": "N"}, f"char_map should map each letter of 'python' to its uppercase. Got {char_map!r}"
assert flat == [1, 2, 3, 4, 5, 6, 7, 8, 9], f"flat should be [1, 2, ..., 9]. Got {flat!r}"
`,
        checks: (code) => [
          has(code, /squares\s*=\s*\[.*\bfor\b/, "Build squares with a list comprehension: [... for x in ...]"),
          has(code, /odds\s*=\s*\[.*\bfor\b.*\bif\b/, "Build odds with a comprehension that has an if clause"),
          has(code, /char_map\s*=\s*\{.*:.*\bfor\b/, "Build char_map with a dict comprehension: {c: ... for c in ...}"),
          has(code, /flat\s*=\s*\[.*\bfor\b.*\bfor\b/, "Flatten with a nested comprehension: [x for row in ... for x in row]"),
          hasNot(code, ".map(", "Python uses comprehensions, not .map()"),
        ],
      },
    },
    {
      id: "decorators", title: "Decorators",
      content: "You already know higher-order functions from JS: a function that takes a function and returns a modified version. Decorators are exactly that, with syntactic sugar. Instead of writing loggedAdd = withLogging(add), you put @with_logging above the function definition.\n\nThe @ symbol is not magic. When Python sees @timer above def slow_function(), it runs slow_function = timer(slow_function). That is the entire trick. Once you realize this, decorators stop being mysterious.\n\nYou may have seen @decorators in TypeScript or Angular. In JS they are a TC39 proposal (supported by TypeScript and Babel) and only work on classes and class members. Python decorators have been part of the language since 2004 and work on any function or class.\n\nDecorators with arguments add one more layer of nesting: the outer function takes the arguments and returns a decorator, which takes the function and returns the wrapper. Three levels deep. It looks complex but follows the same pattern every time.\n\nOne detail to get right from day one: wrap your inner function with @functools.wraps(fn). Without it, the decorated function loses its __name__ and docstring, which confuses debuggers, logs, and tools like pytest.",
      keyDiffs: [
        { js: "const logged = withLog(fn)", py: "@with_log above def fn():", note: "@ is syntax sugar for fn = with_log(fn)" },
        { js: "function(...args) {}", py: "def wrapper(*args, **kwargs):", note: "Capture all args" },
        { js: "fn.name", py: "fn.__name__", note: "Dunder attribute" },
        { js: "@decorator (TS / TC39 proposal)", py: "@decorator", note: "Native in Python, works on plain functions" },
        { js: "No built-in equivalent", py: "@functools.wraps(fn)", note: "Keeps the original name and docstring" },
      ],
      tips: [
        "@decorator is pure syntax sugar for: fn = decorator(fn). Nothing more.",
        "Use @functools.wraps(fn) inside your wrapper to preserve the original function's name and docstring.",
        "Python's standard library has useful built-in decorators: @property, @staticmethod, @classmethod, @functools.cache, @functools.lru_cache.",
      ],
      jsCode: "// JavaScript - HOF pattern\nfunction withLogging(fn) {\n  return function(...args) {\n    console.log(\"Calling \" + fn.name);\n    const result = fn(...args);\n    console.log(\"Result: \" + result);\n    return result;\n  };\n}\n\nfunction add(a, b) { return a + b; }\nconst loggedAdd = withLogging(add);",
      pyCode: "# Python - same idea, cleaner syntax\nimport functools\n\ndef with_logging(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(f\"Calling {fn.__name__}\")\n        result = fn(*args, **kwargs)\n        print(f\"Result: {result}\")\n        return result\n    return wrapper\n\n@with_logging    # = add = with_logging(add)\ndef add(a, b):\n    return a + b\n\n# Decorator WITH arguments (3 levels)\ndef repeat(n):\n    def decorator(fn):\n        @functools.wraps(fn)\n        def wrapper(*args, **kwargs):\n            for _ in range(n):\n                result = fn(*args, **kwargs)\n            return result\n        return wrapper\n    return decorator\n\n@repeat(3)\ndef say_hello():\n    print(\"Hello!\")",
      exercise: {
        question: "Write a decorator called @retry:",
        prompt: "Requirements:\n1. Takes a max_attempts argument\n2. Retries the function when it raises an exception\n3. If all attempts fail, re-raise the last exception\n4. Print the attempt number on each try\n5. Pass all arguments through to the function\n\n@retry(max_attempts=3)\ndef risky():\n    ...",
        answer: "import functools\n\ndef retry(max_attempts):\n    def decorator(fn):\n        @functools.wraps(fn)\n        def wrapper(*args, **kwargs):\n            last_error = None\n            for attempt in range(1, max_attempts + 1):\n                print(f\"Attempt {attempt}/{max_attempts}\")\n                try:\n                    return fn(*args, **kwargs)\n                except Exception as e:\n                    last_error = e\n            raise last_error\n        return wrapper\n    return decorator",
        hint: "You need three nested functions: retry(max_attempts) returns decorator(fn), which returns wrapper(*args, **kwargs). Inside wrapper, loop over the attempts and put the call in try/except, returning as soon as it succeeds.",
        tests: String.raw`
import io, contextlib
assert callable(globals().get("retry")), "Define a function called retry"
calls = []
@retry(max_attempts=3)
def flaky():
    calls.append(1)
    if len(calls) < 3:
        raise ValueError("boom")
    return "ok"
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    value = flaky()
assert value == "ok", "When a later attempt succeeds, return its result"
assert len(calls) == 3, f"flaky() fails twice then succeeds, so it should be called 3 times (was {len(calls)})"
printed = buf.getvalue()
assert all(str(n) in printed for n in (1, 2, 3)), "Print the attempt number on each try"

fails = []
@retry(max_attempts=2)
def always_fails():
    fails.append(1)
    raise KeyError("nope")
try:
    with contextlib.redirect_stdout(io.StringIO()):
        always_fails()
except KeyError:
    pass
else:
    raise AssertionError("When every attempt fails, re-raise the last exception")
assert len(fails) == 2, f"With max_attempts=2 the function should run exactly 2 times (ran {len(fails)})"

@retry(max_attempts=1)
def add(a, b=0):
    return a + b
with contextlib.redirect_stdout(io.StringIO()):
    assert add(2, b=3) == 5, "wrapper must pass *args and **kwargs through to the function"
`,
        checks: (code) => [
          has(code, /def retry\s*\(/, "Define: def retry(max_attempts):"),
          has(code, /def \w+\s*\(\s*\*args/, "Need a wrapper that accepts *args, **kwargs"),
          has(code, /try\s*:/, "Use try/except inside the retry loop"),
          has(code, /except\b/, "Catch the exception with except"),
          has(code, /\braise\b/, "Re-raise the last exception after all attempts fail"),
        ],
      },
    },
  ],
};

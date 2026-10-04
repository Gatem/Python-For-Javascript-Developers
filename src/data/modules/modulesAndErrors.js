import { has, hasNot } from "../../lib/validation";

export default {
  id: "modules", title: "Modules & Errors", icon: "📁", subtitle: "import, __main__, try/except", tier: 2,
  lessons: [
    {
      id: "imports", title: "The Import System",
      content: "Python's import system is simpler than JS modules in some ways and more structured in others. Every .py file is a module, and a directory of modules is a package. There is no node_modules folder: third-party packages are installed into a virtual environment (a .venv folder per project), and you declare dependencies in pyproject.toml (the modern standard) or a requirements.txt file.\n\nThe syntax maps cleanly. 'import { X } from \"y\"' becomes 'from y import X'. The 'as' rename works the same way. There is no default export: you either import the module itself (import json) or names from it (from json import loads). The other big difference is Python's standard library: json, csv, re (regex), sqlite3, datetime, pathlib, http, and much more are built in. Many things that need npm install in JS need no installation at all.\n\nPackages and __init__.py: a regular package is a directory containing an __init__.py file (often empty). The file runs when the package is first imported, so it can also re-export names, a bit like an index.js. Since Python 3.3, a directory without __init__.py can still be imported as a 'namespace package', but tools and test runners behave more predictably with regular packages, so include __init__.py in your own packages.\n\nModern type hints need fewer imports than older tutorials suggest. Since Python 3.9 you write list[str] and dict[str, int] with the built-in types, and since 3.10 you write str | None instead of Optional[str]. You will still see 'from typing import List, Optional' in older code; it works, but new code does not need it.\n\nPEP 8 (Python's style guide) defines the import order: standard library first, then third-party packages, then your own local modules, with a blank line between each group. Tools like ruff and isort sort them for you automatically.",
      keyDiffs: [
        { js: "import { join } from \"path\"", py: "from os.path import join", note: "Keyword order reversed" },
        { js: "import * as fs from \"fs\"", py: "import os", note: "Import the whole module" },
        { js: "import { x as y }", py: "from m import x as y", note: "Same rename idea" },
        { js: "export default", py: "No default exports", note: "Import the module or its names" },
        { js: "npm install / yarn add", py: "pip install (inside a venv)", note: "Package installer" },
        { js: "package.json", py: "pyproject.toml / requirements.txt", note: "Dependency file" },
        { js: "node_modules/", py: ".venv/", note: "Per-project environment" },
        { js: "index.js in a folder", py: "__init__.py", note: "Runs when the package is imported" },
      ],
      tips: [
        "Always use a virtual environment: python -m venv .venv, then activate it. This is your project-level node_modules.",
        "pip freeze > requirements.txt captures your current dependencies. pip install -r requirements.txt restores them.",
        "Python's standard library is massive. Before reaching for pip, check whether a built-in module already does the job.",
        "Give your own package directories an __init__.py. Namespace packages without it exist, but they are meant for special cases like splitting one package across several folders.",
        "Use built-in generics in new code: list[str], dict[str, int], str | None. No typing import needed.",
      ],
      jsCode: "// JavaScript Modules\nimport { useState } from \"react\";\nimport React from \"react\";\nimport { useState as uState } from \"react\";\nimport * as path from \"path\";\nconst fs = require(\"fs\");\n// npm install / package.json / node_modules",
      pyCode: "# Python Imports\n# 1. Standard library\nimport json\nimport os\nfrom collections import Counter\nfrom pathlib import Path\n\n# 2. Third-party (pip install requests numpy)\nimport numpy as np        # rename\nimport requests\n\n# 3. Local modules (your own files)\nfrom myapp.utils import slugify\n\n# Modern type hints: no typing import needed\ndef load(paths: list[str]) -> dict[str, int] | None:\n    ...",
      exercise: {
        question: "Organize these imports in PEP 8 order:",
        prompt: "Needed:\n1. json and os (standard library)\n2. datetime from datetime (standard library)\n3. Counter from collections (standard library)\n4. requests (third party)\n5. calculate_tax from the local helpers.py file\n\nPEP 8: stdlib -> third-party -> local\n(blank line between groups)",
        setup: String.raw`
from pathlib import Path
Path("helpers.py").write_text("def calculate_tax(amount):\n    return round(amount * 0.14, 2)\n")
`,
        answer: "import json\nimport os\nfrom collections import Counter\nfrom datetime import datetime\n\nimport requests\n\nfrom helpers import calculate_tax",
        hint: "Make three groups separated by blank lines: everything that ships with Python, then requests, then your own helpers module. Inside a group, alphabetical order is the convention.",
        tests: String.raw`
import ast, types
import collections as _collections, datetime as _datetime
for _mod in ("json", "os", "requests"):
    assert isinstance(globals().get(_mod), types.ModuleType), f"Missing: import {_mod}"
assert globals().get("datetime") is _datetime.datetime, "Missing: from datetime import datetime"
assert globals().get("Counter") is _collections.Counter, "Missing: from collections import Counter"
assert callable(globals().get("calculate_tax")) and calculate_tax(100) == 14.0, "Missing: from helpers import calculate_tax"

_groups = {"json": 0, "os": 0, "datetime": 0, "collections": 0, "typing": 0, "requests": 1, "helpers": 2}
_imports = []
for _node in ast.parse(__source__).body:
    if isinstance(_node, ast.Import):
        _mods = [a.name.split(".")[0] for a in _node.names]
    elif isinstance(_node, ast.ImportFrom):
        _mods = [(_node.module or "").split(".")[0]]
    else:
        continue
    for _m in _mods:
        _imports.append((_groups.get(_m, 0), _node.lineno, _m))
_order = [g for g, _, _ in _imports]
assert _order == sorted(_order), "PEP 8 order: standard library first, then third-party (requests), then local (helpers)"
_lines = __source__.splitlines()
for (_g1, _l1, _m1), (_g2, _l2, _m2) in zip(_imports, _imports[1:]):
    if _g1 != _g2:
        assert any(not _lines[i].strip() for i in range(_l1, _l2 - 1)), f"Add a blank line between the '{_m1}' group and the '{_m2}' group"
`,
        checks: (code) => [
          has(code, /^\s*import requests\b/m, "Missing: import requests"),
          has(code, /from helpers import calculate_tax/, "Missing: from helpers import calculate_tax"),
          hasNot(code, "require(", "SyntaxError: Python uses 'import', not 'require()'"),
        ],
      },
    },
    {
      id: "scripts", title: "Scripts & __main__",
      content: "Every Python file can be both a module you import and a script you run. Python tells the two cases apart with a special variable: __name__. When you run python app.py, the code in app.py runs with __name__ set to \"__main__\". When another file does import app, the same code runs with __name__ set to \"app\".\n\nThat is why almost every Python script ends with the main guard: if __name__ == \"__main__\": main(). Code inside the guard runs only when the file is executed directly, never when it is imported. Without it, importing your module to reuse one function would also start the whole program. It is the equivalent of Node's require.main === module check (or import.meta.main in Deno and Bun), except that in Python everyone uses it.\n\nYou can also run a module by its import path with python -m: python -m myapp.cli runs myapp/cli.py as __main__, with imports resolved from the project root. Many tools work this way: python -m venv, python -m pip, python -m http.server, python -m pytest.\n\nCommand-line arguments live in sys.argv. Unlike process.argv, where [0] is the node binary and [1] is the script, sys.argv[0] is the script name and the real arguments start at sys.argv[1]. For anything beyond one or two arguments, use the built-in argparse module (think yargs or commander, but in the standard library): it parses flags, converts types, applies defaults, and generates --help for free.\n\nFinally, exit codes: sys.exit(0) means success and any non-zero number means failure, exactly like process.exit(). A common pattern is to write def main() -> int: ... and finish with sys.exit(main()) inside the main guard.",
      keyDiffs: [
        { js: "require.main === module", py: "if __name__ == \"__main__\":", note: "Run only when executed directly" },
        { js: "node scripts/build.js", py: "python -m scripts.build", note: "Run a module by import path" },
        { js: "process.argv.slice(2)", py: "sys.argv[1:]", note: "argv[0] is the script name" },
        { js: "yargs / commander", py: "argparse", note: "Built into the standard library" },
        { js: "process.exit(1)", py: "sys.exit(1)", note: "Non-zero = failure" },
      ],
      tips: [
        "Put your program's work in a main() function and call it from the main guard. Module-level code then stays importable and testable.",
        "python -m package.module is the reliable way to run a file that lives inside a package; it sets up imports from the project root.",
        "argparse generates --help automatically from your add_argument calls. Try python app.py --help.",
        "parser.parse_args() reads sys.argv by default; pass a list (parser.parse_args([\"Ada\", \"--times\", \"2\"])) to test it without a terminal.",
      ],
      jsCode: "// Node.js: greet.js\nfunction main(argv) {\n  const [name = \"World\"] = argv;\n  const times = Number(argv[1] ?? 1);\n  for (let i = 0; i < times; i++) {\n    console.log(`Hello, ${name}!`);\n  }\n  return 0;\n}\n\nif (require.main === module) {\n  process.exit(main(process.argv.slice(2)));\n}\n\n// node greet.js Ada 2",
      pyCode: "# Python: greet.py\nimport argparse\nimport sys\n\ndef main(argv=None):\n    parser = argparse.ArgumentParser(description=\"Greet someone\")\n    parser.add_argument(\"name\")\n    parser.add_argument(\"--times\", type=int, default=1)\n    args = parser.parse_args(argv)   # None -> uses sys.argv[1:]\n    for _ in range(args.times):\n        print(f\"Hello, {args.name}!\")\n    return 0\n\nif __name__ == \"__main__\":\n    sys.exit(main())\n\n# python greet.py Ada --times 2\n# python greet.py --help   (generated for free)",
      exercise: {
        question: "Write a small command-line script with argparse and a main guard:",
        prompt: "1. def main(argv=None) that uses argparse with:\n   - a positional argument: name\n   - an optional flag: --times (int, default 1)\n   and prints \"Hello, <name>!\" that many times, then returns 0\n2. A main guard that calls main([\"World\", \"--times\", \"2\"])\n\nNote: the browser has no command line, so pass the arguments as a\nlist. The runner executes your file with __name__ == \"__main__\",\nexactly like python greet.py would.",
        answer: "import argparse\n\ndef main(argv=None):\n    parser = argparse.ArgumentParser()\n    parser.add_argument(\"name\")\n    parser.add_argument(\"--times\", type=int, default=1)\n    args = parser.parse_args(argv)\n    for _ in range(args.times):\n        print(f\"Hello, {args.name}!\")\n    return 0\n\nif __name__ == \"__main__\":\n    main([\"World\", \"--times\", \"2\"])",
        output: "Hello, World!\nHello, World!",
        hint: "Create an argparse.ArgumentParser, add \"name\" and \"--times\" (type=int, default=1), and call parser.parse_args(argv). Put the call to main inside if __name__ == \"__main__\":.",
        tests: String.raw`
import ast, io, contextlib
assert callable(globals().get("main")), "Define a function called main(argv=None)"
_buf = io.StringIO()
with contextlib.redirect_stdout(_buf):
    _rc = main(["Ada", "--times", "3"])
assert _buf.getvalue().strip().splitlines() == ["Hello, Ada!"] * 3, f"main(['Ada', '--times', '3']) should print 'Hello, Ada!' 3 times, got {_buf.getvalue()!r}"
assert _rc == 0, "main() should return 0 on success"
_buf = io.StringIO()
with contextlib.redirect_stdout(_buf):
    main(["Bo"])
assert _buf.getvalue().strip() == "Hello, Bo!", "--times should default to 1"
assert __output__.count("Hello, World!") == 2, "Inside the main guard, call main(['World', '--times', '2'])"
_guards = [n for n in ast.parse(__source__).body if isinstance(n, ast.If) and "__name__" in ast.unparse(n.test)]
assert _guards, "Wrap the call in: if __name__ == \"__main__\":"
`,
        checks: (code) => [
          has(code, /import argparse|from argparse import/, "Use the built-in argparse module"),
          has(code, /ArgumentParser\s*\(/, "Create a parser with argparse.ArgumentParser()"),
          has(code, /if\s+__name__\s*==\s*["']__main__["']\s*:/, "Add the main guard: if __name__ == \"__main__\":"),
          hasNot(code, /process\.argv/, "Python uses sys.argv / argparse, not process.argv"),
        ],
      },
    },
    {
      id: "errors", title: "Error Handling",
      content: "The structure is almost identical: try/catch becomes try/except, throw becomes raise, and Error subclasses become Exception subclasses. You will adjust in minutes.\n\nThe real difference is Python's else clause on try blocks. The else block runs ONLY if no exception was raised, which is perfect for code that should execute after the risky operation succeeds but should not be inside the try block itself (so its own errors are not accidentally caught). JS has no equivalent.\n\nContext managers ('with' statements) replace many try/finally patterns. Instead of opening a file, wrapping everything in try, and closing in finally, you write 'with open(\"file.txt\") as f:' and the file closes automatically when the block ends. This pattern extends to database connections, locks, and any resource that needs cleanup.\n\nA critical rule: never use a bare 'except:' without an exception type. It catches everything, including SystemExit (raised by sys.exit()) and KeyboardInterrupt (raised by Ctrl+C), so your program can swallow its own shutdown. At minimum, use 'except Exception:', which leaves those system-level exceptions alone.\n\nException types form a hierarchy: BaseException at the top, Exception below it, and ValueError, TypeError, KeyError and friends below that. Catching a parent catches all of its children, so order your except blocks from most specific to most general, or the general one will swallow the specific ones. When you catch one error and raise another, write raise NewError(...) from err to keep the original as the cause, just like new Error(msg, { cause: err }) in JS.",
      keyDiffs: [
        { js: "try { } catch (e) { }", py: "try: ... except E as e:", note: "except, not catch" },
        { js: "throw new Error()", py: "raise ValueError()", note: "raise, not throw, no 'new'" },
        { js: "if (e instanceof X)", py: "except X:", note: "Type goes in the except clause" },
        { js: "finally { }", py: "finally:", note: "Same concept" },
        { js: "No equivalent", py: "else:", note: "Runs only if no exception" },
        { js: "try/finally for cleanup", py: "with statement", note: "Auto-cleanup" },
        { js: "new Error(msg, { cause })", py: "raise X(msg) from err", note: "Exception chaining" },
      ],
      tips: [
        "Never use a bare 'except:'. It also catches SystemExit and KeyboardInterrupt. Catch specific exceptions, or 'except Exception' at most.",
        "Exception hierarchy: BaseException > Exception > ValueError, TypeError, etc. Catch Exception or something more specific, never BaseException.",
        "The 'with' statement calls __enter__ at the start and __exit__ at the end, even if an error occurs.",
        "Use 'raise ... from err' when translating exceptions, so the traceback shows both the original error and yours.",
      ],
      jsCode: "// JavaScript\ntry {\n  JSON.parse(badJson);\n  throw new Error(\"Custom\");\n} catch (error) {\n  if (error instanceof SyntaxError)\n    console.log(\"JSON error\");\n} finally {\n  console.log(\"Cleanup\");\n}\n\nclass ValidationError extends Error {\n  constructor(field, msg) {\n    super(msg);\n    this.field = field;\n  }\n}",
      pyCode: "# Python\nimport json\ntry:\n    data = json.loads(bad_json)\nexcept json.JSONDecodeError as e:   # specific first\n    print(f\"JSON error: {e}\")\nexcept ValueError as e:             # then more general\n    print(f\"Value error: {e}\")\nelse:                              # no exception!\n    print(\"Parse succeeded\")\nfinally:\n    print(\"Cleanup\")\n\n# Custom exception\nclass ValidationError(Exception):\n    def __init__(self, field, msg):\n        super().__init__(msg)\n        self.field = field\n\n# Chaining: keep the original cause\ntry:\n    port = int(\"abc\")\nexcept ValueError as err:\n    raise ValidationError(\"port\", \"must be a number\") from err\n\n# Context manager (replaces try/finally)\nwith open(\"file.txt\") as f:\n    content = f.read()\n# auto-closed, even on error!",
      exercise: {
        question: "Write a function called safe_divide:",
        prompt: "1. Takes a and b\n2. If a or b are not numbers, raise TypeError\n3. If b == 0, raise ZeroDivisionError\n4. Otherwise return a / b\n5. Call safe_divide(10, 4) inside try/except\n6. Print \"Result: <value>\" in the else block\n7. Print \"Done\" in the finally block",
        answer: "def safe_divide(a, b):\n    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):\n        raise TypeError(\"Expected numbers\")\n    if b == 0:\n        raise ZeroDivisionError(\"Cannot divide by zero\")\n    return a / b\n\ntry:\n    result = safe_divide(10, 4)\nexcept ZeroDivisionError as e:\n    print(f\"Division error: {e}\")\nexcept TypeError as e:\n    print(f\"Type error: {e}\")\nelse:\n    print(f\"Result: {result}\")\nfinally:\n    print(\"Done\")",
        output: "Result: 2.5\nDone",
        hint: "isinstance(a, (int, float)) checks for either type at once. The else block runs only when the try block raised nothing, and finally always runs last.",
        tests: String.raw`
assert callable(globals().get("safe_divide")), "Define a function called safe_divide(a, b)"
assert safe_divide(10, 4) == 2.5, "safe_divide(10, 4) should return 2.5"
try:
    safe_divide(1, 0)
except ZeroDivisionError:
    pass
else:
    raise AssertionError("safe_divide(1, 0) should raise ZeroDivisionError")
for _bad in (("10", 2), (10, "2"), (None, 1)):
    try:
        safe_divide(*_bad)
    except TypeError:
        pass
    else:
        raise AssertionError(f"safe_divide{_bad!r} should raise TypeError")
assert "2.5" in __output__, "Print the result (2.5) in the else block"
assert __output__.strip().endswith("Done"), "Print 'Done' last, in the finally block"
`,
        checks: (code) => [
          has(code, /def safe_divide\s*\(\s*a\s*,\s*b\s*\)/, "Define: def safe_divide(a, b):"),
          has(code, /raise\s+ZeroDivisionError/, "Raise ZeroDivisionError when b == 0"),
          has(code, /raise\s+TypeError/, "Raise TypeError for non-numeric inputs"),
          has(code, /^\s*try\s*:/m, "Call safe_divide inside a try: block"),
          has(code, /^\s*except\b/m, "Handle errors with except"),
          has(code, /^\s*else\s*:/m, "Use an else: block to print the result"),
          has(code, /^\s*finally\s*:/m, "Use finally: to print 'Done'"),
          hasNot(code, /\bcatch\b/, "Python uses 'except', not 'catch'"),
          hasNot(code, /\bthrow\b/, "Python uses 'raise', not 'throw'"),
        ],
      },
    },
  ],
};

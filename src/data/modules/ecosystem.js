import { has, hasNot } from "../../lib/validation";

export default {
  id: "ecosystem", title: "Ecosystem & Tooling", icon: "\u{1F30D}", subtitle: "stdlib, uv, venvs, ruff", tier: 4,
  lessons: [
    {
      id: "stdlib", title: "The Standard Library",
      content: `Modern Node has a decent built-in library: node:path, node:fs, fetch (Node 18+), crypto.randomUUID(), structuredClone(), and even a test runner. Python's standard library ("batteries included") goes further, and many tasks that still send JS developers to npm need no install at all in Python.

pathlib turns paths into objects. You join them with the / operator (Path.home() / ".config" / "app.json") and read, write, glob, and inspect them through methods: .read_text(), .write_text(), .exists(), .mkdir(parents=True), .parent, .suffix.

itertools and functools cover much of what people install lodash for. itertools gives you lazy combinators: chain (flatten), product (cartesian product), combinations, permutations, groupby, batched. functools adds partial (pre-fill arguments, like fn.bind(null, a)), cache and lru_cache (memoization decorators), and reduce.

datetime and zoneinfo handle dates and time zones without moment, date-fns, or dayjs. argparse builds command-line interfaces (commander/yargs territory), csv reads and writes CSV, sqlite3 gives you an embedded SQL database, json and re cover JSON and regex, and python -m http.server serves the current folder in one line.

The collections module deserves special mention: Counter counts things, defaultdict eliminates key-existence checks, deque is a fast double-ended queue, and namedtuple creates lightweight immutable records. (OrderedDict is mostly historical; regular dicts keep insertion order since 3.7.)

Rule of thumb: before you pip-install anything, search "python stdlib" plus what you need. There is a good chance it is already there.`,
      keyDiffs: [
        { js: "node:path (built in)", py: "pathlib.Path (built in)", note: "Paths are objects" },
        { js: "lodash", py: "itertools, functools, collections", note: "Built in" },
        { js: "date-fns / dayjs", py: "datetime, zoneinfo", note: "Built in" },
        { js: "crypto.randomUUID()", py: "uuid.uuid4()", note: "Both built in" },
        { js: "commander / yargs", py: "argparse", note: "Built in" },
        { js: "csv-parse", py: "csv", note: "Built in" },
        { js: "npx http-server", py: "python -m http.server 8000", note: "One-line dev server" },
      ],
      tips: [
        "pathlib.Path joins with /: Path('src') / 'data' / 'file.txt'. Cleaner than os.path.join().",
        "@functools.cache (or @lru_cache(maxsize=...)) is a one-line memoization decorator for pure functions.",
        "python -m <module> runs a module as a script. Try python -m json.tool file.json to pretty-print JSON.",
        "Learn Counter, defaultdict, and deque first. They replace a lot of hand-written helper code.",
      ],
      jsCode: "// Node.js: some built in, some from npm\nimport path from \"node:path\";\npath.join(\"src\", \"data\", \"file.txt\");\ncrypto.randomUUID();\n\n// Still common npm installs:\nimport _ from \"lodash\";\n_.flatten([[1, 2], [3, 4]]);\n_.countBy([\"a\", \"b\", \"a\"]);\n\nimport { format } from \"date-fns\";\nformat(new Date(), \"yyyy-MM-dd\");",
      pyCode: `# Python: all standard library
from pathlib import Path
Path("src") / "data" / "file.txt"

import uuid
str(uuid.uuid4())

from itertools import chain
list(chain([1, 2], [3, 4]))     # [1, 2, 3, 4]

from collections import Counter
Counter(["a", "b", "a"])        # Counter({'a': 2, 'b': 1})

from datetime import date
date.today().isoformat()        # '2026-10-04'

from functools import cache
@cache
def slow_square(n):
    return n * n

# One-line dev server:
# python -m http.server 8000`,
      exercise: {
        question: "Use Python's standard library to solve these tasks (no installs needed):",
        prompt: "words = [\"python\", \"js\", \"python\", \"go\", \"js\", \"python\"]  # already defined\n\n1. p = a Path to \"data/output/results.csv\"; parent = its parent directory\n2. word_counts = the frequency of each word in words (collections)\n3. today = today's date as a \"YYYY-MM-DD\" string\n4. Memoize this function with functools (lru_cache or cache):\n\ndef fibonacci(n):\n    if n < 2:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)",
        hint: "Use Path(\"data\") / \"output\" / \"results.csv\" and its .parent, Counter(words), date.today().isoformat(), and put @lru_cache (or @cache) above def fibonacci.",
        setup: `words = ["python", "js", "python", "go", "js", "python"]`,
        answer: `from pathlib import Path
from collections import Counter
from datetime import date
from functools import lru_cache

p = Path("data") / "output" / "results.csv"
parent = p.parent

word_counts = Counter(words)

today = date.today().isoformat()

@lru_cache
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
        tests: `from pathlib import Path as _P
from datetime import date as _date
for _name in ("p", "parent", "word_counts", "today", "fibonacci"):
    assert _name in globals(), f"Define {_name}"
assert isinstance(p, _P) and p == _P("data/output/results.csv"), "p should be Path('data/output/results.csv')"
assert parent == _P("data/output"), "parent should be p.parent"
assert dict(word_counts) == {"python": 3, "js": 2, "go": 1}, "word_counts should count each word"
assert today == _date.today().isoformat(), f"today should look like {_date.today().isoformat()!r}, got {today!r}"
assert hasattr(fibonacci, "cache_info"), "Decorate fibonacci with @lru_cache or @cache"
assert fibonacci(80) == 23416728348467685, "fibonacci(80) should return quickly once memoized"`,
        checks: (code) => [
          has(code, /from pathlib import|import pathlib/, "Import Path from pathlib"),
          has(code, /\.parent\b/, "Use .parent to get the parent directory"),
          has(code, /Counter\(/, "Use Counter() to count word frequencies"),
          has(code, /from datetime import|import datetime/, "Import from the datetime module"),
          has(code, /@(functools\.)?(lru_cache|cache)\b/, "Apply @lru_cache (or @cache) as a decorator"),
          hasNot(code, /require\s*\(/, "SyntaxError: use 'import', not require()"),
          hasNot(code, /\bnpm\b|pip install/, "All of these are in the standard library. No installs needed"),
        ],
      },
    },
    {
      id: "tooling", title: "Project Setup & Tooling",
      content: `The critical difference from Node: Python does not isolate dependencies per project by default. npm always installs into the project's node_modules, but a bare pip install puts packages into whichever Python you are running, often shared by every project on your machine. Isolation is something you opt into with a virtual environment.

A virtual environment (venv) is a folder, conventionally .venv, with its own Python interpreter and installed packages. It plays the role of node_modules. The classic workflow uses only built-in tools: python -m venv .venv, then activate it (source .venv/bin/activate on macOS/Linux, .venv\\Scripts\\activate on Windows), then pip install requests. pip freeze > requirements.txt records the installed versions.

In 2026 most new projects use uv, a fast all-in-one tool that will feel familiar to npm and pnpm users. uv init creates a project with a pyproject.toml (the package.json of Python), uv add requests installs a dependency and creates the .venv for you, uv.lock pins exact versions like package-lock.json, and uv run main.py runs code inside the environment without activating anything. uv can even install Python itself (uv python install 3.13), replacing nvm-style version managers. pyproject.toml is the standard either way; setup.py is the legacy approach.

For code quality, ruff is the ESLint + Prettier of Python: ruff check . lints and ruff format . formats, both configured in pyproject.toml.

Packages are directories of modules. A directory with an __init__.py file is a regular package. Without __init__.py, Python 3 still imports it as a namespace package (PEP 420), but namespace packages are meant for splitting one package across several locations, so add __init__.py to your own packages. A common layout is src/your_package/, tests/, pyproject.toml, and README.md. To locate files next to your code, use Path(__file__).parent, Python's __dirname.

For debugging, call breakpoint() anywhere and Python drops into pdb, an interactive debugger in your terminal: n (next), s (step into), c (continue), p expr (print). VS Code and PyCharm offer graphical debuggers too.

Popular libraries: Django (batteries-included web framework, closer to Rails or NestJS than to Next.js), FastAPI and Flask (APIs, like Express or Fastify), requests and httpx (HTTP clients, like axios), SQLAlchemy (ORM, like Prisma or TypeORM), pandas and NumPy (data analysis and numerical computing, with no real JS counterpart).`,
      keyDiffs: [
        { js: "node_modules/", py: ".venv/", note: "Per-project environment" },
        { js: "package.json", py: "pyproject.toml", note: "Metadata, deps, tool config" },
        { js: "package-lock.json", py: "uv.lock (or requirements.txt)", note: "Pinned versions" },
        { js: "npm init", py: "uv init", note: "Create a project" },
        { js: "npm install axios", py: "uv add requests", note: "Or pip install inside a venv" },
        { js: "npm run / npx", py: "uv run", note: "Run inside the environment" },
        { js: "nvm install 22", py: "uv python install 3.13", note: "Manage interpreter versions" },
        { js: "ESLint + Prettier", py: "ruff check / ruff format", note: "Lint and format" },
        { js: "__dirname", py: "Path(__file__).parent", note: "Folder of the current file" },
        { js: "node --inspect", py: "breakpoint() / python -m pdb", note: "Interactive debugger" },
      ],
      tips: [
        "Never pip install into your system Python. Use uv (uv add) or create and activate a venv first.",
        "Add .venv/ to your .gitignore, just like node_modules/. Commit pyproject.toml and uv.lock.",
        "breakpoint() drops you into pdb: n = next line, s = step into, c = continue, p x = print x, q = quit.",
        "Configure ruff in pyproject.toml under [tool.ruff], and add 'ruff check' and 'ruff format --check' to CI.",
        "pip list shows installed packages (like npm list); pip show <name> shows details for one.",
      ],
      jsCode: "// Node.js project setup\n// npm init -y          -> package.json\n// npm install axios    -> node_modules/ + package-lock.json\n// npx eslint . && npx prettier --write .\n\nimport axios from \"axios\";\nimport path from \"node:path\";\n\nconst here = __dirname; // CommonJS\nconst res = await axios.get(\"https://api.example.com/data\");\nconsole.log(res.data);",
      pyCode: `# Modern setup with uv
#   uv init my-app        -> pyproject.toml
#   cd my-app
#   uv add requests       -> .venv/ + uv.lock
#   uv run main.py        -> runs inside .venv
#   uvx ruff check .      -> lint (like npx eslint)
#   uvx ruff format .     -> format (like prettier)

# Classic setup with built-in tools
#   python -m venv .venv
#   source .venv/bin/activate      (macOS/Linux)
#   .venv\\Scripts\\activate         (Windows)
#   pip install requests
#   pip freeze > requirements.txt

from pathlib import Path
import requests

BASE_DIR = Path(__file__).parent   # like __dirname

response = requests.get("https://api.example.com/data")
response.raise_for_status()        # error on 4xx/5xx
breakpoint()                       # inspect in pdb
print(response.json())

# Project structure:
# my-app/
#   pyproject.toml
#   uv.lock
#   src/my_app/
#     __init__.py
#     core.py
#   tests/`,
      exercise: {
        question: "Set up a project and write the code (terminal commands go in comments):",
        prompt: "# As comments (terminal commands):\n# 1. Create a project / environment (uv init, or python -m venv .venv)\n# 2. Add the 'requests' package (uv add requests, or pip install requests)\n# 3. Lint the code with ruff\n\n# As Python code:\n# 4. BASE_DIR = the folder of the current file (Python's __dirname)\n# 5. def get_data(): GET https://api.example.com/data with requests,\n#    call raise_for_status(), and return the parsed JSON\n# 6. print(get_data())\n\n(The network is simulated here, so requests.get returns fake data.)",
        hint: "Write commands like '# uv add requests' as comments. For the code: BASE_DIR = Path(__file__).parent, then requests.get(url), response.raise_for_status(), and return response.json().",
        checkComments: true,
        setup: `import sys as _sys, types as _types
_calls = []

class _FakeResponse:
    status_code = 200
    def __init__(self, url):
        self.url = url
    def json(self):
        return {"items": [1, 2, 3], "source": self.url}
    def raise_for_status(self):
        _calls.append("raise_for_status")

def _fake_get(url, *args, **kwargs):
    _calls.append(url)
    return _FakeResponse(url)

_fake_requests = _types.ModuleType("requests")
_fake_requests.get = _fake_get
_sys.modules["requests"] = _fake_requests`,
        answer: `# uv init my-app
# uv add requests
# uvx ruff check .

from pathlib import Path
import requests

BASE_DIR = Path(__file__).parent

def get_data():
    response = requests.get("https://api.example.com/data")
    response.raise_for_status()
    return response.json()

print(get_data())`,
        output: "{'items': [1, 2, 3], 'source': 'https://api.example.com/data'}",
        tests: `from pathlib import Path as _P
assert "BASE_DIR" in globals(), "Define BASE_DIR"
assert BASE_DIR == _P(__file__).parent, "BASE_DIR should be Path(__file__).parent"
assert "get_data" in globals(), "Define get_data()"
_calls.clear()
_data = get_data()
assert "https://api.example.com/data" in _calls, "get_data should call requests.get('https://api.example.com/data')"
assert "raise_for_status" in _calls, "Call response.raise_for_status() before using the response"
assert _data == {"items": [1, 2, 3], "source": "https://api.example.com/data"}, "get_data should return response.json()"
assert "'items': [1, 2, 3]" in __output__, "Print the result of get_data()"`,
        checks: (code) => [
          has(code, /uv init|uv venv|python3? -m venv/, "Include a command to create the project/environment (uv init or python -m venv .venv)"),
          has(code, /uv add requests|pip install requests/, "Include: uv add requests (or pip install requests)"),
          has(code, /ruff check/, "Include a ruff check command"),
          has(code, /import requests/, "Import the requests library"),
          has(code, /Path\(__file__\)\.parent/, "BASE_DIR = Path(__file__).parent"),
          has(code, /requests\.get\s*\(/, "Use requests.get() to fetch the URL"),
          has(code, /\.json\s*\(\)/, "Use .json() to parse the response"),
          hasNot(code, /^(?!\s*#).*\bfetch\s*\(/m, "NameError: 'fetch' is not defined. Use requests.get()"),
          hasNot(code, /\bnpm (install|i|init)\b/, "This is Python: use uv or pip, not npm"),
        ],
      },
    },
  ],
};

import { has, hasNot } from "../../lib/validation";

export default {
  id: "async-testing", title: "Async & Testing", icon: "\u{1F9EA}", subtitle: "asyncio, pytest", tier: 3,
  lessons: [
    {
      id: "async", title: "Async/Await",
      content: `Python's async/await syntax will look familiar: async def defines a coroutine function, and await waits for another coroutine. The model underneath is similar too: a single-threaded event loop switches between tasks whenever one of them is waiting.

The first difference: there is no event loop running by default. A Node script is already inside an event loop, but a Python script is not. You start one explicitly with asyncio.run(main()), usually once, at the entry point of your program. Top-level await works in JS modules, but not in Python scripts (only in the 'python -m asyncio' REPL and notebooks).

The second difference is subtle and important: a JS Promise starts running as soon as it is created, while calling a coroutine function in Python only creates a coroutine object. Nothing runs until you await it or schedule it with asyncio.create_task(). Forgetting the await gives you a "coroutine was never awaited" warning instead of a result.

For concurrency, asyncio.gather() is the Promise.all() equivalent, and gather(..., return_exceptions=True) behaves like Promise.allSettled(): failures come back as exception objects in the results list instead of crashing everything. Since Python 3.11, asyncio.TaskGroup offers structured concurrency: tasks created in an 'async with asyncio.TaskGroup()' block are all awaited when the block ends, and if one fails, the others are cancelled.

There is no built-in fetch(). The popular async HTTP clients are third-party: httpx (async with httpx.AsyncClient() as client: await client.get(url)) and aiohttp. Also avoid blocking calls like time.sleep() or requests.get() inside async code: they freeze the whole event loop. Use await asyncio.sleep() and async libraries, or push blocking work to a thread with asyncio.to_thread().`,
      keyDiffs: [
        { js: "async function fn()", py: "async def fn():", note: "def, not function" },
        { js: "await fetch(url)", py: "await client.get(url)", note: "httpx.AsyncClient (third-party)" },
        { js: "Promise.all([...])", py: "await asyncio.gather(...)", note: "Run concurrently" },
        { js: "Promise.allSettled([...])", py: "gather(..., return_exceptions=True)", note: "Errors returned, not raised" },
        { js: "await new Promise(r => setTimeout(r, 1000))", py: "await asyncio.sleep(1)", note: "Seconds, not ms" },
        { js: "Promise starts immediately", py: "asyncio.create_task(coro())", note: "Coroutines are lazy until awaited/scheduled" },
        { js: "Top-level await (ES modules)", py: "asyncio.run(main())", note: "Explicit entry point" },
      ],
      tips: [
        "asyncio.gather(*coros, return_exceptions=True) keeps one failure from crashing the rest. Filter with isinstance(r, Exception).",
        "Prefer asyncio.TaskGroup (3.11+) when one failure should cancel the sibling tasks.",
        "asyncio.Semaphore(10) limits concurrency, like p-limit in Node. Wrap each request in 'async with sem:'.",
        "Never call time.sleep() or requests.get() inside async def. They block the event loop for everyone.",
      ],
      jsCode: "// JavaScript\nasync function fetchUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  return await res.json();\n}\n\nconst [user, posts] = await Promise.all([\n  fetchUser(1), fetchPosts(1)\n]);\n\nconst results = await Promise.allSettled(ids.map(fetchUser));\n\nconst sleep = ms => new Promise(r => setTimeout(r, ms));\nawait sleep(1000);",
      pyCode: `# Python
import asyncio

async def fetch_user(user_id):
    await asyncio.sleep(0.1)  # simulate network I/O
    return {"id": user_id, "name": f"User_{user_id}"}

async def main():
    # Promise.all
    user, other = await asyncio.gather(fetch_user(1), fetch_user(2))

    # Promise.allSettled
    results = await asyncio.gather(
        *[fetch_user(i) for i in range(10)],
        return_exceptions=True,
    )
    good = [r for r in results if not isinstance(r, Exception)]

    # Structured concurrency (3.11+)
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch_user(1))
        t2 = tg.create_task(fetch_user(2))
    print(t1.result(), t2.result())

    # Real HTTP (third-party): pip install httpx
    # async with httpx.AsyncClient() as client:
    #     res = await client.get("https://api.example.com")

asyncio.run(main())  # entry point`,
      exercise: {
        question: "Write async Python code:",
        prompt: "A coroutine fetch(url) is already defined for you. It takes 0.2s and\nraises ValueError for URLs containing \"bad\".\n\n1. async def fetch_all(urls):\n   - fetch all URLs concurrently with asyncio.gather\n   - use return_exceptions=True\n   - return only the successful results (drop the exceptions)\n2. async def main(): print(await fetch_all([\"/a\", \"/b\", \"/bad\", \"/c\"]))\n3. Entry point: asyncio.run(main())",
        hint: "Unpack a list of coroutines into gather: asyncio.gather(*[fetch(u) for u in urls], return_exceptions=True). Then keep only the results that are not isinstance(r, Exception).",
        setup: `import asyncio as _asyncio

async def fetch(url):
    await _asyncio.sleep(0.2)
    if "bad" in url:
        raise ValueError(f"Bad URL: {url}")
    return f"data from {url}"`,
        answer: `import asyncio

async def fetch_all(urls):
    results = await asyncio.gather(
        *[fetch(u) for u in urls],
        return_exceptions=True,
    )
    return [r for r in results if not isinstance(r, Exception)]

async def main():
    print(await fetch_all(["/a", "/b", "/bad", "/c"]))

asyncio.run(main())`,
        output: "['data from /a', 'data from /b', 'data from /c']",
        tests: `import inspect as _inspect, time as _time
assert "fetch_all" in globals(), "Define async def fetch_all(urls)"
assert _inspect.iscoroutinefunction(fetch_all), "fetch_all must be defined with async def"
_start = _time.perf_counter()
_res = await fetch_all(["/x", "/bad-1", "/y"])
_elapsed = _time.perf_counter() - _start
assert list(_res) == ["data from /x", "data from /y"], f"fetch_all should return only the successful results, got {_res!r}"
assert _elapsed < 0.5, f"The fetches took {_elapsed:.2f}s. Run them concurrently with asyncio.gather instead of one after another"
assert "data from /a" in __output__, "main() should print the result of fetch_all, and asyncio.run(main()) should start it"`,
        checks: (code) => [
          has(code, /import asyncio/, "Need: import asyncio"),
          has(code, /async def fetch_all/, "Define: async def fetch_all(urls)"),
          has(code, /asyncio\.gather/, "Use asyncio.gather() to run the fetches concurrently"),
          has(code, /return_exceptions\s*=\s*True/, "Pass return_exceptions=True to gather"),
          has(code, /async def main/, "Define: async def main()"),
          has(code, /asyncio\.run\(/, "Entry point: asyncio.run(main())"),
          hasNot(code, /Promise\.all/, "NameError: use asyncio.gather(), not Promise.all()"),
        ],
      },
    },
    {
      id: "testing", title: "Testing with pytest",
      content: `If you know Jest or Vitest, pytest will feel refreshingly simple. There is no expect().toBe() chain: you write functions whose names start with test_ and use the plain assert statement. When an assertion fails, pytest rewrites it to show you both sides of the comparison.

You do not need describe() blocks. pytest groups tests by file (test_*.py) and, optionally, by class (class TestCalculator: with test_ methods, no inheritance needed). Run everything with 'pytest', or filter by name with -k.

Fixtures replace beforeEach/afterEach. Define a function decorated with @pytest.fixture, and any test that declares a parameter with the same name receives the fixture's return value. It is dependency injection by parameter name. For teardown, write the fixture as a generator: code after the yield runs after the test, like afterEach.

Parametrize replaces test.each(). The @pytest.mark.parametrize decorator runs the same test with different inputs, and pytest reports each case as a separate test.

For mocking, the standard library's unittest.mock provides patch() and MagicMock (the equivalent of jest.mock and jest.fn), and pytest's built-in monkeypatch fixture is handy for environment variables and attributes.`,
      keyDiffs: [
        { js: "test('adds', () => {})", py: "def test_adds():", note: "Plain functions" },
        { js: "describe('Calc', () => {})", py: "class TestCalc:  (or one file)", note: "Grouping is optional" },
        { js: "expect(x).toBe(y)", py: "assert x == y", note: "Plain assert" },
        { js: "expect(() => f()).toThrow()", py: "with pytest.raises(ValueError):", note: "Context manager" },
        { js: "beforeEach(() => ...)", py: "@pytest.fixture", note: "Injected by parameter name" },
        { js: "test.each([[1, 2]])", py: "@pytest.mark.parametrize", note: "One test per case" },
        { js: "jest.mock('./module')", py: "@patch('module.fn')", note: "unittest.mock" },
      ],
      tips: [
        "Run tests: pytest -v (verbose), -x (stop on first failure), -k 'pattern' (filter by name).",
        "pytest discovers files named test_*.py or *_test.py and functions named test_*.",
        "Fixtures with scope='module' or scope='session' run once and are shared across tests.",
        "Use pytest.approx for floats: assert 0.1 + 0.2 == pytest.approx(0.3).",
      ],
      jsCode: "// Jest\ndescribe('Calculator', () => {\n  let calc;\n  beforeEach(() => { calc = new Calculator(); });\n  test('adds', () => {\n    expect(calc.add(2, 3)).toBe(5);\n  });\n  test('throws', () => {\n    expect(() => calc.add('a', 1)).toThrow();\n  });\n  test.each([[1, 2, 3], [4, 5, 9]])(\n    'add(%i, %i) = %i', (a, b, exp) => {\n      expect(calc.add(a, b)).toBe(exp);\n    }\n  );\n});",
      pyCode: `# test_calculator.py
import pytest
from calculator import Calculator

@pytest.fixture
def calc():                       # like beforeEach
    return Calculator()

def test_add(calc):               # fixture injected by name
    assert calc.add(2, 3) == 5

def test_invalid(calc):
    with pytest.raises(TypeError):
        calc.add("a", 1)

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (4, 5, 9),
    (-1, 1, 0),
])
def test_add_cases(calc, a, b, expected):
    assert calc.add(a, b) == expected

from unittest.mock import patch

@patch("myapp.api.fetch_user")
def test_mock(mock_fetch):
    mock_fetch.return_value = {"name": "Alice"}
    assert get_user_name(1) == "Alice"`,
      exercise: {
        question: "Write pytest tests for parse_email (it is already defined for you):",
        prompt: "def parse_email(email):\n    if \"@\" not in email:\n        raise ValueError(\"Missing @\")\n    parts = email.split(\"@\")\n    if len(parts) != 2 or not parts[0] or not parts[1]:\n        raise ValueError(\"Invalid format\")\n    return (parts[0], parts[1])\n\nWrite:\n1. A fixture that returns a valid email address\n2. A test that uses the fixture and checks the returned tuple\n3. A test that checks a missing @ raises ValueError\n4. A parametrized test with 3+ valid cases\n\nYour tests are run with real pytest.",
        hint: "A fixture is a function decorated with @pytest.fixture; a test receives it by declaring a parameter with the same name. Use 'with pytest.raises(ValueError):' for the error case.",
        setup: `PARSE_EMAIL_SRC = '''
def parse_email(email):
    if "@" not in email:
        raise ValueError("Missing @")
    parts = email.split("@")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        raise ValueError("Invalid format")
    return (parts[0], parts[1])
'''
exec(PARSE_EMAIL_SRC)`,
        answer: `import pytest

@pytest.fixture
def valid_email():
    return "alice@example.com"

def test_valid_email(valid_email):
    assert parse_email(valid_email) == ("alice", "example.com")

def test_missing_at():
    with pytest.raises(ValueError):
        parse_email("invalid")

@pytest.mark.parametrize("email, expected", [
    ("alice@example.com", ("alice", "example.com")),
    ("bob@test.org", ("bob", "test.org")),
    ("x@y.z", ("x", "y.z")),
])
def test_cases(email, expected):
    assert parse_email(email) == expected`,
        tests: `import ast as _ast, pathlib as _pl, pytest as _pytest
_tree = _ast.parse(__source__)
_funcs = [n for n in _tree.body if isinstance(n, _ast.FunctionDef)]
_fixtures = {f.name for f in _funcs if any("fixture" in _ast.unparse(d) for d in f.decorator_list)}
assert _fixtures, "Define a fixture with @pytest.fixture"
assert any(f.name.startswith("test_") and any(a.arg in _fixtures for a in f.args.args) for f in _funcs), "Use your fixture: add its name as a parameter of a test function"
assert any("parametrize" in _ast.unparse(d) for f in _funcs for d in f.decorator_list), "Add a test decorated with @pytest.mark.parametrize"
_path = _pl.Path("test_parse_email.py")
_path.write_text(PARSE_EMAIL_SRC + "\\n" + __source__, encoding="utf-8")

class _Report:
    passed = 0
    failed = 0
    def pytest_runtest_logreport(self, report):
        if report.when == "call":
            if report.passed:
                self.passed += 1
            elif report.failed:
                self.failed += 1

_r = _Report()
_rc = _pytest.main(["-q", "-p", "no:cacheprovider", "--import-mode=importlib", str(_path)], plugins=[_r])
assert _r.failed == 0 and _rc == 0, f"{_r.failed} of your tests failed when pytest ran them"
assert _r.passed >= 5, f"Expected at least 5 passing tests (2 tests + 3 parametrized cases), pytest ran {_r.passed}"`,
        checks: (code) => [
          has(code, /import pytest/, "Need: import pytest"),
          has(code, /def test_/, "Name test functions with the test_ prefix"),
          has(code, /assert\s/, "Use assert to check results"),
          has(code, /pytest\.raises\(\s*ValueError\s*\)/, "Use pytest.raises(ValueError) for the error case"),
          has(code, /@pytest\.mark\.parametrize/, "Use @pytest.mark.parametrize for multiple cases"),
          has(code, /@pytest\.fixture/, "Use @pytest.fixture for the shared test data"),
          hasNot(code, /\bexpect\s*\(/, "NameError: pytest has no expect(). Use a plain assert"),
        ],
      },
    },
  ],
};

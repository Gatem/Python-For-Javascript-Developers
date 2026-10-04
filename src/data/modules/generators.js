import { has, hasNot } from "../../lib/validation";

export default {
  id: "generators", title: "Generators & Context Managers", icon: "\u{1F501}", subtitle: "yield, lazy evaluation, with", tier: 3,
  lessons: [
    {
      id: "generators", title: "Generators & Iterators",
      content: `JS has generators (function*), but most JS code never touches them. Python is the opposite: generators are everywhere. Any function containing the yield keyword becomes a generator function. Instead of building an entire list in memory, it produces values one at a time, on demand, pausing at each yield until the next value is requested.

Generator expressions look like list comprehensions with parentheses: (x**2 for x in range(1_000_000)). This creates a lazy sequence that uses almost no memory, compared to the list version that allocates a million items. JS recently gained something similar with iterator helpers (Iterator.prototype.map, filter, take), but in Python this style has been idiomatic for decades.

'yield from' delegates to another iterable or generator, like yield* in JS. It makes it easy to compose lazy pipelines, walk nested structures recursively, or stream data from large files.

Generators are consumed once. After you iterate through one, it is exhausted. You cannot rewind it. If you need the data again, either call the generator function again to get a fresh generator, or convert it to a list (and accept the memory cost).

A practical rule: use generators for data that is too large to fit in memory, for step-by-step processing pipelines, and for infinite sequences. Use lists for small collections that you need to index into or loop over more than once.`,
      keyDiffs: [
        { js: "function* gen() { yield 1 }", py: "def gen(): yield 1", note: "yield alone makes it a generator" },
        { js: "gen.next().value", py: "next(gen)", note: "Built-in function" },
        { js: "{ done: true }", py: "StopIteration", note: "How exhaustion is signaled" },
        { js: "[...gen()]", py: "list(gen())", note: "Collect all values" },
        { js: "yield* sub()", py: "yield from sub()", note: "Delegate to a sub-generator" },
        { js: "arr.values().map(f) (ES2025)", py: "(f(x) for x in arr)", note: "Lazy generator expression" },
      ],
      tips: [
        "Generators are consumed once. After iteration they are exhausted and produce nothing.",
        "Use generator expressions with sum(), any(), all(), max() for memory-efficient aggregation.",
        "File objects are lazy iterators too: 'for line in f' reads one line at a time.",
        "itertools.islice(gen, n) takes the first n items of any iterator, including infinite ones.",
      ],
      jsCode: "// JavaScript generators\nfunction* range(n) {\n  for (let i = 0; i < n; i++) yield i;\n}\nconst gen = range(5);\ngen.next(); // { value: 0, done: false }\nfor (const i of range(5)) console.log(i);\nconst arr = [...range(5)];",
      pyCode: `# Python generators
def count_up(n):
    i = 0
    while i < n:
        yield i      # pauses here, resumes on next()
        i += 1

gen = count_up(5)
next(gen)  # 0
next(gen)  # 1
list(gen)  # [2, 3, 4] (the remaining values)
list(gen)  # [] (exhausted!)

# Generator expression (lazy comprehension)
squares = (x**2 for x in range(1_000_000))  # almost no memory
total = sum(x**2 for x in range(1_000_000))

# yield from (delegation)
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item
list(flatten([1, [2, [3, 4]]]))  # [1, 2, 3, 4]`,
      exercise: {
        question: "Write these generator functions:",
        prompt: "1. fibonacci(): infinite generator yielding 0, 1, 1, 2, 3, 5, 8...\n2. take(n, iterable): yields only the first n items of any iterable\n3. print(list(take(10, fibonacci())))",
        hint: "fibonacci() needs 'while True' with 'a, b = b, a + b' after each yield. In take(), loop over enumerate(iterable) and return as soon as the index reaches n.",
        answer: `def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def take(n, iterable):
    for i, item in enumerate(iterable):
        if i >= n:
            return
        yield item

print(list(take(10, fibonacci())))`,
        output: "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]",
        tests: `import inspect as _inspect
assert "fibonacci" in globals(), "Define fibonacci()"
assert "take" in globals(), "Define take(n, iterable)"
assert _inspect.isgeneratorfunction(fibonacci), "fibonacci must use yield (a generator function)"
assert _inspect.isgeneratorfunction(take), "take must use yield (a generator function)"
_f = fibonacci()
assert [next(_f) for _ in range(12)] == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], "fibonacci should yield 0, 1, 1, 2, 3, 5, 8, ..."
assert list(take(10, fibonacci())) == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34], "take(10, fibonacci()) should give the first 10 numbers"
assert list(take(3, "abcdef")) == ["a", "b", "c"], "take should work with any iterable"
assert list(take(0, fibonacci())) == [], "take(0, ...) should yield nothing"
assert "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]" in __output__, "Print list(take(10, fibonacci()))"`,
        checks: (code) => [
          has(code, /def fibonacci\s*\(/, "Define: def fibonacci():"),
          has(code, /while True/, "Use while True for an infinite generator"),
          has(code, /yield\s+\w/, "Use yield to produce values"),
          has(code, /def take\s*\(/, "Define: def take(n, iterable):"),
          hasNot(code, /function\s*\*/, "Python generators use 'def', not 'function*'"),
        ],
      },
    },
    {
      id: "context-managers", title: "Context Managers",
      content: `You have already used 'with open(...) as f'. That 'with' statement works with any context manager: an object that sets something up when the block starts and is guaranteed to clean up when the block ends, whether the block finishes normally, returns early, or raises an exception. It is try/finally packaged into a reusable object.

A class becomes a context manager by defining two dunder methods. __enter__(self) runs at the start, and whatever it returns is bound to the name after 'as'. __exit__(self, exc_type, exc, tb) runs at the end. If the block raised, the three arguments describe the exception; otherwise they are all None. If __exit__ returns True, the exception is swallowed. Return None or False (the normal case) to let it propagate.

Writing a class is often overkill. The contextlib.contextmanager decorator turns a generator into a context manager: code before the yield is the setup, the yielded value is what 'as' receives, and code after the yield is the cleanup. Put the yield inside try/finally so cleanup also runs when the block raises.

contextlib has other gems. suppress(KeyError) silently ignores a specific exception type (a clean replacement for try/except/pass). ExitStack lets you enter a dynamic number of context managers, such as opening a list of files, and closes them all in reverse order.

In JavaScript the closest equivalent has been try/finally. JS is now adding a similar feature: 'using' declarations with Symbol.dispose (the Explicit Resource Management proposal, already shipping in V8-based runtimes). The idea is the same: cleanup is tied to a scope, so you cannot forget it.`,
      keyDiffs: [
        { js: "try { ... } finally { cleanup() }", py: "with resource() as r:", note: "Cleanup is automatic" },
        { js: "using r = getResource()", py: "with get_resource() as r:", note: "JS proposal vs Python since 2.5" },
        { js: "[Symbol.dispose]()", py: "__enter__ / __exit__", note: "The protocol methods" },
        { js: "try { } catch { /* ignore */ }", py: "with suppress(KeyError):", note: "Ignore one error type" },
        { js: "No equivalent", py: "@contextmanager", note: "Generator-based context manager" },
      ],
      tips: [
        "__exit__ returning True swallows the exception. Only do that on purpose; returning None lets it propagate.",
        "With @contextmanager, always wrap the yield in try/finally, or your cleanup is skipped when the block raises.",
        "You can combine managers on one line: with open(a) as src, open(b, 'w') as dst:",
        "Locks, database transactions, temporary directories (tempfile.TemporaryDirectory), and timers are all natural context managers.",
      ],
      jsCode: "// JavaScript: manual cleanup\nconst conn = await db.connect();\ntry {\n  await conn.query(\"...\");\n} finally {\n  await conn.close();\n}\n\n// Explicit Resource Management (newer runtimes)\n{\n  using file = openFile(\"data.txt\");\n  // file[Symbol.dispose]() runs at the end of the block\n}",
      pyCode: `# Class-based context manager
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self                      # bound by 'as'

    def __exit__(self, exc_type, exc, tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        return False                     # don't swallow errors

with Timer() as t:
    sum(range(1_000_000))
print(f"took {t.elapsed:.3f}s")

# Generator-based (usually simpler)
from contextlib import contextmanager, suppress

@contextmanager
def opened(path):
    f = open(path, encoding="utf-8")
    try:
        yield f                          # the 'as' value
    finally:
        f.close()                        # always runs

# Ignore one specific error
settings = {}
with suppress(KeyError):
    del settings["missing"]`,
      exercise: {
        question: "Write these context managers:",
        prompt: "1. Class Tag(name): prints \"<name>\" on enter and \"</name>\" on exit,\n   even if the block raises. It must NOT swallow exceptions.\n2. @contextmanager temp_value(d, key, value): sets d[key] = value for the\n   duration of the block, then restores the old value (or removes the key\n   if it did not exist before), even if the block raises.\n3. Use contextlib.suppress to run del cfg[\"missing\"] on cfg = {} without crashing.\n4. with Tag(\"p\"): print(\"hello\")",
        hint: "Tag needs __enter__ and __exit__(self, exc_type, exc, tb); return False from __exit__. In temp_value, remember whether the key existed, then yield inside try/finally and restore in the finally block.",
        answer: `from contextlib import contextmanager, suppress

class Tag:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"<{self.name}>")
        return self

    def __exit__(self, exc_type, exc, tb):
        print(f"</{self.name}>")
        return False

@contextmanager
def temp_value(d, key, value):
    existed = key in d
    old = d.get(key)
    d[key] = value
    try:
        yield d
    finally:
        if existed:
            d[key] = old
        else:
            del d[key]

cfg = {}
with suppress(KeyError):
    del cfg["missing"]

with Tag("p"):
    print("hello")`,
        output: "<p>\nhello\n</p>",
        tests: `import io as _io, contextlib as _cl
assert "Tag" in globals(), "Define the Tag class"
assert "temp_value" in globals(), "Define temp_value with @contextmanager"
_buf = _io.StringIO()
with _cl.redirect_stdout(_buf):
    with Tag("b"):
        print("x")
assert _buf.getvalue() == "<b>\\nx\\n</b>\\n", f"Tag('b') should print <b>, then the block output, then </b>. Got {_buf.getvalue()!r}"
_buf = _io.StringIO()
_raised = False
try:
    with _cl.redirect_stdout(_buf):
        with Tag("div"):
            raise ValueError("boom")
except ValueError:
    _raised = True
assert _raised, "Tag must not swallow exceptions: __exit__ should return False or None"
assert _buf.getvalue().strip().endswith("</div>"), "The closing tag must be printed even when the block raises"
_cfg = {"debug": False}
with temp_value(_cfg, "debug", True):
    assert _cfg["debug"] is True, "Inside the block, the key should have the temporary value"
assert _cfg["debug"] is False, "After the block, restore the old value"
with temp_value(_cfg, "new", 1):
    assert _cfg["new"] == 1, "temp_value should also work for keys that did not exist"
assert "new" not in _cfg, "Remove keys that did not exist before the block"
try:
    with temp_value(_cfg, "debug", True):
        raise RuntimeError("fail")
except RuntimeError:
    pass
assert _cfg["debug"] is False, "Restore the value in a finally block so it also happens when the block raises"
assert "suppress(" in __source__, "Use contextlib.suppress for step 3"`,
        checks: (code) => [
          has(code, /class Tag/, "Define: class Tag:"),
          has(code, /def __enter__\s*\(\s*self/, "Tag needs __enter__(self)"),
          has(code, /def __exit__\s*\(\s*self\s*,/, "Tag needs __exit__(self, exc_type, exc, tb)"),
          has(code, /@(contextlib\.)?contextmanager/, "Decorate temp_value with @contextmanager"),
          has(code, /yield/, "temp_value must yield inside the with block"),
          has(code, /finally\s*:/, "Restore the value in a finally: block"),
          has(code, /suppress\(\s*KeyError\s*\)/, "Use suppress(KeyError) for step 3"),
        ],
      },
    },
  ],
};

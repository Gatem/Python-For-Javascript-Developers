import { has, hasNot } from "../../lib/validation";

export default {
  id: "modern", title: "Modern Python", icon: "\u{1F680}", subtitle: "Dataclasses, types, match/case", tier: 3,
  lessons: [
    {
      id: "dataclasses", title: "Dataclasses",
      content: `A dataclass is a class whose boilerplate is generated for you. You declare the fields with type annotations, add the @dataclass decorator, and Python writes __init__, __repr__, and __eq__ for you. Instead of 20 lines of constructor and comparison code, you write 4 lines.

If you come from TypeScript, the declaration looks like an interface, but there is a big difference: a TS interface disappears at compile time, while a dataclass is a real class that exists at runtime. The closest TypeScript equivalent is a class with constructor parameter properties, plus auto-generated equality and printing.

Dataclasses also solve the mutable default trap. You cannot write tags: list = [] (Python raises a ValueError to protect you). Instead use field(default_factory=list), which creates a fresh list for every instance.

For immutable data, use @dataclass(frozen=True). Assigning to a field then raises FrozenInstanceError, and because the instances cannot change, Python also makes them hashable, so they work as dict keys and in sets. Like Object.freeze, this is shallow: a frozen dataclass holding a list does not freeze the list itself.

Useful options: slots=True (3.10+) makes instances smaller and faster and blocks typos in attribute names, kw_only=True forces callers to use keyword arguments, and order=True generates <, <=, >, >= by comparing fields in order.`,
      keyDiffs: [
        { js: "class { constructor(a, b) { ... } }", py: "@dataclass class X: a: int", note: "__init__ is generated" },
        { js: "Manual toString()", py: "Auto __repr__", note: "Readable printing for free" },
        { js: "Manual equals()", py: "Auto __eq__", note: "Compares field values" },
        { js: "Object.freeze(obj)", py: "@dataclass(frozen=True)", note: "Shallow immutability, hashable" },
        { js: "TS interface (compile-time only)", py: "@dataclass (real runtime class)", note: "Has a constructor and methods" },
        { js: "{ ...user, age: 31 }", py: "dataclasses.replace(user, age=31)", note: "Copy with changes" },
      ],
      tips: [
        "Use field(default_factory=list) for mutable defaults like lists, dicts, and sets.",
        "__post_init__(self) runs right after the generated __init__. Use it for validation or computed fields.",
        "asdict(obj) converts a dataclass (recursively) into a dict, which is handy before json.dumps().",
        "Fields with defaults must come after fields without defaults, just like function parameters (or use kw_only=True).",
      ],
      jsCode: "// TypeScript\ninterface User {\n  name: string;\n  age: number;\n  admin?: boolean;\n}\n\nclass User {\n  constructor(\n    public name: string,\n    public age: number,\n    public admin = false,\n  ) {}\n  // still manual: toString, equals...\n}",
      pyCode: `# Python dataclasses
from dataclasses import dataclass, field, asdict, replace

@dataclass
class User:
    name: str
    age: int
    admin: bool = False

# Generated: __init__, __repr__, __eq__
u = User("Alice", 30)
print(u)                # User(name='Alice', age=30, admin=False)
u == User("Alice", 30)  # True
older = replace(u, age=31)

@dataclass(frozen=True)  # immutable + hashable
class Point:
    x: float
    y: float

@dataclass
class Team:
    name: str
    members: list[str] = field(default_factory=list)

user_dict = asdict(u)  # {'name': 'Alice', 'age': 30, 'admin': False}`,
      exercise: {
        question: "Create these dataclasses:",
        prompt: "1. @dataclass Config: host: str, port: int = 8080,\n   debug: bool = False, tags: a list that defaults to empty (use field!)\n2. @dataclass(frozen=True) Coordinate: lat: float, lng: float\n3. Create a Config with host \"localhost\" and print it\n4. Create two equal Coordinates and print whether they are equal (==)",
        hint: "Mutable defaults need field(default_factory=list). Pass frozen=True to the decorator for Coordinate; equality comes for free.",
        answer: `from dataclasses import dataclass, field

@dataclass
class Config:
    host: str
    port: int = 8080
    debug: bool = False
    tags: list[str] = field(default_factory=list)

@dataclass(frozen=True)
class Coordinate:
    lat: float
    lng: float

c = Config("localhost")
print(c)
p1 = Coordinate(30.0, 31.0)
p2 = Coordinate(30.0, 31.0)
print(p1 == p2)`,
        output: "Config(host='localhost', port=8080, debug=False, tags=[])\nTrue",
        tests: `import dataclasses as _dc
assert "Config" in globals() and _dc.is_dataclass(Config), "Config must be a @dataclass"
assert "Coordinate" in globals() and _dc.is_dataclass(Coordinate), "Coordinate must be a @dataclass"
_c = Config("example.com")
assert (_c.host, _c.port, _c.debug, _c.tags) == ("example.com", 8080, False, []), "Config defaults should be port=8080, debug=False, tags=[]"
_a, _b = Config("a"), Config("b")
_a.tags.append("x")
assert _b.tags == [], "Each Config needs its own tags list: use field(default_factory=list)"
_p = Coordinate(1.0, 2.0)
assert _p == Coordinate(1.0, 2.0), "Equal Coordinates should compare equal"
try:
    _p.lat = 5.0
except _dc.FrozenInstanceError:
    pass
else:
    raise AssertionError("Coordinate should be frozen: use @dataclass(frozen=True)")
assert hash(_p) == hash(Coordinate(1.0, 2.0)), "Frozen dataclasses should be hashable"
assert "Config(host='localhost'" in __output__, "Print a Config created with host 'localhost'"
assert "True" in __output__, "Print the result of comparing the two Coordinates"`,
        checks: (code) => [
          has(code, /from dataclasses import|import dataclasses/, "Need: from dataclasses import dataclass, field"),
          has(code, /class Config/, "Define: class Config"),
          has(code, /class Coordinate/, "Define: class Coordinate"),
          has(code, /default_factory\s*=\s*list/, "Use field(default_factory=list) for tags"),
          has(code, /frozen\s*=\s*True/, "Use @dataclass(frozen=True) for Coordinate"),
        ],
      },
    },
    {
      id: "typehints", title: "Type Hints",
      content: `Python's type hints look a lot like TypeScript annotations, with one crucial difference: Python does not enforce them at runtime. They are checked by separate tools (mypy, pyright, or your editor) before you run the code, and they double as documentation. Code with wrong hints still runs.

Use the built-in types directly: name: str, scores: list[int], ages: dict[str, int], point: tuple[float, float]. Since Python 3.9 you no longer need typing.List or typing.Dict, and since 3.10 unions are written with |: str | int.

Careful with "optional". In TypeScript, title?: string means the parameter can be left out. In Python, title: str | None only says the value may be None; the caller must still pass it unless you also give it a default: title: str | None = None. The old spelling Optional[str] means exactly str | None, which is why the name confuses people.

Protocol classes are Python's answer to TypeScript interfaces. Any class that has the right methods satisfies the Protocol without inheriting from it. This is structural typing, the same model TypeScript uses.

Python 3.12 added a cleaner syntax for generics: def first[T](items: list[T]) -> T, and type aliases with the type statement: type UserId = int | str.`,
      keyDiffs: [
        { js: "x: string", py: "x: str", note: "Built-in type names differ" },
        { js: "number[]", py: "list[int] / list[float]", note: "Built-in generics (3.9+)" },
        { js: "string | number", py: "str | int", note: "Union with | (3.10+)" },
        { js: "title?: string", py: "title: str | None = None", note: "Needs a default to be omittable" },
        { js: "interface Drawable { }", py: "class Drawable(Protocol):", note: "Structural typing" },
        { js: "(a: T) => R", py: "Callable[[T], R]", note: "from collections.abc" },
        { js: "function first<T>(xs: T[]): T", py: "def first[T](xs: list[T]) -> T:", note: "Generics syntax (3.12+)" },
        { js: "tsc --noEmit", py: "mypy / pyright", note: "Not enforced at runtime" },
      ],
      tips: [
        "Prefer list[str], dict[str, int], and str | None over typing.List, typing.Dict, and Optional in new code.",
        "Type hints are ignored at runtime. Passing a str where an int is annotated will not raise anything by itself.",
        "Run a checker: pip install mypy && mypy your_file.py, or use pyright (it powers VS Code's Pylance).",
        "Import Callable, Iterable, and Sequence from collections.abc. The typing versions are deprecated aliases.",
      ],
      jsCode: "// TypeScript\nlet name: string = \"Alice\";\nlet scores: number[] = [1, 2, 3];\nlet id: string | number;\n\nfunction greet(name: string, title?: string): string {\n  return title ? title + \" \" + name : name;\n}\n\ninterface Drawable {\n  draw(): string;\n}",
      pyCode: `# Python type hints
from collections.abc import Callable
from typing import Protocol

name: str = "Alice"
scores: list[int] = [1, 2, 3]
id_val: str | int = "abc"

def greet(name: str, title: str | None = None) -> str:
    return f"{title} {name}" if title else name

# Protocol = structural typing (like a TS interface)
class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:              # no inheritance needed
    def draw(self) -> str:
        return "()"

def render(shape: Drawable) -> None:
    print(shape.draw())

render(Circle())           # OK for the type checker

# Callable type
def apply(fn: Callable[[int, int], int], a: int, b: int) -> int:
    return fn(a, b)

# Generic function (3.12+)
def first[T](items: list[T]) -> T:
    return items[0]`,
      exercise: {
        question: "Add type hints to every parameter and return value:",
        prompt: "def process(items, transformer, default_val):\n    results = []\n    for item in items:\n        try:\n            results.append(transformer(item))\n        except Exception:\n            results.append(default_val)\n    return results\n\ndef find_user(users, user_id):\n    for user in users:\n        if user[\"id\"] == user_id:\n            return user\n    return None",
        hint: "transformer is a function, so annotate it with Callable from collections.abc. find_user may return None, so its return type is dict | None.",
        answer: `from collections.abc import Callable

def process(
    items: list,
    transformer: Callable,
    default_val: object,
) -> list:
    results = []
    for item in items:
        try:
            results.append(transformer(item))
        except Exception:
            results.append(default_val)
    return results

def find_user(users: list[dict], user_id: int) -> dict | None:
    for user in users:
        if user["id"] == user_id:
            return user
    return None`,
        tests: `import typing as _t
assert "process" in globals(), "Keep the process function"
assert "find_user" in globals(), "Keep the find_user function"
_pa = _t.get_type_hints(process)
for _p in ("items", "transformer", "default_val", "return"):
    assert _p in _pa, f"process is missing a type hint for {_p!r}"
_fa = _t.get_type_hints(find_user)
for _p in ("users", "user_id", "return"):
    assert _p in _fa, f"find_user is missing a type hint for {_p!r}"
assert type(None) in _t.get_args(_fa["return"]), "find_user can return None, so its return type must allow None (e.g. dict | None)"
assert process(["1", "x", "3"], int, -1) == [1, -1, 3], "Keep process's behavior unchanged"
assert find_user([{"id": 1}, {"id": 2}], 2) == {"id": 2}, "Keep find_user's behavior unchanged"
assert find_user([], 1) is None, "find_user should return None when nothing matches"`,
        checks: (code) => [
          has(code, /def process\s*\(/, "Keep the process function definition"),
          has(code, /def find_user\s*\(/, "Keep the find_user function definition"),
          has(code, /Callable/, "Use Callable for the transformer type"),
          has(code, /def process[\s\S]*?\)\s*->/, "Add a return type to process: -> list"),
          has(code, /def find_user[\s\S]*?\)\s*->/, "Add a return type to find_user"),
        ],
      },
    },
    {
      id: "pattern-match", title: "Pattern Matching & Enums",
      content: `Python 3.10 introduced match/case. It looks like switch/case but is far more powerful: it can destructure sequences, match dictionary shapes, check types and attributes of objects, and add guard conditions, all in one construct.

There is no fall-through. Each case is independent, as if every case ended with break. The wildcard pattern _ plays the role of default. You can combine alternatives with |, as in case "y" | "yes":.

The biggest trap: a bare name in a pattern is a capture, not a comparison. case RED: does not compare against a variable called RED; it matches anything and assigns it to RED. To compare against a constant, use a dotted name such as Color.RED or a literal.

Python also has real Enums, unlike JS where "enums" are usually frozen objects (TypeScript's enum is a compile-time feature). Python Enums are classes: members have a name and a value, the enum is iterable, members are singletons you can compare with 'is', and typos raise AttributeError instead of silently producing undefined. StrEnum (3.11+) gives you members that are also real strings, which is handy for JSON and APIs.`,
      keyDiffs: [
        { js: "switch (x) { case 1: ... break }", py: "match x:  case 1:", note: "No break, no fall-through" },
        { js: "default:", py: "case _:", note: "Wildcard pattern" },
        { js: "case 'y': case 'yes':", py: "case \"y\" | \"yes\":", note: "Or-patterns" },
        { js: "No destructuring in switch", py: "case [cmd, arg]:", note: "Sequence patterns" },
        { js: "if (e.type === 'click')", py: "case {\"type\": \"click\", \"x\": x}:", note: "Mapping patterns" },
        { js: "No guard clause", py: "case [x, y] if x > y:", note: "Guards" },
        { js: "Object.freeze({ A: 'a' })", py: "class E(Enum): A = 'a'", note: "Real enum type" },
      ],
      tips: [
        "match/case needs Python 3.10+. On older versions use if/elif chains or a dict of handlers.",
        "case RED: is a capture that matches everything. Compare against constants with dotted names: case Color.RED:",
        "Enums are iterable: for color in Color: works. Color['RED'] and Color('red') look members up by name and by value.",
        "class Status(StrEnum) (3.11+) makes members real strings: Status.ACTIVE == 'active' is True.",
      ],
      jsCode: "// JavaScript\nswitch (status) {\n  case \"active\": handleActive(); break;\n  case \"inactive\": handleInactive(); break;\n  default: handleUnknown();\n}\n\nconst Status = Object.freeze({\n  ACTIVE: \"active\",\n  INACTIVE: \"inactive\",\n});",
      pyCode: `# Python match/case (3.10+)
match status:
    case "active":
        handle_active()
    case "inactive" | "disabled":
        handle_inactive()
    case _:
        handle_unknown()

# Sequence patterns
match command.split():
    case ["go", direction]:
        move(direction)
    case ["pick", "up", item]:
        pickup(item)

# Mapping patterns + guards
match event:
    case {"type": "click", "x": x, "y": y}:
        handle_click(x, y)
    case {"type": "key", "key": k} if k in VALID:
        handle_key(k)

# Enums
from enum import Enum, StrEnum, auto
class Color(Enum):
    RED = auto()
    GREEN = auto()

class Status(StrEnum):
    ACTIVE = "active"

for c in Color:
    print(c)          # Color.RED, Color.GREEN`,
      exercise: {
        question: "Write using match/case and Enum:",
        prompt: "1. Enum HttpMethod with members GET, POST, PUT, DELETE\n2. Function handle_request(method, path) using match:\n   - GET + \"/users\"      -> \"list users\"\n   - GET + any other path -> \"get \" + path\n   - POST + \"/users\"     -> \"create user\"\n   - DELETE + any path    -> \"delete \" + path\n   - anything else        -> \"405 Not Allowed\"",
        hint: "Match on a tuple: match (method, path): then case (HttpMethod.GET, \"/users\"): and case (HttpMethod.GET, p): to capture the path. Order matters, so put the specific case first.",
        answer: `from enum import Enum, auto

class HttpMethod(Enum):
    GET = auto()
    POST = auto()
    PUT = auto()
    DELETE = auto()

def handle_request(method, path):
    match (method, path):
        case (HttpMethod.GET, "/users"):
            return "list users"
        case (HttpMethod.GET, p):
            return f"get {p}"
        case (HttpMethod.POST, "/users"):
            return "create user"
        case (HttpMethod.DELETE, p):
            return f"delete {p}"
        case _:
            return "405 Not Allowed"`,
        tests: `from enum import Enum as _Enum
assert "HttpMethod" in globals(), "Define the HttpMethod enum"
assert isinstance(HttpMethod, type) and issubclass(HttpMethod, _Enum), "HttpMethod must subclass Enum"
assert {"GET", "POST", "PUT", "DELETE"} <= {m.name for m in HttpMethod}, "HttpMethod needs GET, POST, PUT and DELETE"
assert "handle_request" in globals(), "Define handle_request(method, path)"
_cases = [
    ((HttpMethod.GET, "/users"), "list users"),
    ((HttpMethod.GET, "/items/7"), "get /items/7"),
    ((HttpMethod.POST, "/users"), "create user"),
    ((HttpMethod.DELETE, "/users/3"), "delete /users/3"),
    ((HttpMethod.PUT, "/users"), "405 Not Allowed"),
    ((HttpMethod.POST, "/other"), "405 Not Allowed"),
]
for _args, _want in _cases:
    _got = handle_request(*_args)
    assert _got == _want, f"handle_request({_args[0]}, {_args[1]!r}) returned {_got!r}, expected {_want!r}"`,
        checks: (code) => [
          has(code, /from enum import|import enum/, "Need: from enum import Enum, auto"),
          has(code, /class HttpMethod\(\s*(enum\.)?\w*Enum\s*\)/, "Define: class HttpMethod(Enum):"),
          has(code, /def handle_request\s*\(/, "Define: def handle_request(method, path):"),
          has(code, /\bmatch\b/, "Use a match statement"),
          has(code, /case\s+_\s*:/, "Use 'case _:' as the default"),
          hasNot(code, /\bswitch\b/, "Python has no switch. Use match/case"),
        ],
      },
    },
  ],
};

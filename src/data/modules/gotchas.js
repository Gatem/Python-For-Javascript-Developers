import { has, hasNot } from "../../lib/validation";

export default {
  id: "gotchas", title: "Gotchas & Pitfalls", icon: "\u{1F6A8}", subtitle: "None, scope, is vs ==", tier: 2,
  lessons: [
    {
      id: "none-is", title: "None, is vs ==",
      content: "JS has two \"empty\" values: null and undefined. Python has only one: None. No undefined means that reading a variable that was never assigned is always an error (NameError), not a silent undefined. This is actually a feature; bugs surface immediately instead of propagating.\n\nThe 'is' operator checks identity (whether two names point to the same object in memory), while '==' checks equality (whether two objects have the same value). Here is the mapping that trips JS developers up: for objects and arrays, JS's === already compares references, so [1, 2] === [1, 2] is false in JS. Python's 'is' is that reference check. Python's '==' goes further and compares contents, so [1, 2] == [1, 2] is True. There is no built-in deep-equality operator in JS; in Python, == is it.\n\nPython's == also never converts strings to numbers (\"5\" == 5 is False), so you never need a separate strict operator. Numbers are still compared by value across types, though: 1 == 1.0 is True, and because bool is a subclass of int, True == 1 is True too.\n\nThe rule is simple: use 'is' for None (and for sentinel objects you create yourself). Use '==' for everything else. Writing 'if x == None' works but is considered bad style; PEP 8 explicitly says use 'is None'. And do not write 'if flag is True' or 'if flag == True'; just write 'if flag:'.",
      keyDiffs: [
        { js: "null", py: "None", note: "Capital N" },
        { js: "undefined", py: "Does not exist", note: "NameError instead" },
        { js: "\"5\" == 5 (true)", py: "\"5\" == 5 (False)", note: "No string/number coercion" },
        { js: "a === b (objects)", py: "a is b", note: "Same object in memory" },
        { js: "deep-equal helper", py: "a == b", note: "Compares contents of lists, dicts..." },
        { js: "x ?? defaultVal", py: "x if x is not None else d", note: "No ?? operator" },
        { js: "obj?.a?.b", py: "d.get(\"a\", {}).get(\"b\")", note: "No optional chaining" },
      ],
      tips: [
        "Always use 'is None' and 'is not None'. Never use '== None'.",
        "Small integers (-5 to 256) and some strings are cached by CPython, so 'is' may accidentally work for them. Never rely on this; use == for values.",
        "'x or default' falls back on every falsy value (0, empty string, empty list), not just None. Use 'x if x is not None else default' when 0 or \"\" are valid values.",
        "1 == 1.0 and True == 1 are both True in Python. == compares numbers by value even across int, float, and bool.",
      ],
      jsCode: "// JavaScript\nlet x = null;\nlet y = undefined;\ntypeof null;       // \"object\" (JS bug)\nnull == undefined;   // true (loose)\nnull === undefined;  // false (strict)\n\n[1, 2] === [1, 2];   // false (different arrays)\n\nif (x === null) { }\nconst city = user?.address?.city;\nconst name = input ?? \"default\";",
      pyCode: "# Python - only None\nx = None\ntype(None)         # <class 'NoneType'>\n\n# is vs == (CRITICAL)\na = [1, 2, 3]\nb = [1, 2, 3]\na == b   # True  (same contents)\na is b   # False (different objects!)\n\n# ALWAYS use 'is' for None\nif x is None:       # correct\n    pass\nif x is not None:   # correct\n    pass\n\n# Default values\nname = inp if inp is not None else \"default\"\nname = inp or \"default\"  # catches ALL falsy!\n\n# Nested lookups without ?.\ncity = user.get(\"address\", {}).get(\"city\")",
      exercise: {
        question: "Fix all the bugs in this code (there are 4 issues):",
        prompt: "x = undefined\n\nif x == None:\n    print(\"x is empty\")\n\na = [1, 2]\nb = [1, 2]\nif a is b:\n    print(\"lists are equal\")\n\nresult = x ?? \"default\"",
        answer: "x = None\n\nif x is None:\n    print(\"x is empty\")\n\na = [1, 2]\nb = [1, 2]\nif a == b:\n    print(\"lists are equal\")\n\nresult = x if x is not None else \"default\"",
        output: "x is empty\nlists are equal",
        hint: "Python's empty value is None and you test for it with 'is'. Two separate lists are never the same object, so compare their contents with ==. There is no ?? operator; use a conditional expression.",
        tests: String.raw`
assert "x" in globals() and x is None, "x should be None (Python has no undefined)"
assert "x is empty" in __output__, "The first check should print 'x is empty'"
assert "lists are equal" in __output__, "a and b have the same contents: compare them with ==, not is"
assert globals().get("result") == "default", "result should fall back to 'default' when x is None"
`,
        checks: (code) => [
          has(code, /is None/, "Use 'is None' not '== None'"),
          has(code, /a\s*==\s*b|b\s*==\s*a/, "'is' checks identity (same object). Use == for value equality"),
          hasNot(code, /==\s*None/, "Use 'is None' instead of '== None'"),
          hasNot(code, "undefined", "NameError: 'undefined' does not exist in Python"),
          hasNot(code, "??", "SyntaxError: no ?? operator. Use: x if x is not None else default"),
        ],
      },
    },
    {
      id: "scope", title: "Scope, Closures & Traps",
      content: "Python scope rules follow LEGB: Local, Enclosing, Global, Built-in. You can READ outer variables freely, but REASSIGNING them requires explicit permission with the 'global' or 'nonlocal' keyword. Without it, Python treats the name as a new local variable, and reading it before assignment raises UnboundLocalError.\n\nThis catches JS developers constantly. In JS, count++ inside a function modifies the outer count. In Python, count += 1 without 'global count' fails. The fix is straightforward, but you need to know it exists. Note that mutating an outer object is fine without any keyword: items.append(x) works, because you are not rebinding the name.\n\nHere is the subtle part: if you ASSIGN to a variable anywhere inside a function, Python treats that variable as local to the ENTIRE function, even on lines before the assignment. Reading it before the assignment line raises UnboundLocalError, even if a global with the same name exists. Python decides scope when it compiles the function, not while it runs.\n\nAlso remember: Python has no block scope. Variables created inside if, for, while, with, or try blocks live on after the block ends. Only functions, classes, modules, and comprehensions create new scopes. This is the opposite of JS's let and const, which are block-scoped.\n\nThe mutable default argument trap is Python's most infamous gotcha. Default argument values are evaluated ONCE, when the function is defined, not each time it is called. So def add_item(item, items=[]) shares the SAME list across all calls. The fix: use None as the default and create a new list inside the function.",
      keyDiffs: [
        { js: "let x = 0; fn() { x++ }", py: "global x needed", note: "Must declare intent to rebind" },
        { js: "Closure modifies outer", py: "nonlocal x needed", note: "Explicit for closures too" },
        { js: "function(x, arr=[]) {}", py: "def fn(x, arr=None):", note: "Never use [] as default!" },
        { js: "Block scope (let/const)", py: "Function scope only", note: "No block-level scope" },
      ],
      tips: [
        "The mutable default trap is real. If you see def fn(x, items=[]):, it is almost certainly a bug. Use None instead.",
        "Python has NO block-level scope. Variables created inside if, for, while, or try blocks remain accessible after the block ends.",
        "The LEGB rule: Local -> Enclosing (closure) -> Global -> Built-in. Python searches in this order.",
        "Assigning to a variable anywhere in a function makes it local to that entire function, even before the assignment line. Reading it first raises UnboundLocalError.",
        "You only need global/nonlocal to REBIND a name. Mutating an outer list or dict (append, update) works without them.",
      ],
      jsCode: "// JavaScript scope\nlet count = 0;\nfunction increment() {\n  count++;  // modifies outer directly\n}\n\nfunction makeCounter() {\n  let n = 0;\n  return () => ++n;  // closure modifies outer\n}\n\n// Default params - fresh each call\nfunction addItem(item, list = []) {\n  list.push(item);\n  return list;\n}\naddItem(\"a\"); // [\"a\"]\naddItem(\"b\"); // [\"b\"] - fresh []",
      pyCode: "# Python scope\ncount = 0\ndef increment():\n    global count      # REQUIRED!\n    count += 1\n\ndef make_counter():\n    n = 0\n    def inc():\n        nonlocal n    # REQUIRED for closures!\n        n += 1\n        return n\n    return inc\n\n# TRAP: Mutable default argument\ndef add_item(item, items=[]):  # BUG!\n    items.append(item)\n    return items\nadd_item(\"a\")  # [\"a\"]\nadd_item(\"b\")  # [\"a\", \"b\"] SHARED!\n\n# Fix:\ndef add_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items",
      exercise: {
        question: "Fix the 3 bugs related to scope and mutable defaults:",
        prompt: "total = 0\n\ndef add_to_total(n):\n    total += n\n    return total\n\ndef make_multiplier(factor):\n    def multiply(x):\n        factor = factor * 1  # \"normalize\"\n        return x * factor\n    return multiply\n\ndef append_log(msg, log=[]):\n    log.append(msg)\n    return log",
        answer: "total = 0\n\ndef add_to_total(n):\n    global total\n    total += n\n    return total\n\ndef make_multiplier(factor):\n    def multiply(x):\n        return x * factor\n    return multiply\n\ndef append_log(msg, log=None):\n    if log is None:\n        log = []\n    log.append(msg)\n    return log",
        hint: "add_to_total rebinds a module-level name, so it needs a declaration. multiply assigns to factor, which makes factor local and unreadable before the assignment. A [] default is created only once.",
        tests: String.raw`
for _name in ("add_to_total", "make_multiplier", "append_log"):
    assert callable(globals().get(_name)), f"Keep the function {_name}"
assert add_to_total(5) == 5 and add_to_total(3) == 8, "add_to_total should update the global total (5, then 8)"
assert total == 8, "The module-level total should now be 8"
assert make_multiplier(3)(4) == 12, "make_multiplier(3)(4) should return 12 without UnboundLocalError"
first = append_log("a")
second = append_log("b")
assert second == ["b"], f"append_log('b') returned {second!r}: each call without a log needs a fresh list"
assert append_log("c", ["x"]) == ["x", "c"], "Passing an existing list should append to it"
`,
        checks: (code) => [
          has(code, "global total", "UnboundLocalError: add 'global total' to rebind the outer variable"),
          has(code, /log\s*=\s*None/, "Use None as the default, not []"),
          hasNot(code, /log\s*=\s*\[\]\s*\)/, "Never use [] as a default argument! Use log=None"),
        ],
      },
    },
  ],
};

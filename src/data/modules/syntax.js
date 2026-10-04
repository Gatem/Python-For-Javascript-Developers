import { has, hasNot } from "../../lib/validation";

export default {
  id: "syntax", title: "Syntax Bridge", icon: "\u{1F40D}", subtitle: "Variables, strings, numbers, conditions", tier: 1,
  lessons: [
    {
      id: "variables", title: "Variables & Types",
      content: "Coming from JS, the first thing you will notice is that Python does not need keywords to declare variables. No let, no const, no var. You write the name and assign a value. That is it.\n\nBut here is what catches most JS developers off guard: Python is strongly typed. In JS, \"5\" + 5 gives you \"55\" because JS silently converts the number. Python refuses and raises a TypeError, making you handle the conversion yourself. This strictness feels annoying at first, but it prevents a whole category of bugs you have probably spent hours debugging in JS. Python is still dynamically typed, though: a variable can hold a string now and a number later. Strong typing means no silent conversions, not fixed types.\n\nAnother quick shift: Python uses snake_case for variables and functions, PascalCase for classes, and UPPER_CASE for constants. So firstName becomes first_name, and isActive becomes is_active. Your editor will remind you, but your muscle memory will fight back for about a week.\n\nNaming rules you need to know right now: variable names can contain letters, numbers, and underscores, but cannot start with a number. 2ndPlace is illegal. Names starting with an underscore have special meaning: _name signals 'this is internal, do not touch' (a convention, not enforced). __name triggers name mangling inside classes (Python renames it to make accidental access from outside harder). And names with double underscores on both sides, like __init__ and __str__ (\"dunder\" names), are reserved for Python's own special methods and attributes. Never invent your own dunder names.\n\nPython 3.12 has 35 reserved keywords you cannot use as names: False, None, True, and, as, assert, async, await, break, class, continue, def, del, elif, else, except, finally, for, from, global, if, import, in, is, lambda, nonlocal, not, or, pass, raise, return, try, while, with, yield. There are also a few soft keywords (match, case, type, and _) that are only special in specific positions, so they still work as ordinary names. Finally, avoid shadowing built-in function names like list, dict, str, int, type, print, len, input, or id. Writing list = [1, 2, 3] silently breaks the list() built-in in that scope.",
      keyDiffs: [
        { js: "let / const / var", py: "just assign", note: "No declaration keyword needed" },
        { js: "true / false", py: "True / False", note: "Capital first letter!" },
        { js: "null / undefined", py: "None", note: "One value, not two" },
        { js: "typeof x", py: "type(x)", note: "A function; use isinstance() for checks" },
        { js: "\"5\" + 5 = \"55\"", py: "TypeError!", note: "No implicit coercion" },
        { js: "camelCase", py: "snake_case", note: "Convention (PEP 8), not enforced" },
      ],
      tips: [
        "True and False are capitalized. This WILL trip you up the first week.",
        "Python has no 'const'. By convention, ALL_CAPS means constant, but nothing enforces it at runtime.",
        "There is no 'undefined' in Python. A name that was never assigned simply does not exist, and using it raises NameError.",
        "Prefer isinstance(x, int) over type(x) == int for type checks. It also accepts subclasses.",
        "async and await are hard keywords, so they cannot be variable names. match, case and type are soft keywords and still can.",
        "Never shadow built-in names like list, dict, str, int, type, id, input, print, or len. It silently breaks them in your scope.",
      ],
      jsCode: `// JavaScript
let name = "Alice";
const age = 28;
var isActive = true;

// Type coercion (JS magic)
console.log("5" + 5);  // "55"
console.log("5" - 2);  // 3`,
      pyCode: `# Python
name = "Alice"
age = 28
is_active = True  # True/False, not true/false

# No type coercion
# "5" + 5  -> TypeError!
print("5" + str(5))   # "55" - explicit conversion
print(int("5") - 2)   # 3

name = 42             # dynamic: a name can be rebound to any type`,
      exercise: {
        question: "Convert this JavaScript to Python:",
        prompt: `// JavaScript
const firstName = "John";
let score = 95;
const passed = true;
console.log(firstName + " scored " + score);`,
        answer: `first_name = "John"
score = 95
passed = True
print(first_name + " scored " + str(score))`,
        output: "John scored 95",
        hint: "Drop const/let entirely, rename to snake_case, and capitalize True. Python will not add a str and an int, so convert score with str() or use an f-string.",
        checks: (code) => [
          hasNot(code, /\bfirstName\b/, "NameError: 'firstName' is not defined. Use 'first_name' (snake_case)"),
          has(code, /\bprint\s*\(/, "Use print() to output the result"),
        ],
        tests: `assert first_name == "John", "Define first_name = 'John' (snake_case)"
assert score == 95, "Define score = 95"
assert passed is True, "Define passed = True (capital T)"
assert "John scored 95" in __output__, "Print exactly: John scored 95"`,
      },
    },
    {
      id: "strings", title: "Strings & f-strings",
      content: "If you love template literals in JS, you are going to love f-strings in Python even more. They work similarly (prefix the string with f and put expressions in curly braces), but f-strings can do more: you can format numbers, align text, and call functions inside the braces.\n\nThe string methods are where you will stumble most. Names you have memorized for years are different: toUpperCase() becomes upper(), trim() becomes strip(), includes() becomes the 'in' operator. The good news: Python's string methods are generally shorter and more consistent.\n\nOne conceptual point: Python strings are immutable (just like JS), and Python has no separate char type. A single character is just a string of length 1.\n\nA few things JS developers rarely think about: single quotes and double quotes are completely identical in Python, including for f-strings. Pick one style and be consistent (most teams pick double quotes, which is also what the Black and Ruff formatters use). Triple quotes (three single or double quotes) create multi-line strings, similar to JS template literals but without interpolation unless you add the f prefix.\n\nRaw strings are important to learn early. Prefix a string with r (like r\"\\n\") and Python will not interpret backslash sequences, so r\"\\n\" is a backslash followed by an n, not a newline. This is essential for regex patterns (r\"\\d+\") and Windows file paths (r\"C:\\Users\\docs\"). Without the r prefix, you would need to double every backslash.",
      keyDiffs: [
        { js: "`Hello ${name}`", py: "f\"Hello {name}\"", note: "f-prefix, either quote style" },
        { js: ".toUpperCase()", py: ".upper()", note: "Shorter name" },
        { js: ".toLowerCase()", py: ".lower()", note: "Shorter name" },
        { js: ".trim()", py: ".strip()", note: "Different name" },
        { js: ".includes(\"x\")", py: "\"x\" in s", note: "'in' operator, not method" },
        { js: "\"ha\".repeat(3)", py: "\"ha\" * 3", note: "Multiplication operator" },
        { js: ".indexOf(\"x\")", py: ".find(\"x\") / .index(\"x\")", note: ".find() returns -1, .index() raises" },
        { js: "arr.join(\", \")", py: "\", \".join(lst)", note: "join is a string method" },
      ],
      tips: [
        "f-strings can contain any expression and a format spec: f\"{price * 1.1:.2f}\" formats to 2 decimal places.",
        "Triple quotes (\"\"\"...\"\"\") create multi-line strings. Add the f prefix if you also need interpolation.",
        ".split() with no argument splits on any run of whitespace and drops empty strings. Very handy.",
        "join is called on the separator, not the list: \", \".join(names). Every item must already be a string.",
        "Raw strings r\"...\" prevent backslash interpretation. Essential for regex patterns and Windows file paths.",
      ],
      jsCode: `// JavaScript
const name = "Alice";
const age = 25;
console.log(\`Hello \${name}, age: \${age}\`);

"hello world".toUpperCase();
"hello world".includes("world");
"hello world".split(" ");
"  spaces  ".trim();
"ha".repeat(3);
["a", "b"].join(", ");`,
      pyCode: `# Python
name = "Alice"
age = 25
print(f"Hello {name}, age: {age}")
print(f"Next year: {age + 1}")  # expressions!
print(f"{name:>20}")            # right-align in 20 chars

"hello world".upper()
"world" in "hello world"   # 'in' operator!
"hello world".split(" ")
"  spaces  ".strip()       # strip, not trim
"ha" * 3                   # *, not .repeat()
", ".join(["a", "b"])      # separator.join(list)`,
      exercise: {
        question: "Write Python code that does the following:\n1. Variable name = any name string\n2. Variable lang = 'Python'\n3. Print a greeting using an f-string with both variables\n4. Print the same greeting in uppercase",
        prompt: "",
        answer: `name = "Alice"
lang = "Python"
greeting = f"Welcome {name}, hello to {lang}!"
print(greeting)
print(greeting.upper())`,
        output: "Welcome Alice, hello to Python!\nWELCOME ALICE, HELLO TO PYTHON!",
        hint: "Store the f-string in a variable first, then print it, and print it again with .upper() called on that variable.",
        checks: (code) => [
          has(code, /\bf["'].*\{\s*name\b/, "Use an f-string that includes {name}"),
          has(code, /\bf["'].*\{\s*lang\b/, "Use an f-string that includes {lang}"),
          has(code, /\.upper\(\)/, "Use .upper() for uppercase"),
          hasNot(code, /\.toUpperCase/, "AttributeError: use .upper(), not .toUpperCase()"),
        ],
        tests: `assert isinstance(name, str) and name.strip(), "Define name as a non-empty string"
assert lang == "Python", "Define lang = 'Python'"
_lines = [l for l in __output__.splitlines() if l.strip()]
assert len(_lines) >= 2, "Print two lines: the greeting, then the greeting in uppercase"
assert name in _lines[0] and lang in _lines[0], "The first line should contain both name and lang"
assert _lines[1] == _lines[0].upper(), "The second line should be the first line in uppercase"`,
      },
    },
    {
      id: "numbers", title: "Numbers & Math",
      content: "JS has a single number type: every Number is a 64-bit float, and BigInt was bolted on later for big integers. Python has two everyday types instead: int and float. A float is the same 64-bit float you know from JS. An int, however, has unlimited precision. 2 ** 100 is computed exactly, and there is no MAX_SAFE_INTEGER to worry about.\n\nDivision is where the difference shows. The / operator ALWAYS returns a float in Python: 7 / 2 is 3.5 and even 6 / 2 is 3.0. When you want whole-number division, use the floor division operator //: 7 // 2 is 3. It floors toward negative infinity, so -7 // 2 is -4, not -3. The modulo operator % follows the same logic: the result takes the sign of the divisor, so -7 % 3 is 2 in Python but -1 in JS. That makes % reliable for things like wrapping list indexes. Exponentiation is ** in both languages.\n\nFloats behave exactly like in JS, including 0.1 + 0.2 == 0.30000000000000004. Compare floats with math.isclose(a, b), and use decimal.Decimal (created from strings, like Decimal(\"0.10\")) when you need exact decimal arithmetic such as money. Another surprise: round() uses banker's rounding (round half to even), so round(2.5) is 2 and round(3.5) is 4, while JS's Math.round(2.5) gives 3.\n\nConversions are strict. int(\"42\") works, but int(\"3.5\") and int(\"abc\") raise ValueError, where JS's parseInt would quietly return 3 or NaN. int(3.9) truncates toward zero to 3. Dividing by zero raises ZeroDivisionError instead of returning Infinity.\n\nTwo syntax gifts and one loss. You can chain comparisons: 1 < x < 5 means exactly what it looks like. You can write 1_000_000 for readability (JS has numeric separators too). But there is no ++ or --. Write x += 1. Beware: ++x is valid Python, but it means +(+x) and does nothing at all.",
      keyDiffs: [
        { js: "6 / 2 → 3", py: "6 / 2 → 3.0", note: "/ always returns a float" },
        { js: "Math.floor(7 / 2)", py: "7 // 2", note: "Floor division operator" },
        { js: "-7 % 3 → -1", py: "-7 % 3 → 2", note: "Result takes the divisor's sign" },
        { js: "2n ** 100n (BigInt)", py: "2 ** 100", note: "int has unlimited precision" },
        { js: "Math.round(2.5) → 3", py: "round(2.5) → 2", note: "Rounds half to even" },
        { js: "parseInt(\"3.5\") → 3", py: "int(\"3.5\") → ValueError", note: "Strict conversion, no NaN" },
        { js: "1 / 0 → Infinity", py: "1 / 0 → ZeroDivisionError", note: "Raises instead" },
        { js: "x > 1 && x < 5", py: "1 < x < 5", note: "Chained comparison" },
        { js: "x++", py: "x += 1", note: "No ++ or -- operators" },
      ],
      tips: [
        "++x is valid Python but does nothing: it is +(+x). Always write x += 1.",
        "Use math.isclose(a, b) to compare floats, and decimal.Decimal(\"0.10\") (from a string!) for money.",
        "int(-3.9) truncates toward zero (-3), while -3.9 // 1 and math.floor(-3.9) floor to -4.",
        "divmod(17, 5) returns (3, 2): the quotient and the remainder in one call.",
        "Mixing int and float gives a float: 2 + 1.0 is 3.0. Mixing either with a str raises TypeError.",
      ],
      jsCode: `// JavaScript
console.log(7 / 2);             // 3.5
console.log(Math.floor(7 / 2)); // 3
console.log(-7 % 3);            // -1
console.log(2 ** 53 + 1);       // 9007199254740992 (precision lost!)
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(Math.round(2.5));   // 3
console.log(parseInt("3.5"));   // 3
console.log(Number("abc"));     // NaN

let count = 0;
count++;`,
      pyCode: `# Python
print(7 / 2)        # 3.5
print(6 / 2)        # 3.0  (always a float)
print(7 // 2)       # 3    (floor division)
print(-7 // 2)      # -4   (floors toward -infinity)
print(-7 % 3)       # 2    (sign of the divisor)
print(2 ** 53 + 1)  # 9007199254740993 (exact!)

import math
print(0.1 + 0.2)                     # 0.30000000000000004
print(math.isclose(0.1 + 0.2, 0.3))  # True
print(round(2.5), round(3.5))        # 2 4 (half to even)

print(int("42"), float("3.5"))  # 42 3.5
# int("3.5")  -> ValueError
# int("abc")  -> ValueError (not NaN)

x = 3
print(1 < x < 5)    # True (chained comparison)
count = 0
count += 1          # no ++ in Python`,
      exercise: {
        question: "Write Python code for these tasks:",
        prompt: `1. Split 17 cookies among 5 friends: store what each friend gets
   in per_friend and the leftovers in leftover (use // and %)
2. Store 2 ** 64 in big (no overflow, no BigInt needed)
3. price = "19.99" is a string: convert it to a float called price_num
4. is_close = whether 0.1 + 0.2 is close to 0.3 (use math.isclose)
5. age = 25, and in_range = whether age is between 18 and 30
   (inclusive) using ONE chained comparison
6. Print per_friend and leftover on one line`,
        answer: `import math

per_friend = 17 // 5
leftover = 17 % 5
big = 2 ** 64
price = "19.99"
price_num = float(price)
is_close = math.isclose(0.1 + 0.2, 0.3)
age = 25
in_range = 18 <= age <= 30
print(per_friend, leftover)`,
        output: "3 2",
        hint: "// gives the whole part of a division and % gives the remainder. A chained comparison looks like low <= value <= high, with no 'and' needed.",
        checks: (code) => [
          has(code, "//", "Use the floor division operator // for per_friend"),
          has(code, /%/, "Use the modulo operator % for leftover"),
          has(code, /isclose\s*\(/, "Use math.isclose() to compare the floats"),
          has(code, /\d+\s*<=?\s*age\s*<=?\s*\d+/, "Use one chained comparison, like 18 <= age <= 30"),
          hasNot(code, /\+\+|--/, "Python has no ++ or -- operators. Use += 1 or -= 1"),
        ],
        tests: `assert per_friend == 3 and isinstance(per_friend, int), "per_friend should be 17 // 5, the int 3 (not 3.4)"
assert leftover == 2, "leftover should be 17 % 5, which is 2"
assert big == 18446744073709551616, "big should be exactly 2 ** 64"
assert isinstance(price_num, float) and price_num == 19.99, "price_num should be float(price), i.e. 19.99"
assert is_close is True, "is_close should be math.isclose(0.1 + 0.2, 0.3), which is True"
assert in_range is True, "in_range should be True for age = 25"
assert "3 2" in __output__, "Print per_friend and leftover, e.g. print(per_friend, leftover)"`,
      },
    },
    {
      id: "conditionals", title: "Conditions & Truthiness",
      content: "Conditionals in Python look almost like pseudocode. No parentheses around the condition, no curly braces for the body. Instead, a colon after the condition and indentation for the block. This feels liberating once you adjust, but the indentation is not optional: it IS the syntax.\n\nTwo things will trip you up immediately. First: it is 'elif', not 'else if'. Your fingers will type 'else if' for days. Second: boolean operators are words, not symbols. Use 'and' instead of &&, 'or' instead of ||, and 'not' instead of !. Like && and || in JS, 'and' and 'or' short-circuit and return one of their operands, so name or \"Anonymous\" works the way you expect.\n\nTruthiness rules differ in an important way. In JS, empty arrays [] and objects {} are truthy. In Python, empty lists, dicts, sets, tuples, and strings are ALL falsy, as are 0, 0.0, None, and False. This makes emptiness checks more intuitive: you just write 'if my_list:' instead of 'if (myList.length > 0)'. One reverse surprise: NaN is falsy in JS, but float('nan') is truthy in Python.\n\nIndentation rules: Python does not require a specific number of spaces, but every line in a block must be indented by the same amount. An inconsistent indent raises IndentationError, and mixing tabs and spaces raises TabError. The PEP 8 standard is 4 spaces per level, and practically every Python codebase uses it. Configure your editor to insert 4 spaces when you press Tab and you will never think about this again.\n\nOne more thing that surprises JS developers: Python has no block scope. A variable created inside an if, for, or while block remains accessible after the block ends. Only modules, functions, and classes create new scopes (comprehensions also get their own small scope).",
      keyDiffs: [
        { js: "if (cond) { }", py: "if cond:", note: "No parens, no braces, colon + indent" },
        { js: "else if", py: "elif", note: "One word, not two" },
        { js: "&& / || / !", py: "and / or / not", note: "English words" },
        { js: "x === y", py: "x == y", note: "No str/number coercion, but 1 == 1.0" },
        { js: "cond ? a : b", py: "a if cond else b", note: "Different order!" },
        { js: "[] is truthy", py: "[] is falsy", note: "Empty collections are falsy" },
      ],
      tips: [
        "match/case (Python 3.10+) is Python's switch, and it is far more powerful. For simple branching, if/elif chains are perfectly idiomatic.",
        "== never converts between strings and numbers (\"1\" == 1 is False), but numeric types compare by value: 1 == 1.0 and True == 1 are both True.",
        "The ternary order is reversed: value_if_true if condition else value_if_false.",
        "Indent with 4 spaces (PEP 8). Inconsistent indentation raises IndentationError; mixing tabs and spaces raises TabError.",
        "Python has no block scope. A variable assigned inside an if block is still defined after it. Only modules, functions, and classes create scopes.",
      ],
      jsCode: `// JavaScript
const score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C");
}

const grade = score >= 90 ? "A" : "B";
// Falsy: 0, "", null, undefined, NaN, false
// Truthy: everything else (including [] and {})`,
      pyCode: `# Python
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")

grade = "A" if score >= 90 else "B"
# Falsy: 0, 0.0, "", None, False, [], {}, set(), ()
# [] and {} are falsy here! float("nan") is truthy.

if score > 80 and score < 100:   # or simply: 80 < score < 100
    print("Great!")`,
      exercise: {
        question: "Convert this JavaScript to Python. Watch the differences!",
        prompt: `// JavaScript
const temp = 35;
let message;

if (temp > 40) {
  message = "Too hot!";
} else if (temp > 30) {
  message = "Warm";
} else if (temp > 20) {
  message = "Nice";
} else {
  message = "Cold";
}

const isHot = temp > 30 ? true : false;
console.log(message + " | Hot: " + isHot);`,
        answer: `temp = 35

if temp > 40:
    message = "Too hot!"
elif temp > 30:
    message = "Warm"
elif temp > 20:
    message = "Nice"
else:
    message = "Cold"

is_hot = temp > 30
print(f"{message} | Hot: {is_hot}")`,
        output: "Warm | Hot: True",
        hint: "Each 'else if' becomes elif, and the ternary is unnecessary: temp > 30 already evaluates to True or False.",
        checks: (code) => [
          has(code, /\belif\b/, "Python uses 'elif', not 'else if'"),
          has(code, /^\s*else\s*:/m, "Need: else: for the default case"),
          hasNot(code, /\bisHot\b/, "NameError: 'isHot' is not defined. Use 'is_hot' (snake_case)"),
        ],
        tests: `import re as _re
assert temp == 35, "Define temp = 35"
assert message == "Warm", "With temp = 35, message should be 'Warm'"
assert is_hot is True, "is_hot should be the boolean True (temp > 30)"
assert "Warm | Hot: True" in __output__, "Print exactly: Warm | Hot: True"

def _message_for(t):
    ns = {}
    exec(_re.sub(r"\\btemp\\s*=\\s*35\\b", f"temp = {t}", __source__, count=1), ns)
    return ns.get("message")

assert _message_for(45) == "Too hot!", "With temp = 45, message should be 'Too hot!'"
assert _message_for(25) == "Nice", "With temp = 25, message should be 'Nice'"
assert _message_for(10) == "Cold", "With temp = 10, message should be 'Cold'"`,
      },
    },
  ],
};

import { has, hasNot } from "../../lib/validation";

export default {
  id: "loops", title: "Loops & Iteration", icon: "\u{1F504}", subtitle: "for, while, for/else, built-ins", tier: 1,
  lessons: [
    {
      id: "loops", title: "Loops & Control Flow",
      content: "Python's for loop iterates over iterables directly, like JS for...of. There is no C-style for (let i = 0; i < n; i++). When you need a counter, use range(n); when you need the index of each item, use enumerate(). This feels odd for a day and then becomes natural. break and continue work exactly like in JS.\n\nPython has a unique for/else construct (while loops have it too). The else block runs only if the loop completed WITHOUT hitting a break. This is perfect for search patterns: loop through items looking for a match, break when found, and let the else handle the 'not found' case. No flag variables needed.\n\nTwo things Python lacks. There is no do/while loop: the standard replacement is 'while True:' with a break at the end of the body. And there are no labeled breaks: to escape nested loops, move them into a function and return, or restructure the search with for/else.\n\nIterables versus iterators matter in Python. Lists, tuples, strings, dicts, and ranges can be looped over as many times as you like, just like JS arrays. But iterators, such as generators and the results of zip(), map(), filter(), and enumerate(), are consumed once: loop over them a second time and you get nothing. That is the same behavior as a JS generator or arr.values(). If you need multiple passes, convert to a list first with list().\n\nAlso, range() does not create a list. It returns a lazy range object that computes numbers on demand, so range(1_000_000_000) uses almost no memory. Use list(range(10)) only if you actually need a list.",
      keyDiffs: [
        { js: "for (let i = 0; i < 5; i++)", py: "for i in range(5):", note: "range() replaces C-style" },
        { js: "for (const x of arr)", py: "for x in arr:", note: "Direct iteration" },
        { js: "arr.forEach((x, i) => ...)", py: "for i, x in enumerate(arr):", note: "enumerate for index" },
        { js: "for (const k in obj)", py: "for k in d:", note: "Keys; use d.items() for pairs" },
        { js: "do { } while (cond)", py: "while True: ... if not cond: break", note: "No do/while" },
        { js: "outer: for ... break outer", py: "return from a function", note: "No labeled break" },
        { js: "No equivalent", py: "for/else", note: "else runs if no break" },
      ],
      tips: [
        "zip(a, b) iterates two sequences in parallel: for name, score in zip(names, scores).",
        "sorted() returns a new list and reversed() returns a lazy iterator. Neither modifies the original.",
        "The for/else pattern replaces the 'found = False' flag pattern. Clean and Pythonic.",
        "Iterators are consumed once, exactly like JS generators. Convert to a list if you need multiple passes.",
        "Never modify a list while looping over it. Loop over a copy (for x in items[:]) or build a new list with a comprehension.",
      ],
      jsCode: `// JavaScript loops
for (let i = 0; i < 5; i++) {
  console.log(i);
}
for (const item of [1, 2, 3]) {
  console.log(item);
}
for (const key in obj) {
  console.log(key, obj[key]);
}
let n = 10;
while (n > 0) { n--; }
do { n++; } while (n < 10);`,
      pyCode: `# Python loops
for i in range(5):          # 0,1,2,3,4
    print(i)
for i in range(2, 10, 3):   # 2,5,8
    print(i)

for item in [1, 2, 3]:      # direct
    print(item)
config = {"debug": True, "port": 8080}
for k, v in config.items():
    print(k, v)

n = 10
while n > 0:
    n -= 1

# for/else - unique to Python!
items, target = [3, 7, 9], 7
for item in items:
    if item == target:
        print("Found!")
        break
else:
    print("Not found")  # only runs if no break happened

# Parallel iteration
for a, b in zip(["x", "y"], [1, 2]):
    print(a, b)`,
      exercise: {
        question: "Write Python code:",
        prompt: `1. Loop through 1-100 and find the first number divisible by both 7 and 13
2. If found: print it and stop. If not: print "No match"
   (Use for/else, no flag variables!)
3. Given names = ["Alice", "Bob", "Carol"] and scores = [95, 87, 92],
   print "Alice: 95" etc. using zip`,
        answer: `for n in range(1, 101):
    if n % 7 == 0 and n % 13 == 0:
        print(f"Found: {n}")
        break
else:
    print("No match")

names = ["Alice", "Bob", "Carol"]
scores = [95, 87, 92]
for name, score in zip(names, scores):
    print(f"{name}: {score}")`,
        output: "Found: 91\nAlice: 95\nBob: 87\nCarol: 92",
        hint: "Attach else: to the for loop itself (same indentation as the for). It only runs when the loop finishes without break.",
        checks: (code) => [
          has(code, "break", "Break out of the loop when the match is found"),
          has(code, "zip(", "Use zip() for parallel iteration"),
          hasNot(code, /\bfor\s*\(/, "SyntaxError: Python for loops don't use parentheses"),
        ],
        tests: `import ast as _ast
_tree = _ast.parse(__source__)
assert any(isinstance(n, (_ast.For, _ast.While)) and n.orelse for n in _ast.walk(_tree)), "Use for/else: put the 'No match' print in an else block attached to the for loop"
assert "91" in __output__, "The first number divisible by both 7 and 13 is 91: print it"
assert "No match" not in __output__, "'No match' should only print when the loop ends without break"
for _line in ["Alice: 95", "Bob: 87", "Carol: 92"]:
    assert _line in __output__, f"Expected the line '{_line}' (use zip(names, scores))"`,
      },
    },
    {
      id: "iteration-tools", title: "Iteration Toolkit",
      content: "JS puts its iteration helpers on Array.prototype: sort, some, every, reduce, map, filter. Python puts most of them in built-in functions instead: sorted(), min(), max(), sum(), any(), all(), enumerate(), zip(), reversed(), map(), and filter(). Because they are functions rather than methods, they work on any iterable: lists, tuples, sets, dict keys, strings, files, and generators alike.\n\nSorting is where JS developers save the most pain. JS's default sort compares elements as strings, so [10, 9, 1].sort() gives [1, 10, 9]. Python compares numbers as numbers. And instead of a comparator like (a, b) => a.age - b.age, Python takes a key function that returns the value to sort by: sorted(users, key=lambda u: u[\"age\"]). Add reverse=True for descending order, or return a tuple from the key to sort by several fields. Python's sort is stable, like modern JS.\n\nmin() and max() accept the same key argument, so finding the youngest user is one call: min(users, key=lambda u: u[\"age\"]). any() and all() are Python's some() and every(), and they pair beautifully with generator expressions: any(u[\"age\"] < 18 for u in users). sum() covers the most common use of reduce(). For everything else functools.reduce exists, but Python developers rarely reach for it.\n\nmap() and filter() exist too, but they return lazy iterators, and most Python developers prefer comprehensions for the same job. Finally, two small upgrades: enumerate(items, start=1) numbers items from 1, and zip(a, b, strict=True) (Python 3.10+) raises ValueError when the inputs have different lengths instead of silently dropping the extras.",
      keyDiffs: [
        { js: "arr.sort((a, b) => a.age - b.age)", py: "sorted(arr, key=lambda u: u[\"age\"])", note: "Key function, returns a new list" },
        { js: "[10, 9, 1].sort() → [1, 10, 9]", py: "sorted([10, 9, 1]) → [1, 9, 10]", note: "Numbers sort numerically" },
        { js: "arr.some(x => x > 10)", py: "any(x > 10 for x in arr)", note: "Short-circuits" },
        { js: "arr.every(x => x > 0)", py: "all(x > 0 for x in arr)", note: "True for empty input" },
        { js: "Math.max(...arr)", py: "max(arr)", note: "Any iterable, supports key=" },
        { js: "arr.reduce((a, b) => a + b, 0)", py: "sum(arr)", note: "Built-in for numbers" },
        { js: "arr.toReversed()", py: "reversed(arr) / arr[::-1]", note: "Lazy iterator / new list" },
        { js: "arr.map(fn)", py: "map(fn, arr)", note: "Lazy; comprehension preferred" },
      ],
      tips: [
        "sorted() returns a new list; list.sort() sorts in place and returns None. Both accept key= and reverse=.",
        "Sort by several fields with a tuple key: key=lambda u: (u[\"dept\"], -u[\"age\"]).",
        "all([]) is True and any([]) is False, just like [].every() and [].some() in JS.",
        "zip() silently stops at the shortest input. Use zip(a, b, strict=True) (Python 3.10+) to get a ValueError on a length mismatch.",
        "max() and min() raise ValueError on an empty iterable. Pass default=None to get a fallback instead.",
        "map() and filter() return lazy iterators, not lists. Wrap them in list() or, more idiomatically, use a comprehension.",
      ],
      jsCode: `// JavaScript
const users = [
  { name: "Ana", age: 31 },
  { name: "Bo", age: 25 },
  { name: "Cy", age: 42 },
];
const byAge = [...users].sort((a, b) => a.age - b.age);
const oldest = users.reduce((a, b) => (b.age > a.age ? b : a));
const anyTeen = users.some(u => u.age < 20);
const allAdults = users.every(u => u.age >= 18);
const total = users.reduce((sum, u) => sum + u.age, 0);

[10, 9, 1].sort();  // [1, 10, 9] - compared as strings!
users.forEach((u, i) => console.log(i + 1, u.name));`,
      pyCode: `# Python
users = [
    {"name": "Ana", "age": 31},
    {"name": "Bo", "age": 25},
    {"name": "Cy", "age": 42},
]
by_age = sorted(users, key=lambda u: u["age"])
oldest = max(users, key=lambda u: u["age"])
any_teen = any(u["age"] < 20 for u in users)
all_adults = all(u["age"] >= 18 for u in users)
total = sum(u["age"] for u in users)

sorted([10, 9, 1])              # [1, 9, 10] - numeric!
sorted(users, key=lambda u: u["age"], reverse=True)

for i, u in enumerate(users, start=1):
    print(i, u["name"])

names = ["Ana", "Bo"]
ages = [31, 25, 42]
list(zip(names, ages))          # [('Ana', 31), ('Bo', 25)] - 42 dropped!
# zip(names, ages, strict=True) -> ValueError (3.10+)

list(reversed([1, 2, 3]))       # [3, 2, 1]
list(map(str.upper, names))     # ['ANA', 'BO']`,
      exercise: {
        question: "The products list below is already defined for you. Use built-in functions (no manual loops except for printing):",
        prompt: `products = [
    {"name": "Laptop", "price": 999, "stock": 5},
    {"name": "Mouse", "price": 25, "stock": 0},
    {"name": "Monitor", "price": 300, "stock": 2},
    {"name": "Cable", "price": 10, "stock": 40},
]

1. by_price: products sorted by price, most expensive first
   (do not modify products itself)
2. cheapest: the product dict with the lowest price (one call, no sorting)
3. any_out_of_stock: True if any product has stock 0
4. all_under_1000: True if every price is under 1000
5. inventory_value: total of price * stock across all products
6. Print a numbered list starting at 1: "1. Laptop", "2. Mouse", ...`,
        setup: `products = [
    {"name": "Laptop", "price": 999, "stock": 5},
    {"name": "Mouse", "price": 25, "stock": 0},
    {"name": "Monitor", "price": 300, "stock": 2},
    {"name": "Cable", "price": 10, "stock": 40},
]`,
        answer: `by_price = sorted(products, key=lambda p: p["price"], reverse=True)
cheapest = min(products, key=lambda p: p["price"])
any_out_of_stock = any(p["stock"] == 0 for p in products)
all_under_1000 = all(p["price"] < 1000 for p in products)
inventory_value = sum(p["price"] * p["stock"] for p in products)

for i, p in enumerate(products, start=1):
    print(f"{i}. {p['name']}")`,
        output: "1. Laptop\n2. Mouse\n3. Monitor\n4. Cable",
        hint: "sorted(), min(), and max() all accept key=lambda p: p[\"price\"]. any() and all() take a generator expression, and enumerate() has a start parameter.",
        checks: (code) => [
          has(code, /key\s*=/, "Use a key= function to sort and to find the cheapest product"),
          has(code, /\bmin\s*\(/, "Use min(..., key=...) to find the cheapest product"),
          has(code, /\bany\s*\(/, "Use any() for any_out_of_stock"),
          has(code, /\ball\s*\(/, "Use all() for all_under_1000"),
          has(code, /\benumerate\s*\(/, "Use enumerate(products, start=1) for the numbered list"),
          hasNot(code, /products\.sort\(/, "products.sort() modifies the original list. Use sorted() instead", "warning"),
        ],
        tests: `_names = [p["name"] for p in by_price]
assert _names == ["Laptop", "Monitor", "Mouse", "Cable"], f"by_price should go from most to least expensive, got {_names}"
assert [p["name"] for p in products] == ["Laptop", "Mouse", "Monitor", "Cable"], "Do not sort products in place; sorted() returns a new list"
assert cheapest["name"] == "Cable", "cheapest should be the Cable dict: min(products, key=...)"
assert any_out_of_stock is True, "any_out_of_stock should be True (the Mouse has stock 0)"
assert all_under_1000 is True, "all_under_1000 should be True"
assert inventory_value == 5995, f"inventory_value should be 5995, got {inventory_value}"
for _line in ["1. Laptop", "2. Mouse", "3. Monitor", "4. Cable"]:
    assert _line in __output__, f"Expected the line '{_line}' (use enumerate(products, start=1))"`,
      },
    },
  ],
};

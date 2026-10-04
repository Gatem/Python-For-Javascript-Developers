import { has, hasNot } from "../../lib/validation";

export default {
  id: "collections", title: "Data Structures", icon: "\u{1F4E6}", subtitle: "Lists, Dicts, Tuples, Sets", tier: 1,
  lessons: [
    {
      id: "lists", title: "Lists (= Arrays)",
      content: "Python's list is your JS array. Same square bracket syntax, same zero-based indexing. You will feel right at home until you call .push() and get an AttributeError. It is .append() in Python.\n\nThe killer feature JS arrays do not have is slicing. With my_list[1:4], you grab elements 1 through 3 in a single expression. Add a step value (my_list[::2] for every other element) or go negative (my_list[::-1] to reverse). Negative indexes count from the end, so my_list[-1] is the last item. Once slicing clicks, you will wonder how you ever lived without it.\n\nWatch out for a few common traps. First: list.sort() sorts in place and returns None, not the sorted list. If you write sorted_list = my_list.sort(), sorted_list is None. Use sorted(my_list) to get a new sorted list. Second: multiplying a list repeats references to the same objects. [[0]] * 3 gives you three references to the SAME inner list, so changing one changes all of them. Use a comprehension instead: [[0] for _ in range(3)].\n\nSlicing always creates a new list, but it is a shallow copy. So b = a[:] (or a.copy()) copies the list, while nested objects inside are still shared between the original and the copy. For deep copies, use copy.deepcopy(), the equivalent of JS's structuredClone().\n\nDestructuring works too, with a slightly different syntax. Instead of const [first, ...rest] = arr, you write first, *rest = arr. The star (*) replaces the spread dots, and rest is always a list.",
      keyDiffs: [
        { js: ".push(x)", py: ".append(x)", note: "Most common gotcha" },
        { js: ".push(...items)", py: ".extend(items)", note: "Add many items" },
        { js: ".unshift(x)", py: ".insert(0, x)", note: "Insert at any index" },
        { js: ".includes(x)", py: "x in lst", note: "'in' operator" },
        { js: ".indexOf(x)", py: ".index(x)", note: "Raises ValueError if missing!" },
        { js: ".splice(i, 1)", py: "del lst[i] / lst.pop(i)", note: "Remove by index" },
        { js: "[...arr]", py: "[*arr] / arr.copy()", note: "Shallow copy" },
        { js: "arr.slice(1, 3)", py: "arr[1:3]", note: "Bracket slicing" },
        { js: "arr.at(-1)", py: "arr[-1]", note: "Negative indexing built in" },
      ],
      tips: [
        "Negative indexing is a game changer: arr[-1] is the last item, arr[-3:] is the last three.",
        "Slicing never raises IndexError. Out-of-range slices just return shorter (or empty) lists.",
        "list.sort() sorts in place and returns None. sorted(lst) returns a new list.",
        "[[0]] * 3 repeats the SAME inner list three times. Build nested lists with a comprehension instead.",
        "lst.remove(x) deletes the first matching VALUE; lst.pop(i) and del lst[i] remove by INDEX.",
      ],
      jsCode: `// JavaScript Arrays
const nums = [1, 2, 3, 4, 5];
nums.push(6);
nums.pop();
nums.unshift(0);
nums.includes(3);
nums.indexOf(3);
nums.splice(1, 1);
nums.slice(1, 3);
nums.at(-1);

const [first, second, ...rest] = nums;
const combined = [...nums, 7, 8];`,
      pyCode: `# Python Lists
nums = [1, 2, 3, 4, 5]
nums.append(6)        # push -> append
nums.pop()            # same!
nums.insert(0, 0)     # unshift -> insert
3 in nums             # includes -> in
nums.index(3)         # indexOf -> index
del nums[1]           # splice -> del
nums[1:3]             # slice syntax

# Slicing superpowers
nums[::2]     # every other element
nums[::-1]    # reversed copy
nums[-1]      # last element
nums[-3:]     # last 3 elements

first, second, *rest = nums  # unpack
combined = [*nums, 7, 8]     # spread`,
      exercise: {
        question: "Write Python code that does the following:",
        prompt: `1. Create a list called fruits: "apple", "banana", "cherry", "date", "elderberry"
2. Add "fig" to the end
3. Remove "banana"
4. Print the first 3 elements using slicing
5. Print the list reversed using slicing
6. Unpack: first element into 'first', the rest into 'rest'`,
        answer: `fruits = ["apple", "banana", "cherry", "date", "elderberry"]
fruits.append("fig")
fruits.remove("banana")
print(fruits[:3])
print(fruits[::-1])
first, *rest = fruits`,
        output: "['apple', 'cherry', 'date']\n['fig', 'elderberry', 'date', 'cherry', 'apple']",
        hint: "Use .append() and .remove(), then slices: [:3] for the first three and [::-1] for reversed. A star in the assignment collects the rest into a list.",
        checks: (code) => [
          has(code, /\.append\(/, "Use .append() to add to the end"),
          has(code, /\[\s*0?\s*:\s*3\s*\]/, "Print the first 3 with slicing: fruits[:3]"),
          has(code, /\[\s*:\s*:\s*-1\s*\]/, "Print reversed with slicing: fruits[::-1]"),
          has(code, /\*\s*rest\s*=/, "Unpack with a star: first, *rest = fruits"),
          hasNot(code, /\.push\(/, "AttributeError: use .append(), not .push()"),
        ],
        tests: `assert fruits == ["apple", "cherry", "date", "elderberry", "fig"], f"fruits should end as ['apple', 'cherry', 'date', 'elderberry', 'fig'], got {fruits}"
assert first == "apple", "first should be 'apple'"
assert rest == ["cherry", "date", "elderberry", "fig"], "rest should hold every element after the first"
assert "['apple', 'cherry', 'date']" in __output__, "Print the first 3 elements: fruits[:3]"
assert "['fig', 'elderberry', 'date', 'cherry', 'apple']" in __output__, "Print the list reversed: fruits[::-1]"`,
      },
    },
    {
      id: "dicts", title: "Dictionaries (= Objects)",
      content: "Python's dictionary fills the same role as a JS object used as a map: a collection of key-value pairs. But dicts are stricter. In a dict literal, string keys must be quoted ({\"name\": \"Alice\"}); an unquoted name would be treated as a variable. And you access values only with brackets, never dot notation: user.name looks for an attribute, not a key, and raises AttributeError.\n\nKeys can be any hashable value, not just strings. Hashable roughly means immutable: strings, numbers, tuples of hashable items, and frozensets all work. Lists, dicts, and sets cannot be keys because they can change; trying it raises TypeError: unhashable type. Unlike JS objects, keys are not converted to strings, so d[1] and d[\"1\"] are two different entries.\n\nThe safe access pattern is different too. Instead of user?.name ?? \"default\", Python uses user.get(\"name\", \"default\"). It returns the default if the key is missing instead of raising KeyError. Clean and explicit.\n\nIteration is one area where Python dicts are genuinely nicer. Instead of Object.keys(), Object.values(), and Object.entries(), you call .keys(), .values(), and .items() on the dict itself, and 'for key in my_dict' just works. One rule: do not add or remove keys while iterating over a dict (changing values is fine). That raises RuntimeError: dictionary changed size during iteration. Loop over a copy of the keys instead: for k in list(my_dict):",
      keyDiffs: [
        { js: "{ name: \"Alice\" }", py: "{\"name\": \"Alice\"}", note: "String keys need quotes" },
        { js: "obj.name", py: "obj[\"name\"]", note: "No dot notation for dicts" },
        { js: "obj.name ?? \"default\"", py: "obj.get(\"name\", \"default\")", note: ".get() with default" },
        { js: "Object.keys(obj)", py: "obj.keys() / list(obj)", note: "Method on the dict itself" },
        { js: "Object.entries(obj)", py: "obj.items()", note: "entries -> items" },
        { js: "{ ...a, ...b }", py: "{**a, **b} / a | b", note: "a | b needs Python 3.9+" },
        { js: "delete obj.key", py: "del d[\"key\"] / d.pop(\"key\")", note: "pop() also returns the value" },
        { js: "Object.fromEntries(arr.map(...))", py: "{k: v for k, v in pairs}", note: "Dict comprehension" },
      ],
      tips: [
        "dict[key] raises KeyError if the key is missing. Use .get(key, default) for safe access.",
        "Since Python 3.7, dicts are guaranteed to preserve insertion order.",
        "Unlike JS objects, keys keep their type: d[1] and d[\"1\"] are different keys.",
        "Dict keys must be hashable: strings, numbers, tuples, and frozensets work; lists, dicts, and sets do not.",
        "For counting or grouping, collections.Counter and defaultdict remove the 'if key not in d' boilerplate.",
      ],
      jsCode: `// JavaScript Objects
const user = {
  name: "Alice",
  age: 25,
  skills: ["JS", "React"]
};
user.name;
user.country ?? "Unknown";
"name" in user;
Object.entries(user);
const updated = { ...user, age: 26 };
const squares = Object.fromEntries([0, 1, 2].map(x => [x, x ** 2]));`,
      pyCode: `# Python Dictionaries
user = {
    "name": "Alice",
    "age": 25,
    "skills": ["JS", "React"],
}
user["name"]                        # brackets only!
user.get("country", "Unknown")      # .get() + default
"name" in user                      # same!
user.items()                        # entries -> items
updated = {**user, "age": 26}       # ** spread
updated = user | {"age": 26}        # merge operator (3.9+)

# Dict comprehension (JS: Object.fromEntries + map)
squares = {x: x**2 for x in range(3)}`,
      exercise: {
        question: "Convert this JavaScript to Python (use snake_case for every name, including the in_stock key):",
        prompt: `// JavaScript
const product = {
  name: "Laptop",
  price: 999,
  inStock: true
};

const discountedPrice = product.price * 0.9;
const hasWarranty = product.warranty ?? false;

for (const [key, value] of Object.entries(product)) {
  console.log(\`\${key}: \${value}\`);
}`,
        answer: `product = {
    "name": "Laptop",
    "price": 999,
    "in_stock": True,
}

discounted_price = product["price"] * 0.9
has_warranty = product.get("warranty", False)

for key, value in product.items():
    print(f"{key}: {value}")`,
        output: "name: Laptop\nprice: 999\nin_stock: True",
        hint: "Quote every key, read price with brackets, use .get() with a default for the missing warranty key, and loop with for key, value in product.items().",
        checks: (code) => [
          has(code, ".get(", "Use .get(\"warranty\", False) for safe access with a default"),
          has(code, ".items()", "Use .items() to iterate over keys and values"),
          hasNot(code, /product\.price\b/, "AttributeError: 'dict' object has no attribute 'price'. Use product[\"price\"]"),
          hasNot(code, "Object.entries", "NameError: 'Object' is not defined. Use .items()"),
          hasNot(code, "??", "SyntaxError: Python has no ??. Use .get(key, default)"),
          hasNot(code, /\b(discountedPrice|hasWarranty|inStock)\b/, "Use snake_case names: discounted_price, has_warranty, in_stock"),
        ],
        tests: `assert product == {"name": "Laptop", "price": 999, "in_stock": True}, f"product should be {{'name': 'Laptop', 'price': 999, 'in_stock': True}}, got {product}"
assert abs(discounted_price - 899.1) < 1e-9, "discounted_price should be product['price'] * 0.9"
assert has_warranty is False, "has_warranty should be product.get('warranty', False)"
for _line in ["name: Laptop", "price: 999", "in_stock: True"]:
    assert _line in __output__, f"The loop should print '{_line}'"`,
      },
    },
    {
      id: "tuples-sets", title: "Tuples & Sets",
      content: "Tuples have no real JS equivalent. They are like arrays that cannot be modified after creation. Why would you want that? Immutability makes them safe to use as dictionary keys and set members, and guarantees nobody changes them by accident. Object.freeze() is the closest JS idea, but tuples are a real built-in type with their own literal syntax.\n\nSets exist in JS too, but Python's are more convenient: they have a literal syntax ({1, 2, 3}), set comprehensions, and math operators built in. Union is |, intersection is &, difference is -, and symmetric difference is ^. JS only gained union() and intersection() methods in ES2025; before that you needed spread and filter tricks.\n\nTuples are also the default way Python returns multiple values from a function. When you write 'return x, y', Python packs those into a tuple. You can unpack them right back: a, b = get_coords(). This pattern appears everywhere in Python code.\n\nTwo rules that catch everyone at least once. First: parentheses do not make a tuple, the COMMA does. (42) is just the number 42 in parentheses. (42,) with a trailing comma is a one-element tuple, and even x = 1, 2 creates a tuple without any parentheses. Second: an empty set is created with set(), not {}. Curly braces alone create an empty dictionary. So {} is a dict, {1, 2} is a set, and set() is an empty set.",
      keyDiffs: [
        { js: "Object.freeze([1, 2])", py: "(1, 2)", note: "Tuple: built-in immutable sequence" },
        { js: "new Set([1, 2, 3])", py: "{1, 2, 3}", note: "Literal syntax with braces" },
        { js: "a.union(b) (ES2025)", py: "a | b", note: "Union operator" },
        { js: "a.intersection(b) (ES2025)", py: "a & b", note: "Intersection operator" },
        { js: "a.difference(b) (ES2025)", py: "a - b", note: "Difference operator" },
        { js: "set.has(x)", py: "x in s", note: "'in' operator" },
        { js: "return [x, y]", py: "return x, y", note: "Auto-packs into a tuple" },
      ],
      tips: [
        "An empty set is set(), NOT {}. Curly braces alone create an empty dict.",
        "The COMMA makes the tuple, not the parentheses: (42) is just 42, (42,) is a tuple.",
        "Sets are unordered: never rely on element position. The iteration order of a set of strings can even change between runs.",
        "Sets only hold hashable items. Use frozenset for an immutable set, for example to put a set inside another set.",
        "x in some_set is O(1), while x in some_list is O(n). Convert a big list to a set before checking membership many times.",
      ],
      jsCode: `// JavaScript
const point = Object.freeze([10, 20]);

const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
a.add(4);
a.has(3);
// Before ES2025:
new Set([...a, ...b]);           // union
[...a].filter(x => b.has(x));    // intersection
// ES2025:
a.union(b);
a.intersection(b);`,
      pyCode: `# Python Tuples - immutable
point = (10, 20)
x, y = point       # unpacking

def get_user():
    return "Alice", 25   # returns a tuple
name, age = get_user()

# Sets - math operators!
a = {1, 2, 3}
b = {2, 3, 4}
a | b    # Union:        {1, 2, 3, 4}
a & b    # Intersection: {2, 3}
a - b    # Difference:   {1}
a ^ b    # Symmetric:    {1, 4}

evens = {x for x in range(20) if x % 2 == 0}`,
      exercise: {
        question: "Write Python code that does the following:",
        prompt: `1. Create a tuple called rgb with values (255, 128, 0)
2. Unpack it into 3 variables: r, g, b
3. Create a set called frontend: "React", "Vue", "Angular", "Svelte"
4. Create a set called backend: "Node", "Django", "Flask", "FastAPI"
5. Create all_tech = union of both sets
6. Print the total count of unique technologies`,
        answer: `rgb = (255, 128, 0)
r, g, b = rgb

frontend = {"React", "Vue", "Angular", "Svelte"}
backend = {"Node", "Django", "Flask", "FastAPI"}

all_tech = frontend | backend
print(len(all_tech))`,
        output: "8",
        hint: "Unpack all three values in one assignment, build the sets with curly braces, and combine them with the | operator (or .union()).",
        checks: (code) => [
          has(code, /\|\s*\w|\.union\(/, "Combine the sets with the | operator (or .union())"),
          has(code, "len(", "Use len() to count the elements"),
          hasNot(code, /new Set/, "Python sets use {} syntax, not new Set()"),
        ],
        tests: `assert rgb == (255, 128, 0) and isinstance(rgb, tuple), "rgb should be the tuple (255, 128, 0)"
assert (r, g, b) == (255, 128, 0), "Unpack rgb into r, g, b"
assert isinstance(frontend, set) and frontend == {"React", "Vue", "Angular", "Svelte"}, "frontend should be a set of the 4 frontend frameworks"
assert isinstance(backend, set) and backend == {"Node", "Django", "Flask", "FastAPI"}, "backend should be a set of the 4 backend frameworks"
assert all_tech == frontend | backend, "all_tech should be the union of frontend and backend"
assert "8" in __output__.split(), "Print the number of unique technologies (8)"`,
      },
    },
  ],
};

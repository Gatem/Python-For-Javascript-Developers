import { has, hasNot } from "../../lib/validation";

export default {
  id: "oop", title: "OOP", icon: "\u{1F3D7}️", subtitle: "Classes, Inheritance & Dunder Methods", tier: 2,
  lessons: [
    {
      id: "classes", title: "Python Classes",
      content: "Python classes look similar to JS classes with a few key twists. The constructor is called __init__ (not constructor), and every method takes 'self' as its first parameter (like 'this', but explicit). You do not use the 'new' keyword either: just call the class like a function.\n\nHere is the biggest conceptual difference from JS: self is not this. In JavaScript, 'this' is dynamically bound based on HOW a function is called. That is why you get the infamous 'lost this' bug when passing methods as callbacks: btn.addEventListener('click', user.greet) loses the 'this' context, and you need .bind(this) or arrow functions to fix it. In Python, accessing user.greet gives you a bound method that remembers its instance. You can pass it around as a callback and self is still correct. No .bind(), no arrow functions, no surprises.\n\nProperties work differently too. Instead of the get/set syntax JS uses, Python uses the @property decorator. This gives you a method that behaves like an attribute: you access it without parentheses, but code runs behind the scenes.\n\nStatic-style methods come in two flavours. @classmethod receives the class itself as 'cls', exactly like 'this' inside a JS static method, which makes it perfect for alternative constructors (User.from_json(data)). @staticmethod receives neither the class nor an instance; it is just a function namespaced inside the class.\n\nThere is no real 'private' in Python, unlike JS's #private fields. A leading underscore (_password) is a convention meaning 'internal, please do not touch'. A double underscore (__secret) triggers name mangling: Python renames it to _ClassName__secret, which prevents accidental clashes in subclasses but does not lock anything down. And __name__ style names (dunders) are reserved for Python's own special methods like __init__ and __str__; never invent your own.\n\nNaming conventions: classes use PascalCase (MyClass), methods and attributes use snake_case (my_method), and constants use SCREAMING_CASE (MAX_RETRIES). 'self' is also just a convention; you could technically call it anything, but every Python developer expects self.",
      keyDiffs: [
        { js: "constructor()", py: "__init__(self)", note: "self is explicit" },
        { js: "this.name", py: "self.name", note: "self always first param" },
        { js: "new User()", py: "User()", note: "No 'new' keyword" },
        { js: "get prop() {}", py: "@property", note: "Decorator-based" },
        { js: "#private", py: "_convention", note: "No true private" },
        { js: "static create() { new this() }", py: "@classmethod def create(cls)", note: "cls = the class, like this in a static" },
        { js: "static helper() (no this)", py: "@staticmethod", note: "No access to class or instance" },
      ],
      tips: [
        "Forgetting 'self' as the first method parameter is the #1 Python class mistake. Your editor should warn you.",
        "@classmethod is great for alternative constructors: User.from_json(data) that creates instances in different ways, and it works correctly for subclasses.",
        "_name means private by convention (not enforced). __name triggers name mangling (becomes _ClassName__name). __name__ is reserved for Python internals like __init__, __str__, __len__.",
        "Python has no 'lost this' problem. user.greet is a bound method, so you can pass it as a callback without .bind().",
      ],
      jsCode: "// JavaScript Classes\nclass User {\n  #password;\n  constructor(name, email) {\n    this.name = name;\n    this.email = email;\n    this.#password = \"\";\n  }\n  greet() { return \"Hi, I'm \" + this.name; }\n  get info() { return this.name + \" (\" + this.email + \")\"; }\n  set pass(v) {\n    if (v.length < 8) throw new Error(\"Too short\");\n    this.#password = v;\n  }\n  static create(n, e) { return new this(n, e); }\n}",
      pyCode: "# Python Classes\nclass User:\n    def __init__(self, name, email):\n        self.name = name\n        self.email = email\n        self._password = \"\"\n\n    def greet(self):\n        return f\"Hi, I'm {self.name}\"\n\n    @property\n    def info(self):\n        return f\"{self.name} ({self.email})\"\n\n    @property\n    def password(self):\n        return \"***hidden***\"\n\n    @password.setter\n    def password(self, value):\n        if len(value) < 8:\n            raise ValueError(\"Too short\")\n        self._password = value\n\n    @classmethod\n    def create(cls, name, email):\n        return cls(name, email)\n\n    @staticmethod\n    def is_valid_email(email):\n        return \"@\" in email\n\nu = User(\"Alice\", \"a@b.com\")  # no new!\ncallback = u.greet            # bound: no .bind() needed",
      exercise: {
        question: "Convert this JS class to Python:",
        prompt: "class Product {\n  constructor(name, price, category) {\n    this.name = name;\n    this.price = price;\n    this.category = category;\n    this._discount = 0;\n  }\n  get finalPrice() {\n    return this.price * (1 - this._discount);\n  }\n  set discount(percent) {\n    if (percent < 0 || percent > 100)\n      throw new Error(\"Invalid\");\n    this._discount = percent / 100;\n  }\n  toString() {\n    return this.name + \": $\" + this.finalPrice.toFixed(2);\n  }\n  static compare(p1, p2) {\n    return p1.finalPrice - p2.finalPrice;\n  }\n}",
        answer: "class Product:\n    def __init__(self, name, price, category):\n        self.name = name\n        self.price = price\n        self.category = category\n        self._discount = 0\n\n    @property\n    def final_price(self):\n        return self.price * (1 - self._discount)\n\n    @property\n    def discount(self):\n        return self._discount * 100\n\n    @discount.setter\n    def discount(self, percent):\n        if percent < 0 or percent > 100:\n            raise ValueError(\"Invalid\")\n        self._discount = percent / 100\n\n    def __str__(self):\n        return f\"{self.name}: ${self.final_price:.2f}\"\n\n    @staticmethod\n    def compare(p1, p2):\n        return p1.final_price - p2.final_price",
        hint: "A Python setter needs a getter first: define @property def discount(self), then @discount.setter. toString() becomes __str__, and toFixed(2) becomes the :.2f format spec inside an f-string.",
        tests: String.raw`
assert isinstance(globals().get("Product"), type), "Define a class called Product"
p = Product("Laptop", 1000, "tech")
assert (p.name, p.price, p.category) == ("Laptop", 1000, "tech"), "__init__ should store name, price and category"
assert isinstance(Product.__dict__.get("final_price"), property), "final_price should be a @property (no parentheses when reading it)"
assert p.final_price == 1000, "With no discount, final_price should equal price"
p.discount = 10
assert abs(p.final_price - 900) < 1e-9, f"After p.discount = 10, final_price should be 900 (got {p.final_price})"
assert str(p) == "Laptop: $900.00", f"str(p) should be 'Laptop: $900.00', got {str(p)!r}"
try:
    p.discount = 150
except ValueError:
    pass
else:
    raise AssertionError("Setting discount outside 0-100 should raise ValueError")
mouse = Product("Mouse", 50, "tech")
assert Product.compare(mouse, p) < 0 < Product.compare(p, mouse), "compare(p1, p2) should return p1.final_price - p2.final_price"
`,
        checks: (code) => [
          has(code, /class Product\s*[:(]/, "Define: class Product:"),
          has(code, /def __init__\(\s*self\s*,/, "Constructor: def __init__(self, name, price, category):"),
          has(code, /@property/, "Use @property for the final_price getter"),
          has(code, /\.setter/, "Use @discount.setter for the setter"),
          has(code, /def __str__\(\s*self/, "Define: def __str__(self): so print() works"),
          has(code, /@staticmethod|@classmethod/, "compare does not need an instance: make it a @staticmethod"),
          hasNot(code, /\bthis\./, "Python uses 'self', not 'this'"),
          hasNot(code, "constructor", "Python uses '__init__', not 'constructor'"),
          hasNot(code, /\bfinalPrice\b/, "NameError: 'finalPrice' is not defined. Use 'final_price' (snake_case)"),
        ],
      },
    },
    {
      id: "inheritance", title: "Inheritance & ABCs",
      content: "Inheritance in Python reads almost like JS, minus the keyword. Instead of class Dog extends Animal, you write class Dog(Animal): with the parent in parentheses. Methods are overridden simply by defining a method with the same name in the child class.\n\nCalling the parent uses super(), but with one difference. In JS, super(name) inside a constructor calls the parent constructor. In Python, super() gives you a proxy to the parent, and you call the method you want on it: super().__init__(name) for the constructor, super().speak() for any other method. Unlike JS, Python does not force you to call the parent constructor first (or at all), so forgetting super().__init__ silently leaves parent attributes unset.\n\nType checks use isinstance(obj, Animal) instead of obj instanceof Animal. isinstance also accepts a tuple, so isinstance(x, (int, float)) checks several types at once. issubclass(Dog, Animal) does the same check on classes.\n\nJS has no abstract classes (only TypeScript's abstract keyword, which disappears at runtime). Python has real ones in the abc module: inherit from ABC and mark methods with @abstractmethod. Python then refuses to instantiate the class, and any subclass that forgets to implement an abstract method fails with TypeError the moment you try to create it, not later when the method is called.\n\nPython also supports multiple inheritance: class C(A, B):. When A and B both define the same method, Python follows the Method Resolution Order (C, then A, then B, then their parents), which you can inspect with C.__mro__. The common, safe use is mixins: small classes that add one capability (like JsonMixin with a to_json method) and get combined with a main base class. That replaces the Object.assign(Proto.prototype, mixin) trick from JS.",
      keyDiffs: [
        { js: "class Dog extends Animal", py: "class Dog(Animal):", note: "Parent in parentheses" },
        { js: "super(name)", py: "super().__init__(name)", note: "Call __init__ explicitly" },
        { js: "super.speak()", py: "super().speak()", note: "super() with parentheses" },
        { js: "x instanceof Animal", py: "isinstance(x, Animal)", note: "Also accepts a tuple of types" },
        { js: "abstract class (TS only)", py: "class Shape(ABC):", note: "Enforced at runtime" },
        { js: "Object.assign mixins", py: "class C(Mixin, Base):", note: "Multiple inheritance + MRO" },
      ],
      tips: [
        "Forgetting super().__init__(...) in a child __init__ is a silent bug: the parent's attributes are never set. Python does not warn you like JS does.",
        "Use isinstance() rather than type(x) == Cls. isinstance respects inheritance; a type comparison does not.",
        "An ABC with an unimplemented @abstractmethod cannot be instantiated: TypeError: Can't instantiate abstract class.",
        "Check the lookup order of any class with Cls.__mro__. With mixins, list the mixins first and the main base class last.",
        "Prefer composition or small mixins over deep inheritance trees. Python makes inheritance easy, but that does not make it the right tool every time.",
      ],
      jsCode: "// JavaScript\nclass Animal {\n  constructor(name) { this.name = name; }\n  speak() { return `${this.name} makes a sound`; }\n}\n\nclass Dog extends Animal {\n  constructor(name, breed) {\n    super(name);          // must come first\n    this.breed = breed;\n  }\n  speak() { return super.speak() + \" (woof)\"; }\n}\n\nconst d = new Dog(\"Rex\", \"lab\");\nd instanceof Animal;   // true\n\n// No runtime abstract classes in JS\nclass Shape {\n  area() { throw new Error(\"not implemented\"); }\n}",
      pyCode: "# Python\nfrom abc import ABC, abstractmethod\n\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f\"{self.name} makes a sound\"\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)\n        self.breed = breed\n    def speak(self):\n        return super().speak() + \" (woof)\"\n\nd = Dog(\"Rex\", \"lab\")\nisinstance(d, Animal)      # True\nissubclass(Dog, Animal)    # True\n\n# Real abstract base classes\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): ...\n\n# Shape()  -> TypeError: Can't instantiate abstract class\n\n# Mixins via multiple inheritance\nclass JsonMixin:\n    def to_json(self):\n        import json\n        return json.dumps(self.__dict__)\n\nclass Pet(JsonMixin, Animal):\n    pass\n\nPet(\"Tom\").to_json()   # '{\"name\": \"Tom\"}'\nPet.__mro__            # Pet, JsonMixin, Animal, object",
      exercise: {
        question: "Build a small shape hierarchy:",
        prompt: "1. Abstract class Shape (inherits ABC) with:\n   - abstract method area()\n   - normal method describe() returning\n     \"<ClassName> with area <area>\"   e.g. \"Square with area 25\"\n2. Rectangle(Shape): __init__(self, width, height), area() = width * height\n3. Square(Rectangle): __init__(self, side) that reuses Rectangle's\n   __init__ via super()\n4. Shape() itself must not be instantiable",
        answer: "from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self):\n        ...\n\n    def describe(self):\n        return f\"{type(self).__name__} with area {self.area()}\"\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\nclass Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)",
        hint: "Import ABC and abstractmethod from abc. In Square.__init__, call super().__init__(side, side) so Rectangle sets width and height. type(self).__name__ gives you the class name of the actual object.",
        tests: String.raw`
for _name in ("Shape", "Rectangle", "Square"):
    assert isinstance(globals().get(_name), type), f"Define a class called {_name}"
try:
    Shape()
except TypeError:
    pass
else:
    raise AssertionError("Shape() should raise TypeError: inherit from ABC and mark area() with @abstractmethod")
r = Rectangle(3, 4)
assert r.area() == 12, "Rectangle(3, 4).area() should be 12"
s = Square(5)
assert (s.width, s.height) == (5, 5), "Square(5) should set width and height to 5 via super().__init__"
assert s.area() == 25, "Square(5).area() should be 25"
assert isinstance(s, Rectangle) and isinstance(s, Shape), "Square should inherit from Rectangle (and so from Shape)"
assert s.describe() == "Square with area 25", f"describe() should return 'Square with area 25', got {s.describe()!r}"
assert r.describe() == "Rectangle with area 12", f"describe() should use the real class name, got {r.describe()!r}"
`,
        checks: (code) => [
          has(code, /class Shape\s*\(\s*ABC\s*\)/, "Shape should inherit from ABC: class Shape(ABC):"),
          has(code, /@abstractmethod/, "Mark area() with @abstractmethod"),
          has(code, /class Square\s*\(\s*Rectangle\s*\)/, "Square should inherit from Rectangle"),
          has(code, /super\(\)\.__init__\(/, "Reuse the parent constructor with super().__init__(...)"),
          hasNot(code, /\bextends\b/, "Python puts the parent in parentheses: class Square(Rectangle):"),
        ],
      },
    },
    {
      id: "dunder", title: "Dunder Methods",
      content: "Dunder (Double UNDERscore) methods let you hook into Python's built-in operations. Want your class to support the + operator? Define __add__. Want print() to show something useful? Define __str__. Want len() to work? Define __len__. This is operator overloading, and it is one of Python's most powerful features.\n\nJS has a tiny version of this with Symbol.iterator, toString, and valueOf, but Python takes it much further. You can overload every arithmetic operator, every comparison, indexing, iteration, even the () call syntax. A class with __call__ becomes callable like a function.\n\nThe practical result: your custom objects can behave exactly like built-in types. Users of your class do not need to learn special method names; they use +, -, ==, for loops, and print() as they would with any built-in.\n\nTwo rules keep operator methods well behaved. First, if the other operand is a type you do not support, return NotImplemented (do not raise); Python then tries the other operand's method or raises a clean TypeError. Second, defining __eq__ sets __hash__ to None, which makes instances unhashable. If your objects must go in sets or be dict keys, define __hash__ too (or use a frozen dataclass).",
      keyDiffs: [
        { js: "toString()", py: "__str__ / __repr__", note: "__str__ for users, __repr__ for devs" },
        { js: "Cannot overload +", py: "__add__(self, other)", note: "Full operator overloading" },
        { js: "Cannot overload ==", py: "__eq__(self, other)", note: "Comparison operators" },
        { js: "[Symbol.iterator]()", py: "__iter__ / __next__", note: "Iterator protocol" },
        { js: "No equivalent", py: "__len__", note: "Support len()" },
        { js: "Proxy get trap (clunky)", py: "__getitem__", note: "Support obj[key]" },
        { js: "No equivalent", py: "__call__", note: "Make object callable" },
      ],
      tips: [
        "Always define __repr__ even if you skip __str__. It is what you see in the REPL, the debugger, and inside lists.",
        "Defining __eq__ makes your class unhashable by default. If you need objects in sets or as dict keys, also define __hash__.",
        "Return NotImplemented (not raise) from an operator method when the other operand has an unsupported type.",
        "Use @functools.total_ordering to define only __eq__ and one comparison (like __lt__) and get all six comparison operators.",
        "Floats cannot represent most decimal amounts exactly (0.1 + 0.2 != 0.3). For real money, use decimal.Decimal or store integer cents.",
      ],
      jsCode: "// JavaScript - limited overloading\nclass Vector {\n  constructor(x, y) { this.x = x; this.y = y; }\n  add(other) {\n    return new Vector(this.x+other.x, this.y+other.y);\n  }\n  toString() { return \"(\"+this.x+\", \"+this.y+\")\"; }\n}\n// v1 + v2 <- does NOT work in JS!",
      pyCode: "# Python - full operator overloading\nclass Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n    def __add__(self, other):     # +\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return Vector(self.x+other.x, self.y+other.y)\n    def __mul__(self, s):         # *\n        return Vector(self.x*s, self.y*s)\n    def __eq__(self, other):      # ==\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return self.x==other.x and self.y==other.y\n    def __len__(self):            # len()\n        return 2\n    def __iter__(self):           # for loop / unpacking\n        yield self.x\n        yield self.y\n\nv1 = Vector(1, 2)\nv3 = v1 + Vector(3, 4)  # Works! -> (4, 6)\nx, y = v3               # uses __iter__",
      exercise: {
        question: "Write a Money class that supports these operations:",
        prompt: "m1 = Money(100, \"USD\")\nm2 = Money(50, \"USD\")\n\nm1 + m2   -> Money(150, \"USD\")\nm1 - m2   -> Money(50, \"USD\")\nm1 * 3    -> Money(300, \"USD\")\nprint(m1) -> \"100.00 USD\"\nm1 == Money(100, \"USD\")  -> True\nm1 > m2   -> True\nm1 + Money(10, \"EUR\")   -> ValueError!\n\n(Plain numbers are fine here; real apps should use\ndecimal.Decimal or integer cents.)",
        answer: "class Money:\n    def __init__(self, amount, currency):\n        self.amount = amount\n        self.currency = currency\n\n    def _check(self, other):\n        if self.currency != other.currency:\n            raise ValueError(\"Cannot mix currencies\")\n\n    def __add__(self, other):\n        self._check(other)\n        return Money(self.amount + other.amount, self.currency)\n\n    def __sub__(self, other):\n        self._check(other)\n        return Money(self.amount - other.amount, self.currency)\n\n    def __mul__(self, factor):\n        return Money(self.amount * factor, self.currency)\n\n    def __eq__(self, other):\n        if not isinstance(other, Money):\n            return NotImplemented\n        return self.amount == other.amount and self.currency == other.currency\n\n    def __gt__(self, other):\n        self._check(other)\n        return self.amount > other.amount\n\n    def __str__(self):\n        return f\"{self.amount:.2f} {self.currency}\"",
        hint: "Each operator maps to one dunder: + is __add__, - is __sub__, * is __mul__, == is __eq__, > is __gt__, print() uses __str__. A small helper that raises ValueError on mismatched currencies keeps __add__ and __sub__ short.",
        tests: String.raw`
assert isinstance(globals().get("Money"), type), "Define a class called Money"
m1 = Money(100, "USD")
m2 = Money(50, "USD")
assert m1 == Money(100, "USD"), "Money(100, 'USD') == Money(100, 'USD') should be True (define __eq__)"
assert not (m1 == Money(100, "EUR")), "Same amount in a different currency should not be equal"
assert m1 + m2 == Money(150, "USD"), "m1 + m2 should be Money(150, 'USD')"
assert m1 - m2 == Money(50, "USD"), "m1 - m2 should be Money(50, 'USD')"
assert m1 * 3 == Money(300, "USD"), "m1 * 3 should be Money(300, 'USD')"
assert str(m1) == "100.00 USD", f"str(m1) should be '100.00 USD', got {str(m1)!r}"
assert m1 > m2 and not (m2 > m1), "m1 > m2 should be True and m2 > m1 False"
try:
    m1 + Money(10, "EUR")
except ValueError:
    pass
else:
    raise AssertionError("Adding different currencies should raise ValueError")
`,
        checks: (code) => [
          has(code, /class Money\s*[:(]/, "Define 'class Money:'"),
          has(code, /def __add__\(\s*self/, "Define __add__(self, other) for the + operator"),
          has(code, /def __sub__\(\s*self/, "Define __sub__(self, other) for the - operator"),
          has(code, /def __mul__\(\s*self/, "Define __mul__(self, factor) for the * operator"),
          has(code, /def __eq__\(\s*self/, "Define __eq__(self, other) for =="),
          has(code, /def __gt__\(\s*self/, "Define __gt__(self, other) for >"),
          has(code, /def __str__\(\s*self/, "Define __str__(self) for print()"),
        ],
      },
    },
  ],
};

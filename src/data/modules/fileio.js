import { has, hasNot } from "../../lib/validation";

export default {
  id: "fileio", title: "File I/O & Data", icon: "\u{1F4C4}", subtitle: "Files, JSON, regex", tier: 3,
  lessons: [
    {
      id: "files", title: "File Operations",
      content: `File handling in Python is built in and pleasantly synchronous. The 'with' statement (a context manager) opens a file and guarantees it is closed when the block ends, even if an error occurs. No more forgetting to call close().

Pathlib is Python's modern path library. Instead of gluing strings together, you use the / operator: Path("data") / "file.txt". Paths are objects with useful methods and properties: .exists(), .read_text(), .write_text(), .suffix, .stem, .parent, and .glob().

Compared to Node's fs module, there is no callback-vs-promise-vs-sync decision to make. Reading a file is two lines: open it with 'with', then call .read(), or iterate over the file object to process it line by line.

Encoding needs your attention. open() does NOT default to UTF-8 everywhere: it uses the operating system's preferred encoding, which is UTF-8 on macOS and Linux but often cp1252 on Windows. Python 3.15 switches the default to UTF-8 on every platform (PEP 686), but until your code only runs on 3.15+, always pass encoding="utf-8" when you open text files. This prevents the classic "works on my Mac, crashes on Windows" UnicodeDecodeError.

Build paths with pathlib, not string concatenation. Python on Windows actually accepts forward slashes, so 'data' + '/' + 'file.txt' usually works, but string joining makes it easy to end up with doubled or missing separators, and you lose all the Path methods. Path("data") / "file.txt" (or os.path.join) is correct on every operating system.`,
      keyDiffs: [
        { js: "fs.readFileSync('f', 'utf8')", py: "Path('f').read_text(encoding='utf-8')", note: "Pass the encoding explicitly" },
        { js: "fs.writeFileSync('f', data)", py: "Path('f').write_text(data, encoding='utf-8')", note: "Or open('f', 'w')" },
        { js: "fs.appendFileSync('f', data)", py: "open('f', 'a')", note: "Mode 'a' appends" },
        { js: "path.join(a, b)", py: "Path(a) / b", note: "/ operator on Path" },
        { js: "path.extname('f.txt')", py: "Path('f.txt').suffix", note: ".suffix property" },
        { js: "fs.existsSync('f')", py: "Path('f').exists()", note: "Path method" },
        { js: "fs.globSync('*.py') (Node 22+)", py: "Path('.').glob('*.py')", note: "Built into pathlib" },
      ],
      tips: [
        "Always use 'with open(...)' instead of a bare open(). It closes the file for you, even on errors.",
        "For large files, iterate line by line (for line in f:) instead of f.read(), which loads everything into memory.",
        "Always pass encoding='utf-8' for text files. The default depends on the OS until Python 3.15.",
        "Path objects work anywhere a string path is expected: open(), shutil, json, and so on.",
        "Path.mkdir(parents=True, exist_ok=True) is the equivalent of fs.mkdirSync(dir, { recursive: true }).",
      ],
      jsCode: "// Node.js\nconst fs = require('fs');\nconst path = require('path');\n\nconst data = fs.readFileSync('file.txt', 'utf8');\nfs.writeFileSync('out.txt', 'hello');\nfs.existsSync('file.txt');\n\npath.join(__dirname, 'data', 'file.txt');\npath.extname('file.txt');",
      pyCode: `# Python
# Read the whole file
with open("file.txt", encoding="utf-8") as f:
    data = f.read()

# Or iterate lines (memory efficient)
with open("file.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

# Write ("w" overwrites, "a" appends)
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("hello")

# pathlib (modern paths)
from pathlib import Path
p = Path("data") / "subdir" / "file.txt"
p.exists()
p.suffix          # '.txt'
p.stem            # 'file'
p.parent          # Path('data/subdir')
p.read_text(encoding="utf-8")       # read shortcut
p.write_text("hi", encoding="utf-8")  # write shortcut

for f in Path(".").glob("*.py"):
    print(f)`,
      exercise: {
        question: "Write Python code that:",
        prompt: "A file named config.txt already exists in the current directory.\n\n1. Use pathlib to create log_path = Path for \"logs/app.log\" (use the / operator)\n2. Read \"config.txt\" with 'with open' (encoding=\"utf-8\") and print each line stripped\n3. Write \"completed\" to \"status.txt\"\n4. Print every .txt file in the current directory using glob",
        hint: "Build the path with Path(\"logs\") / \"app.log\". Open files inside a with block, loop over the file object, and call line.strip() before printing.",
        setup: `from pathlib import Path as _P
_P("config.txt").write_text("host = localhost\\nport = 8080\\n  debug = true  \\n", encoding="utf-8")`,
        answer: `from pathlib import Path

log_path = Path("logs") / "app.log"

with open("config.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

with open("status.txt", "w", encoding="utf-8") as f:
    f.write("completed")

for p in Path(".").glob("*.txt"):
    print(p)`,
        tests: `from pathlib import Path as _P
assert "log_path" in globals(), "Define a variable named log_path"
assert isinstance(log_path, _P), "log_path should be a Path object, not a string"
assert log_path == _P("logs") / "app.log", "log_path should point to logs/app.log"
_lines = [l.strip() for l in __output__.splitlines()]
for _expected in ("host = localhost", "port = 8080", "debug = true"):
    assert _expected in _lines, f"Print each line of config.txt stripped. Missing: {_expected!r}"
assert _P("status.txt").exists(), "status.txt was not created"
assert _P("status.txt").read_text(encoding="utf-8") == "completed", "status.txt should contain exactly 'completed'"
assert "status.txt" in __output__ and "config.txt" in __output__, "Print the .txt files found with glob"`,
        checks: (code) => [
          has(code, /from pathlib import|import pathlib/, "Import Path: from pathlib import Path"),
          has(code, /Path\(/, "Use Path() for path objects"),
          has(code, /\//, "Join paths with the / operator: Path(\"logs\") / \"app.log\""),
          has(code, /with\s+open\(/, "Use 'with open(...)' for safe file handling"),
          has(code, ".strip()", "Use .strip() to remove whitespace on each line"),
          has(code, /open\([^)]*["']w["']/, "Use mode 'w' for writing: open(\"status.txt\", \"w\")"),
          has(code, ".glob(", "Use .glob() to find files by pattern"),
          () => (/encoding\s*=/.test(code) ? null : { type: "warning", msg: "Tip: pass encoding=\"utf-8\" to open(). The default depends on the OS." }),
          hasNot(code, "require(", "Python uses 'import', not 'require()'"),
        ],
      },
    },
    {
      id: "json-regex", title: "JSON & Regex",
      content: `JSON and regular expressions are built into JavaScript as globals. In Python they are just as built in, but they live in standard library modules you import: json and re. (CSV is the one where JS usually needs an npm package; Python ships a csv module.)

The json module maps directly: JSON.parse() becomes json.loads() and JSON.stringify() becomes json.dumps(). The 's' at the end stands for 'string'. For files there is a matching pair: json.load(file) reads from a file object and json.dump(obj, file) writes to one, with no intermediate string step.

JSON types map naturally: objects become dicts, arrays become lists, null becomes None, true/false become True/False. One difference: json.dumps() raises a TypeError for values it does not know, such as datetime, Decimal, or your own classes, where JSON.stringify would silently produce {} or call toJSON().

Python's regex module (re) uses a function-based API instead of regex literals. re.search() finds the first match anywhere, re.findall() returns all matches, re.sub() replaces (all matches by default), and re.fullmatch() checks the whole string. The trap: re.match() only matches at the START of the string, which confuses JS developers who expect it to search everywhere like str.match().`,
      keyDiffs: [
        { js: "JSON.parse(str)", py: "json.loads(str)", note: "'s' = from string" },
        { js: "JSON.stringify(obj, null, 2)", py: "json.dumps(obj, indent=2)", note: "'s' = to string" },
        { js: "fs + JSON.parse", py: "json.load(f) / json.dump(obj, f)", note: "Read/write file objects" },
        { js: "str.match(/p/g)", py: "re.findall(r\"p\", s)", note: "All matches as a list" },
        { js: "str.match(/p/)", py: "re.search(r\"p\", s)", note: "search = anywhere" },
        { js: "str.replace(/p/g, r)", py: "re.sub(r\"p\", r, s)", note: "Replaces all by default" },
        { js: "/p/.test(str)", py: "bool(re.search(r\"p\", s))", note: "No .test() method" },
      ],
      tips: [
        "loads/dumps work on strings. load/dump work on files. The 's' tells you which.",
        "re.match() only checks the START of the string. Use re.search() to find a match anywhere, or re.fullmatch() for the whole string.",
        "Always use raw strings for regex: r\"\\d+\". The r prefix stops Python from interpreting the backslashes first.",
        "json.dumps() raises TypeError on datetime, Decimal, or custom objects. Convert them first or pass default=str.",
        "csv.DictReader yields a regular dict per row, keyed by the column headers.",
      ],
      jsCode: "// JavaScript\nconst obj = JSON.parse(jsonString);\nconst str = JSON.stringify(obj, null, 2);\n\nconst match = text.match(/\\d+/);\nconst all = text.match(/\\d+/g);\nconst replaced = text.replace(/old/g, \"new\");\n/^test/.test(text);",
      pyCode: `# Python JSON (standard library)
import json
obj = json.loads(json_string)       # parse
text = json.dumps(obj, indent=2)    # stringify

with open("data.json", encoding="utf-8") as f:
    data = json.load(f)              # read file
with open("out.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)     # write file

# Regex (standard library)
import re
match = re.search(r"\\d+", text)     # first match
if match:
    print(match.group())
all_nums = re.findall(r"\\d+", text) # all matches
replaced = re.sub(r"old", "new", text)
valid = bool(re.match(r"test", s))  # only at the start!`,
      exercise: {
        question: "Write Python code that:",
        prompt: "1. Parse this string into data: '{\"users\": [{\"name\": \"Alice\", \"age\": 30}]}'\n2. Store the first user's name in first_name\n3. Convert data back to formatted JSON (indent=2) in formatted\n4. Find all emails in text = \"Contact alice@dev.com or bob@test.org\" and store them in emails\n5. Store text with every email replaced by \"[REDACTED]\" in redacted",
        hint: "json.loads() gives you a dict, so use data[\"users\"][0][\"name\"]. For the emails, a raw-string pattern like r\"[\\w.]+@[\\w.]+\" works with both re.findall() and re.sub().",
        answer: `import json
import re

data = json.loads('{"users": [{"name": "Alice", "age": 30}]}')
first_name = data["users"][0]["name"]
formatted = json.dumps(data, indent=2)

text = "Contact alice@dev.com or bob@test.org"
emails = re.findall(r"[\\w.]+@[\\w.]+", text)
redacted = re.sub(r"[\\w.]+@[\\w.]+", "[REDACTED]", text)`,
        tests: `import json as _json
for _name in ("data", "first_name", "formatted", "emails", "redacted"):
    assert _name in globals(), f"Define a variable named {_name}"
assert data == {"users": [{"name": "Alice", "age": 30}]}, "data should be the parsed dict"
assert first_name == "Alice", "first_name should be 'Alice'"
assert isinstance(formatted, str) and _json.loads(formatted) == data, "formatted should be a JSON string of data"
assert "\\n  " in formatted, "Use indent=2 so the JSON is formatted"
assert list(emails) == ["alice@dev.com", "bob@test.org"], f"emails should be ['alice@dev.com', 'bob@test.org'], got {emails!r}"
assert redacted == "Contact [REDACTED] or [REDACTED]", f"Got {redacted!r}"`,
        checks: (code) => [
          has(code, /import json/, "Need: import json"),
          has(code, /import re\b/, "Need: import re"),
          has(code, "json.loads(", "Use json.loads() to parse the JSON string"),
          has(code, "json.dumps(", "Use json.dumps() for formatted output"),
          has(code, /indent\s*=\s*2/, "Use indent=2 in json.dumps()"),
          has(code, /re\.findall\(/, "Use re.findall() to find all emails"),
          has(code, /re\.sub\(/, "Use re.sub() to replace matches"),
          hasNot(code, "JSON.parse", "NameError: use json.loads(), not JSON.parse()"),
          hasNot(code, "JSON.stringify", "NameError: use json.dumps(), not JSON.stringify()"),
        ],
      },
    },
  ],
};

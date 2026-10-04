// Tiny syntax highlighter for the course's Python and JavaScript snippets.
// It is deliberately simple (no parser): good enough for teaching examples,
// zero dependencies, and the token colours come from theme CSS variables.
// Output is split per line so the code editor overlay can reuse it.

const words = (s) => new Set(s.split(" "));

const LANGS = {
  py: {
    keywords: words(
      "False None True and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try type while with yield",
    ),
    builtins: words(
      "print len range list dict set frozenset tuple int str float bool bytes type isinstance issubclass enumerate zip map filter sorted reversed sum min max any all open super property staticmethod classmethod object iter next abs round repr hash id input getattr setattr hasattr callable vars dir self cls Exception BaseException ValueError TypeError KeyError IndexError ZeroDivisionError RuntimeError NameError AttributeError StopIteration NotImplemented NotImplementedError",
    ),
    defs: words("def class"),
    pattern:
      /(#[^\n]*)|((?:\b[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|((?:^|(?<=\s))@[A-Za-z_][\w.]*)|(\b0[xob][\da-fA-F_]+\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?j?\b)|([A-Za-z_]\w*)|(\s+)|([^\w\s])/gy,
  },
  js: {
    keywords: words(
      "const let var function return if else for while do switch case default break continue new class extends super this import export from as async await try catch finally throw typeof instanceof in of null undefined true false yield static get set delete void",
    ),
    builtins: words(
      "console Math JSON Object Array Promise Set Map Number String Boolean Error SyntaxError Symbol Iterator document window fetch setTimeout require module process globalThis structuredClone crypto",
    ),
    defs: words("function class"),
    pattern:
      /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)|((?:^|(?<=\s))@[A-Za-z_][\w.]*)|(\b0[xob][\da-fA-F_]+n?\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\w\s])/gy,
  },
};

const GROUP_TYPES = ["com", "str", "dec", "num", "id", "ws", "punct"];

export function tokenize(code, lang = "py") {
  const spec = LANGS[lang];
  if (!spec) return [{ type: "plain", text: code }];
  const re = new RegExp(spec.pattern.source, "gy");
  const tokens = [];
  let prevWord = null;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < code.length && (m = re.exec(code))) {
    const idx = m.slice(1).findIndex((g) => g !== undefined);
    let type = GROUP_TYPES[idx] ?? "plain";
    const text = m[0];
    if (type === "id") {
      const after = code.slice(re.lastIndex).match(/^\s*(.)/)?.[1];
      if (spec.keywords.has(text)) type = "kw";
      else if (prevWord && spec.defs.has(prevWord)) type = prevWord === "class" ? "cls" : "fn";
      else if (spec.builtins.has(text)) type = "builtin";
      else if (after === "(") type = "fn";
      else if (/^[A-Z]/.test(text) && !/^[A-Z0-9_]+$/.test(text)) type = "cls";
      else type = "plain";
      prevWord = text;
    } else if (type !== "ws") {
      prevWord = null;
    }
    if (type === "ws") type = "plain";
    const last = tokens[tokens.length - 1];
    if (last && last.type === type && type === "plain") last.text += text;
    else tokens.push({ type, text });
  }
  return tokens;
}

// Splits tokens into lines (multi-line strings/comments are split too).
export function highlightLines(code, lang = "py") {
  const lines = [[]];
  for (const tok of tokenize(code, lang)) {
    const parts = tok.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: tok.type, text: part });
    });
  }
  return lines;
}

// Best guess for exercise prompts, which may be JS, Python or plain text.
export function guessLang(code) {
  if (/^\s*\/\/|\b(const|let|function)\s|=>|console\.log/.test(code)) return "js";
  if (/^\s*(#|def |class |import |from |@|\w+\s*=)/m.test(code)) return "py";
  return null;
}

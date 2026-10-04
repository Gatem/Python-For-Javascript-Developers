// Static checks run before the code is executed. They catch JS habits
// (console.log, ===, null...) and enforce the technique a lesson teaches.
// Comments are ignored so a solution cannot "pass" by mentioning the answer
// in a comment, and JS-habit checks also ignore string contents.

export function stripPython(code, { strings = false } = {}) {
  let out = "";
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "#") {
      while (i < code.length && code[i] !== "\n") i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const triple = code.startsWith(ch.repeat(3), i);
      const quote = triple ? ch.repeat(3) : ch;
      let j = i + quote.length;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code.startsWith(quote, j)) break;
        if (!triple && code[j] === "\n") break;
        j++;
      }
      const body = code.slice(i + quote.length, j);
      const close = code.startsWith(quote, j) ? quote : "";
      out += quote + (strings ? body.replace(/[^\n]/g, " ") : body) + close;
      i = j + close.length;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function validateCode(userCode, checks, { checkComments = false } = {}) {
  const t = userCode.trim();
  if (!t)
    return {
      pass: false,
      errors: [{ type: "error", msg: "SyntaxError: empty submission" }],
      warnings: [],
    };
  const errors = [];
  const warnings = [];
  const collect = (r) => {
    if (r) (r.type === "warning" ? warnings : errors).push(r);
  };
  commonChecks(stripPython(t, { strings: true })).forEach(collect);
  const visible = checkComments ? t : stripPython(t);
  if (checks) checks(visible).forEach((c) => collect(c(visible)));
  return { pass: errors.length === 0, errors, warnings };
}

const toRegex = (p) =>
  typeof p === "string"
    ? new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    : p;

export const has = (code, p, msg) => () =>
  toRegex(p).test(code) ? null : { type: "error", msg };

export const hasNot = (code, p, msg, t = "error") => () =>
  toRegex(p).test(code) ? { type: t, msg } : null;

const KEYWORDS =
  "and|or|not|is|in|if|elif|else|for|while|def|class|return|import|from|try|except|finally|with|as|yield|lambda|pass|break|continue|raise|del|global|nonlocal|assert|async|await|True|False|None";
const BUILTINS =
  "print|len|range|list|dict|set|tuple|int|str|float|bool|type|input|open|map|filter|sum|min|max|any|all|sorted|reversed|enumerate|zip|super|property|staticmethod|classmethod|object|id|hash|abs|round|format|repr|iter|next";

// [pattern, type, message]. `code` has comments and string contents removed.
const COMMON_RULES = [
  [/^\d\w*\s*=/m, "error", "SyntaxError: variable name cannot start with a number"],
  [new RegExp(`^\\s*(${KEYWORDS})\\s*=[^=]`, "m"), "error", "SyntaxError: cannot use a Python keyword as a variable name"],
  [new RegExp(`^\\s*(${BUILTINS})\\s*=[^=]`, "m"), "warning", "ShadowWarning: this name shadows a Python built-in, which stops working in this scope"],
  [/==\s*None|None\s*==/, "warning", "PEP 8: use 'is None' instead of '== None'"],
  [/!=\s*None|None\s*!=/, "warning", "PEP 8: use 'is not None' instead of '!= None'"],
  [/;\s*$/m, "warning", "Style: semicolons are not needed in Python"],
  [/\bvar\s+\w/, "error", "SyntaxError: 'var' is not a Python keyword. Just assign directly"],
  [/\blet\s+\w/, "error", "SyntaxError: 'let' is not a Python keyword. Just assign directly"],
  [/\bconst\s+\w/, "error", "SyntaxError: 'const' is not a Python keyword. Just assign directly"],
  [/\bfunction\s*\*?\s*\w/, "error", "SyntaxError: use 'def' to define functions, not 'function'"],
  [/\bconsole\.log\b/, "error", "NameError: name 'console' is not defined. Use print()"],
  [/\bthis\./, "error", "NameError: Python uses 'self', not 'this'"],
  [/===|!==/, "error", "SyntaxError: Python uses == and !=, not === and !=="],
  [/\)\s*\{\s*$/m, "error", "SyntaxError: Python uses : and indentation, not curly braces { }"],
  [/\bnull\b/, "error", "NameError: name 'null' is not defined. Did you mean 'None'?"],
  [/\bundefined\b/, "error", "NameError: name 'undefined' is not defined. Python uses None"],
  [/\btrue\b/, "error", "NameError: name 'true' is not defined. Did you mean 'True'?"],
  [/\bfalse\b/, "error", "NameError: name 'false' is not defined. Did you mean 'False'?"],
  [/&&/, "error", "SyntaxError: use 'and' instead of '&&'"],
  [/\|\|/, "error", "SyntaxError: use 'or' instead of '||'"],
  [/(?<![>=<!])=>/, "error", "SyntaxError: Python has no arrow functions. Use 'def' or 'lambda'"],
  [/\belse\s+if\b/, "error", "SyntaxError: use 'elif', not 'else if'"],
  [/\.push\(/, "error", "AttributeError: 'list' object has no attribute 'push'. Use .append()"],
  [/\.length\b/, "error", "AttributeError: use len(obj) instead of obj.length"],
  [/\bthrow\s/, "error", "SyntaxError: Python uses 'raise', not 'throw'"],
  [/\bcatch\s*[(:]/, "error", "SyntaxError: Python uses 'except', not 'catch'"],
  [/\bnew\s+[A-Z]/, "error", "SyntaxError: Python does not use 'new'. Just call the class directly"],
  [/\t/, "warning", "Style: indent with 4 spaces, not tabs. Mixing them raises TabError."],
];

function commonChecks(code) {
  return COMMON_RULES.filter(([re]) => re.test(code)).map(([, type, msg]) => ({
    type,
    msg,
  }));
}

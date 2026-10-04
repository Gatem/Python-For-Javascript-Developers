import { useState, useRef, useCallback, useId } from "react";

function findInlineComment(line) {
  let inStr = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && inStr) {
      i++;
      continue;
    }
    if ((ch === '"' || ch === "'") && !inStr) {
      inStr = ch;
    } else if (ch === inStr) {
      inStr = null;
    } else if (ch === "#" && !inStr) {
      return i;
    }
  }
  return -1;
}

const AUTO_PAIRS = { "(": ")", "[": "]", "{": "}", "'": "'", '"': '"' };
const BRACKET_CLOSERS = new Set([")", "]", "}"]);

export default function CodeEditor({ value, onChange, placeholder, onRun, onCheck }) {
  const helpId = useId();
  const taRef = useRef(null);
  // After Escape, the next Tab moves focus out instead of indenting,
  // so keyboard users are never trapped in the editor.
  const releaseTabRef = useRef(false);
  const highlightRef = useRef(null);
  const lineCopyRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const lines = (value || "").split("\n");
  const lineCount = Math.max(lines.length, 6);

  const syncScroll = useCallback(() => {
    if (taRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = taRef.current.scrollTop;
      highlightRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  }, []);

  const lr = (pos) => {
    const s = value.lastIndexOf("\n", pos - 1) + 1;
    const eIdx = value.indexOf("\n", pos);
    return { s, e: eIdx === -1 ? value.length : eIdx };
  };

  const exec = (ta, start, end, text) => {
    ta.focus();
    ta.setSelectionRange(start, end);
    if (text === "" || text === undefined) {
      document.execCommand("delete", false);
    } else {
      document.execCommand("insertText", false, text);
    }
  };

  const setCursor = (ta, pos) =>
    requestAnimationFrame(() => ta.setSelectionRange(pos, pos));

  const setSelection = (ta, from, to) =>
    requestAnimationFrame(() => ta.setSelectionRange(from, to));

  const handleKey = (e) => {
    const ta = taRef.current;
    if (!ta) return;

    if (e.key === "Escape") {
      releaseTabRef.current = true;
      return;
    }
    if (e.key === "Tab" && releaseTabRef.current) {
      releaseTabRef.current = false;
      return;
    }
    releaseTabRef.current = false;

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) onCheck?.();
      else onRun?.();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const noSel = start === end;

      if (e.key === "/") {
        e.preventDefault();
        const { s: lS } = lr(start);
        const eIdx = value.indexOf("\n", end);
        const lE = eIdx === -1 ? value.length : eIdx;
        const block = value.substring(lS, lE);
        const bL = block.split("\n");
        const allC = bL.every(
          (l) => l.trimStart().startsWith("# ") || !l.trim()
        );
        const tog = bL
          .map((l) =>
            !l.trim()
              ? l
              : allC
                ? l.replace(/^(\s*)# /, "$1")
                : l.replace(/^(\s*)/, "$1# ")
          )
          .join("\n");
        exec(ta, lS, lE, tog);
        return;
      }

      if (e.key === "c" && noSel) {
        e.preventDefault();
        const { s, e: le } = lr(start);
        navigator.clipboard
          .writeText(value.substring(s, le) + "\n")
          .catch(() => {});
        lineCopyRef.current = true;
        return;
      }

      if (e.key === "x" && noSel) {
        e.preventDefault();
        const { s, e: le } = lr(start);
        const hasNl = le < value.length;
        navigator.clipboard
          .writeText(value.substring(s, le) + "\n")
          .catch(() => {});
        exec(ta, s, le + (hasNl ? 1 : 0), "");
        lineCopyRef.current = true;
        return;
      }

      if (e.key === "v") {
        if (!noSel) lineCopyRef.current = false;
        return;
      }

      if (e.key === "d") {
        e.preventDefault();
        const { s, e: le } = lr(start);
        const line = value.substring(s, le);
        exec(ta, le, le, "\n" + line);
        return;
      }

      if (e.key === "c" || e.key === "x") lineCopyRef.current = false;
      return;
    }

    if (e.key.length === 1) lineCopyRef.current = false;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const hasSel = start !== end;
    const charAfter = value[start] || "";
    const charBefore = value[start - 1] || "";

    // Skip over closing bracket
    if (!hasSel && BRACKET_CLOSERS.has(e.key) && charAfter === e.key) {
      e.preventDefault();
      ta.setSelectionRange(start + 1, start + 1);
      return;
    }

    // Auto-close pairs
    if (e.key in AUTO_PAIRS) {
      const closer = AUTO_PAIRS[e.key];
      const isQuote = e.key === "'" || e.key === '"';

      // Quote: skip over if next char is the same quote
      if (isQuote && !hasSel && charAfter === e.key) {
        e.preventDefault();
        ta.setSelectionRange(start + 1, start + 1);
        return;
      }

      // Quote: don't auto-close after word chars (e.g. don't, it's)
      if (isQuote && !hasSel && /\w/.test(charBefore)) return;

      e.preventDefault();
      if (hasSel) {
        const sel = value.substring(start, end);
        exec(ta, start, end, e.key + sel + closer);
        setSelection(ta, start + 1, end + 1);
      } else {
        exec(ta, start, end, e.key + closer);
        setCursor(ta, start + 1);
      }
      return;
    }

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      exec(ta, start, end, "    ");
    }

    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      const { s: lS } = lr(start);
      const sp = value.substring(lS, start).match(/^ {1,4}/);
      if (sp) exec(ta, lS, lS + sp[0].length, "");
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const { s: lS } = lr(start);
      const cur = value.substring(lS, start);
      const indent = cur.match(/^(\s*)/)[1];
      const extra = cur.trimEnd().endsWith(":") ? "    " : "";
      exec(ta, start, end, "\n" + indent + extra);
    }

    if (e.key === "Backspace" && start === end) {
      // Delete empty pair: () [] {} '' ""
      if (charBefore in AUTO_PAIRS && AUTO_PAIRS[charBefore] === charAfter) {
        e.preventDefault();
        exec(ta, start - 1, start + 1, "");
        return;
      }

      const { s: lS } = lr(start);
      const before = value.substring(lS, start);
      if (before.length > 0 && !before.trim()) {
        const rm = ((before.length - 1) % 4) + 1;
        if (rm > 1) {
          e.preventDefault();
          exec(ta, start - rm, start, "");
        }
      }
    }
  };

  const copyCode = () => {
    if (value) {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {});
    }
  };

  const handlePaste = (e) => {
    if (lineCopyRef.current) {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      if (!text) return;
      const clean = text.endsWith("\n") ? text : text + "\n";
      const ta = taRef.current;
      if (!ta) return;
      const { s } = lr(ta.selectionStart);
      exec(ta, s, s, clean);
      lineCopyRef.current = false;
    }
  };

  const clearCode = () => {
    onChange("");
    if (taRef.current) taRef.current.focus();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={`${helpId}-editor`} className="text-[12px] text-txt-muted">
          Your solution:
        </label>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={copyCode}
            className={`bg-white/5 border border-white/10 rounded-[5px] text-[11px] px-2.5 py-[3px] cursor-pointer font-sans ${copied ? "text-term-success" : "text-txt-muted"}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={clearCode}
            className="bg-white/5 border border-white/10 rounded-[5px] text-txt-muted text-[11px] px-2.5 py-[3px] cursor-pointer font-sans"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex rounded-lg overflow-hidden border border-white/10 bg-black/30 focus-within:border-brand-blue/60 focus-within:ring-2 focus-within:ring-brand-blue/30">
        <div aria-hidden="true" className="py-3 min-w-[40px] text-right select-none border-r border-white/[0.06] bg-black/15 font-mono text-[14px] leading-[1.7] text-txt-dimmer shrink-0">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="pr-2 h-[23.8px] flex items-center justify-end"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative flex-1 min-h-[130px]">
          <pre
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 font-mono text-[14px] leading-[1.7] p-3 m-0 whitespace-pre overflow-hidden pointer-events-none"
            style={{ tabSize: 4, overflowWrap: "normal" }}
          >
            {lines.map((line, i) => {
              if (!line) return <div key={i}>{" "}</div>;
              const trimmed = line.trimStart();
              if (trimmed.startsWith("#")) {
                return (
                  <div key={i} className="text-brand-green-light/50 italic">
                    {line}
                  </div>
                );
              }
              const commentIdx = findInlineComment(line);
              if (commentIdx === -1) {
                return (
                  <div key={i} className="text-txt-primary">{line}</div>
                );
              }
              return (
                <div key={i}>
                  <span className="text-txt-primary">
                    {line.slice(0, commentIdx)}
                  </span>
                  <span className="text-brand-green-light/50 italic">
                    {line.slice(commentIdx)}
                  </span>
                </div>
              );
            })}
          </pre>
          <textarea
            id={`${helpId}-editor`}
            aria-describedby={helpId}
            autoCapitalize="off"
            autoCorrect="off"
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            onScroll={syncScroll}
            placeholder={placeholder}
            spellCheck={false}
            className="code-editor-textarea relative w-full h-full min-h-[130px] font-mono text-[14px] leading-[1.7] bg-transparent border-none text-transparent caret-txt-primary p-3 resize-y text-left box-border outline-none whitespace-pre overflow-auto z-10"
            style={{ tabSize: 4, overflowWrap: "normal" }}
          />
        </div>
      </div>
      <div id={helpId} className="text-[12px] text-txt-dimmer mt-1 text-right">
        Ctrl+Enter run {"·"} Ctrl+Shift+Enter check {"·"} Tab indent {"·"} Esc
        then Tab to leave the editor {"·"} Ctrl+/ comment {"·"} Ctrl+D duplicate
      </div>
    </div>
  );
}

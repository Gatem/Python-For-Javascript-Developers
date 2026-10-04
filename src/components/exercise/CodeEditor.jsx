import { useState, useRef, useCallback, useId } from "react";
import { Check, Copy, Eraser } from "lucide-react";
import { HighlightedLines } from "../ui/Code";


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

  // execCommand updates the textarea synchronously, so the caret can be
  // placed right away (deferring it races with fast typing).
  const setCursor = (ta, pos) => ta.setSelectionRange(pos, pos);

  const setSelection = (ta, from, to) => ta.setSelectionRange(from, to);

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

  const kbd = "rounded border border-fg/12 bg-surface px-1 py-px font-mono text-[11px] text-text-2";
  const toolBtn =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:text-text hover:bg-fg/8 cursor-pointer transition-colors";

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-fg/12 bg-code transition-shadow focus-within:border-info/50 focus-within:ring-4 focus-within:ring-info/15">
        <div className="flex items-center justify-between border-b border-fg/8 bg-surface-2/60 pl-1.5 pr-2">
          <label
            htmlFor={`${helpId}-editor`}
            className="-mb-px flex items-center gap-2 border-b-2 border-accent px-2.5 py-2 font-mono text-[12.5px] text-text"
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-py" />
            solution.py
          </label>
          <div className="flex items-center gap-0.5">
            <button type="button" onClick={copyCode} className={toolBtn} aria-label={copied ? "Copied" : "Copy your code"}>
              {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
              <span className="max-sm:sr-only">{copied ? "Copied" : "Copy"}</span>
            </button>
            <button type="button" onClick={clearCode} className={toolBtn} aria-label="Clear the editor">
              <Eraser size={13} aria-hidden="true" />
              <span className="max-sm:sr-only">Clear</span>
            </button>
          </div>
        </div>
        <div className="flex">
          <div
            aria-hidden="true"
            className="shrink-0 select-none border-r border-fg/6 py-3 pl-3 pr-2.5 text-right font-mono text-[13.5px] leading-[1.7] text-muted/70"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="relative min-h-[170px] flex-1">
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre p-3 font-mono text-[13.5px] leading-[1.7] text-text"
              style={{ tabSize: 4, overflowWrap: "normal" }}
            >
              <HighlightedLines code={value || ""} lang="py" />
              {"\n"}
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
              className="code-editor-textarea relative z-10 box-border block h-full min-h-[170px] w-full resize-y overflow-auto whitespace-pre border-none bg-transparent p-3 text-left font-mono text-[13.5px] leading-[1.7] text-transparent caret-text outline-none"
              style={{ tabSize: 4, overflowWrap: "normal" }}
            />
          </div>
        </div>
      </div>
      <p id={helpId} className="m-0 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
        <span><kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Enter</kbd> run</span>
        <span><kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Shift</kbd> + <kbd className={kbd}>Enter</kbd> check</span>
        <span><kbd className={kbd}>Tab</kbd> indent</span>
        <span><kbd className={kbd}>Esc</kbd> then <kbd className={kbd}>Tab</kbd> to leave the editor</span>
        <span className="max-md:hidden"><kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>/</kbd> comment</span>
      </p>
    </div>
  );
}

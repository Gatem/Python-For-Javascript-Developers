import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlightLines } from "../../lib/highlight";

export function HighlightedLines({ code, lang }) {
  const lines = lang ? highlightLines(code, lang) : code.split("\n").map((l) => (l ? [{ type: "plain", text: l }] : []));
  return lines.map((tokens, i) => (
    <span key={i} className="block min-h-[1lh]">
      {tokens.map((t, j) =>
        t.type === "plain" ? t.text : <span key={j} className={`tok-${t.type}`}>{t.text}</span>,
      )}
      {i < lines.length - 1 ? "\n" : ""}
    </span>
  ));
}

export function CopyButton({ text, label = "Copy code" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          })
          .catch(() => {})
      }
      aria-label={copied ? "Copied" : label}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-muted hover:text-text hover:bg-fg/8 cursor-pointer transition-colors"
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span className="sr-only sm:not-sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

// A code card with a header (language label + copy) and highlighted body.
export default function Code({ code, lang = "py", title, accent, className = "" }) {
  const label = title ?? (lang === "js" ? "JavaScript" : lang === "py" ? "Python" : "Text");
  const dot = accent ?? (lang === "js" ? "bg-js" : "bg-py");
  return (
    <figure className={`m-0 min-w-0 rounded-2xl border border-fg/10 bg-code overflow-hidden ${className}`}>
      <figcaption className="flex items-center justify-between gap-2 border-b border-fg/8 px-3.5 py-2">
        <span className="flex items-center gap-2 text-[12.5px] font-medium text-text-2">
          <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
          {label}
        </span>
        <CopyButton text={code} />
      </figcaption>
      <pre
        aria-label={`${label} code`}
        // Focusable so keyboard users can scroll wide code horizontally.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="m-0 overflow-x-auto scroll-thin px-4 py-3.5 font-mono text-[13.5px] leading-[1.7] text-text"
      >
        <code>
          <HighlightedLines code={code} lang={lang} />
        </code>
      </pre>
    </figure>
  );
}

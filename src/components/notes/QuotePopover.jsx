import { useState, useEffect, useCallback } from "react";

export default function QuotePopover({ onQuote }) {
  const [pos, setPos] = useState(null);
  const [selectedText, setSelectedText] = useState("");

  const handleSelectionEnd = useCallback((e) => {
    if (e?.target?.closest?.("[data-quote-popover]")) return;
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPos(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 3) {
        setPos(null);
        return;
      }

      const contentEl = document.querySelector("[data-lesson-content]");
      if (!contentEl) {
        setPos(null);
        return;
      }

      if (
        !contentEl.contains(selection.anchorNode) ||
        !contentEl.contains(selection.focusNode)
      ) {
        setPos(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
      setSelectedText(text);
    }, 10);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest("[data-quote-popover]")) return;
    setPos(null);
  }, []);

  useEffect(() => {
    // mouseup for mouse, keyup for Shift+arrow selection, touchend for touch.
    const events = ["mouseup", "keyup", "touchend"];
    events.forEach((ev) => document.addEventListener(ev, handleSelectionEnd));
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, handleSelectionEnd));
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleSelectionEnd, handleMouseDown]);

  if (!pos) return null;

  return (
    <div
      data-quote-popover
      className="fixed z-50"
      style={{
        left: pos.x,
        top: pos.y - 8,
        transform: "translate(-50%, -100%)",
      }}
    >
      <button
        type="button"
        onClick={() => {
          onQuote(selectedText);
          window.getSelection()?.removeAllRanges();
          setPos(null);
        }}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold cursor-pointer border-none shadow-lg hover:bg-brand-blue-light transition-colors"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
        Quote
      </button>
      <div aria-hidden="true" className="w-2.5 h-2.5 bg-brand-blue rotate-45 mx-auto -mt-1.5" />
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Quote } from "lucide-react";

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
        className="flex items-center gap-1.5 rounded-xl bg-text px-3.5 py-2 text-[12.5px] font-semibold text-bg shadow-card cursor-pointer hover:opacity-90"
      >
        <Quote aria-hidden="true" size={14} />
        Quote in notes
      </button>
      <div aria-hidden="true" className="mx-auto -mt-1.5 size-2.5 rotate-45 bg-text" />
    </div>
  );
}

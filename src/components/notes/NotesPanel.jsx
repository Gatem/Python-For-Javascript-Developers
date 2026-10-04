import { useRef, useEffect } from "react";
import NoteEntry from "./NoteEntry";

export default function NotesPanel({
  entries,
  onAddNote,
  onUpdateEntry,
  onDeleteEntry,
  saved,
  lessonTitle,
  totalNoteCount,
  isOpen,
  isWide,
  onToggle,
  focusEntryId,
  onClearFocus,
}) {
  const listRef = useRef(null);
  const prevLength = useRef(entries.length);
  const isOverlay = isOpen && !isWide;

  useEffect(() => {
    if (!isOverlay) return;
    const onKey = (e) => e.key === "Escape" && onToggle();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOverlay, onToggle]);

  useEffect(() => {
    if (entries.length > prevLength.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevLength.current = entries.length;
  }, [entries.length]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={totalNoteCount ? `Open notes (${totalNoteCount} saved)` : "Open notes"}
        className="fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full bg-blue-500/15 border border-blue-500/25 text-brand-blue-light cursor-pointer flex items-center justify-center shadow-lg hover:bg-blue-500/25 transition-colors"
        title="Open notes"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        {totalNoteCount > 0 && (
          <span aria-hidden="true" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] flex items-center justify-center font-semibold">
            {totalNoteCount > 9 ? "9+" : totalNoteCount}
          </span>
        )}
      </button>
    );
  }

  const panelContent = (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-blue-light"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <h2 id="notes-heading" className="m-0 text-[14px] font-semibold text-txt-secondary">
            Notes
          </h2>
          {entries.length > 0 && (
            <span className="text-[11px] text-txt-dimmer">
              ({entries.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            role="status"
            className={`text-[12px] transition-opacity duration-300 ${saved ? "text-term-success/50" : "text-term-warning/50"}`}
          >
            {saved ? "Saved" : "Saving..."}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close notes"
            className="w-8 h-8 rounded-md bg-white/5 border border-white/10 text-txt-muted cursor-pointer flex items-center justify-center text-[13px] hover:bg-white/10 transition-colors"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] shrink-0">
        <div className="text-[12px] text-txt-dim truncate mr-2">
          {lessonTitle}
        </div>
        <button
          type="button"
          onClick={onAddNote}
          className="text-[12px] text-brand-blue-light bg-brand-blue/10 px-2.5 py-1 rounded-md cursor-pointer border border-brand-blue/20 hover:bg-brand-blue/20 transition-colors shrink-0 font-sans"
        >
          + Add
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
      >
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-[28px] mb-2 opacity-30">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-txt-dim"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <p className="text-[13px] text-txt-dim m-0 mb-1">No notes yet</p>
            <p className="text-[12px] text-txt-dimmer m-0 leading-relaxed">
              Click &ldquo;+ Add&rdquo; to write a note, or
              <br />
              select text from the lesson to quote it.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <NoteEntry
              key={entry.id}
              entry={entry}
              onUpdate={onUpdateEntry}
              onDelete={onDeleteEntry}
              autoEdit={entry.id === focusEntryId}
              onEdited={() => {
                if (entry.id === focusEntryId && onClearFocus) onClearFocus();
              }}
            />
          ))
        )}
      </div>
    </>
  );

  if (isWide) {
    return (
      <aside aria-labelledby="notes-heading" className="w-1/3 min-w-[320px] shrink-0 bg-[rgba(15,23,42,0.6)] border-l border-white/5 flex flex-col sticky top-0 h-screen self-start">
        {panelContent}
      </aside>
    );
  }

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 bg-black/40 z-40" onClick={onToggle} />
      <aside
        aria-labelledby="notes-heading"
        className="fixed right-0 top-0 h-full w-[360px] max-w-[90vw] z-50 bg-[rgba(15,23,42,0.97)] border-l border-white/5 flex flex-col shadow-2xl">
        {panelContent}
      </aside>
    </>
  );
}

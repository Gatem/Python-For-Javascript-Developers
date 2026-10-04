import { useRef, useEffect } from "react";
import { NotebookPen, Plus, X, Check } from "lucide-react";
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
        title="Notes"
        className="fixed bottom-5 right-5 z-30 flex size-13 items-center justify-center rounded-2xl bg-text text-bg shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 cursor-pointer"
      >
        <NotebookPen aria-hidden="true" size={21} />
        {totalNoteCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-info px-1 text-[11px] font-semibold text-white ring-2 ring-bg"
          >
            {totalNoteCount > 9 ? "9+" : totalNoteCount}
          </span>
        )}
      </button>
    );
  }

  const panelContent = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-fg/8 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info">
            <NotebookPen aria-hidden="true" size={16} />
          </span>
          <div className="min-w-0">
            <h2 id="notes-heading" className="m-0 text-[14.5px] font-semibold text-text">
              Notes {entries.length > 0 && <span className="font-normal text-muted">({entries.length})</span>}
            </h2>
            <div className="truncate text-[12px] text-muted">{lessonTitle}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span role="status" className="mr-1 flex items-center gap-1 text-[11.5px] text-muted">
            {saved ? (
              <>
                <Check aria-hidden="true" size={12} className="text-success" /> Saved
              </>
            ) : (
              "Saving…"
            )}
          </span>
          <button
            type="button"
            onClick={onAddNote}
            aria-label="Add a note"
            title="Add a note"
            className="inline-flex size-8 items-center justify-center rounded-lg bg-info/12 text-info hover:bg-info/20 cursor-pointer"
          >
            <Plus aria-hidden="true" size={17} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close notes"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-fg/8 hover:text-text cursor-pointer"
          >
            <X aria-hidden="true" size={17} />
          </button>
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto scroll-thin p-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-fg/5 text-muted">
              <NotebookPen aria-hidden="true" size={22} />
            </span>
            <p className="m-0 mb-1 text-[14px] font-medium text-text">No notes yet</p>
            <p className="m-0 max-w-[220px] text-[12.5px] leading-relaxed text-muted">
              Use the + button to write a note, or select text in the lesson to quote it.
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
      <aside
        aria-labelledby="notes-heading"
        className="sticky top-16 flex h-[calc(100dvh-4rem)] w-[340px] shrink-0 flex-col self-start border-l border-fg/8 bg-surface-2/40"
      >
        {panelContent}
      </aside>
    );
  }

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onToggle} />
      <aside
        aria-labelledby="notes-heading"
        className="fixed bottom-0 right-0 top-0 z-50 flex w-[380px] max-w-[92vw] flex-col border-l border-fg/10 bg-bg shadow-card"
      >
        {panelContent}
      </aside>
    </>
  );
}

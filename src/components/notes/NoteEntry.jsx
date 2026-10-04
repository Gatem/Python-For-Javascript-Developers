import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Quote } from "lucide-react";

export default function NoteEntry({
  entry,
  onUpdate,
  onDelete,
  autoEdit,
  onEdited,
}) {
  const [editing, setEditing] = useState(!!autoEdit);
  const [text, setText] = useState(entry.text);
  const [prevAutoEdit, setPrevAutoEdit] = useState(autoEdit);
  const taRef = useRef(null);

  // Enter edit mode when the parent asks for it (new note / new quote).
  if (autoEdit !== prevAutoEdit) {
    setPrevAutoEdit(autoEdit);
    if (autoEdit) {
      setEditing(true);
      setText(entry.text);
    }
  }

  const startEditing = () => {
    setText(entry.text);
    setEditing(true);
  };

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      taRef.current.style.height = "auto";
      taRef.current.style.height = taRef.current.scrollHeight + "px";
    }
  }, [editing]);

  const save = () => {
    onUpdate(entry.id, text);
    setEditing(false);
    if (onEdited) onEdited();
  };

  const discard = () => {
    setText(entry.text);
    setEditing(false);
    if (onEdited) onEdited();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") discard();
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save();
  };

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const actionBtn =
    "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-muted cursor-pointer transition-colors";

  return (
    <div className="group rounded-2xl border border-fg/8 bg-surface p-3.5 shadow-card">
      {entry.type === "quote" && (
        <blockquote className="m-0 mb-2.5 flex gap-2 rounded-xl bg-info/[0.07] px-3 py-2 text-[13px] italic leading-relaxed text-text-2">
          <Quote aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-info" />
          <span>
            <sup className="mr-1 text-[11px] font-semibold not-italic text-info-text">[{entry.refNum}]</sup>
            {entry.quote}
          </span>
        </blockquote>
      )}

      {editing ? (
        <div>
          <textarea
            aria-label={entry.type === "quote" ? "Note about this quote" : "Note"}
            ref={taRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={entry.type === "quote" ? "Add a thought about this quote..." : "Write your note..."}
            className="min-h-[64px] w-full resize-none rounded-xl border border-fg/12 bg-surface-2 p-2.5 font-sans text-[13.5px] leading-relaxed text-text outline-none placeholder:text-muted focus:border-info/50 focus:ring-4 focus:ring-info/15"
          />
          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-accent px-3 py-1 text-[12.5px] font-medium text-accent-fg hover:bg-accent-strong cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={discard}
              className="rounded-lg px-3 py-1 text-[12.5px] text-muted hover:bg-fg/6 hover:text-text cursor-pointer"
            >
              Cancel
            </button>
            <span className="ml-auto text-[11.5px] text-muted">Ctrl+Enter to save</span>
          </div>
        </div>
      ) : (
        <div>
          {entry.text ? (
            <p className="m-0 whitespace-pre-wrap text-[13.5px] leading-relaxed text-text">{entry.text}</p>
          ) : entry.type === "quote" ? (
            <button
              type="button"
              className="m-0 cursor-pointer border-none bg-transparent p-0 font-sans text-[12.5px] italic text-muted hover:text-text"
              onClick={startEditing}
            >
              Add a thought about this quote...
            </button>
          ) : null}
          <div className="mt-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <button type="button" onClick={startEditing} className={`${actionBtn} hover:bg-fg/6 hover:text-text`}>
              <Pencil aria-hidden="true" size={12} /> Edit
            </button>
            <button
              type="button"
              aria-label="Delete note"
              onClick={() => onDelete(entry.id)}
              className={`${actionBtn} hover:bg-danger/10 hover:text-danger`}
            >
              <Trash2 aria-hidden="true" size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

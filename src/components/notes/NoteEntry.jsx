import { useState, useRef, useEffect } from "react";

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

  return (
    <div className="px-4 py-3 border-b border-white/[0.04]">
      {entry.type === "quote" && (
        <div className="mb-2 pl-3 border-l-2 border-brand-blue/40 text-[13px] text-brand-blue-light/70 italic leading-relaxed">
          <sup className="text-[10px] text-brand-blue-light font-semibold not-italic mr-1">
            [{entry.refNum}]
          </sup>
          &ldquo;{entry.quote}&rdquo;
        </div>
      )}

      {editing ? (
        <div>
          <textarea
            aria-label={entry.type === "quote" ? "Note about this quote" : "Note"}
            ref={taRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              entry.type === "quote"
                ? "Add a note about this quote..."
                : "Write your note..."
            }
            className="w-full bg-white/5 border border-white/10 rounded-md p-2.5 text-[13.5px] text-txt-secondary leading-relaxed resize-none outline-none font-sans min-h-[56px] placeholder:text-txt-dimmer focus:border-brand-blue/30"
          />
          <div className="flex items-center gap-2 mt-1.5">
            <button
              type="button"
              onClick={save}
              className="text-[12px] font-semibold text-term-success bg-term-success/10 px-2.5 py-1 rounded cursor-pointer border-none hover:bg-term-success/20 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={discard}
              className="text-[12px] text-txt-muted px-2.5 py-1 rounded cursor-pointer border-none hover:text-txt-secondary transition-colors"
            >
              Cancel
            </button>
            <span className="text-[10px] text-txt-dimmer ml-auto">
              Ctrl+Enter to save
            </span>
          </div>
        </div>
      ) : (
        <div className="group">
          {entry.text ? (
            <p className="text-[13.5px] text-txt-secondary leading-relaxed m-0 whitespace-pre-wrap">
              {entry.text}
            </p>
          ) : entry.type === "quote" ? (
            <button
              type="button"
              className="text-[12px] text-txt-dimmer italic m-0 p-0 bg-transparent border-none font-sans cursor-pointer hover:text-txt-muted transition-colors"
              onClick={startEditing}
            >
              Click to add a note...
            </button>
          ) : null}
          <div className="flex gap-2 mt-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={startEditing}
              className="text-[12px] text-txt-dim cursor-pointer border-none bg-transparent hover:text-brand-blue-light transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              aria-label="Delete note"
              onClick={() => onDelete(entry.id)}
              className="text-[12px] text-txt-dim cursor-pointer border-none bg-transparent hover:text-term-error transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

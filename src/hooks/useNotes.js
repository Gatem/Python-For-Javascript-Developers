import { useState, useEffect, useCallback, useRef } from "react";
import { KEYS, readJSON, writeJSON } from "../lib/storage";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const loadAllNotes = () => readJSON(KEYS.notes, {});
const persistNotes = (notes) => writeJSON(KEYS.notes, notes);

export function useNotes(lessonKey) {
  const [allNotes, setAllNotes] = useState(loadAllNotes);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);
  const notesRef = useRef(allNotes);
  useEffect(() => {
    notesRef.current = allNotes;
  }, [allNotes]);

  const entries = allNotes[lessonKey] || [];

  const setEntries = useCallback(
    (updater) => {
      setSaved(false);
      setAllNotes((prev) => {
        const current = prev[lessonKey] || [];
        const updated =
          typeof updater === "function" ? updater(current) : updater;
        const next = { ...prev, [lessonKey]: updated };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          persistNotes(next);
          setSaved(true);
        }, 500);
        return next;
      });
    },
    [lessonKey]
  );

  const addNote = useCallback(
    (text = "") => {
      const id = generateId();
      setEntries((prev) => [
        ...prev,
        { id, type: "note", text, createdAt: Date.now() },
      ]);
      return id;
    },
    [setEntries]
  );

  const addQuote = useCallback(
    (quoteText) => {
      const id = generateId();
      setEntries((prev) => {
        const refNum = prev.filter((e) => e.type === "quote").length + 1;
        return [
          ...prev,
          {
            id,
            type: "quote",
            text: "",
            quote: quoteText,
            refNum,
            createdAt: Date.now(),
          },
        ];
      });
      return id;
    },
    [setEntries]
  );

  const updateEntry = useCallback(
    (id, text) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, text } : e))
      );
    },
    [setEntries]
  );

  const deleteEntry = useCallback(
    (id) => {
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.id !== id);
        let qNum = 1;
        return filtered.map((e) =>
          e.type === "quote" ? { ...e, refNum: qNum++ } : e
        );
      });
    },
    [setEntries]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        persistNotes(notesRef.current);
      }
    };
  }, [lessonKey]);

  const quotes = entries
    .filter((e) => e.type === "quote")
    .map((e) => ({ quote: e.quote, refNum: e.refNum }));

  const totalNoteCount = Object.values(allNotes).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return {
    entries,
    addNote,
    addQuote,
    updateEntry,
    deleteEntry,
    saved,
    totalNoteCount,
    quotes,
  };
}

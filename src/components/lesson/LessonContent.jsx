import { useState, useRef, useCallback, useEffect } from "react";
import { PenLine } from "lucide-react";
import { KEYS, readFlag, writeFlag } from "../../lib/storage";
import InlineText from "./InlineText";

// Splits a paragraph into plain segments and segments the learner quoted.
function buildSegments(text, quotes) {
  const ranges = [];
  for (const q of quotes || []) {
    const idx = text.indexOf(q.quote);
    if (idx !== -1) ranges.push({ start: idx, end: idx + q.quote.length, refNum: q.refNum });
  }
  ranges.sort((a, b) => a.start - b.start);
  const segments = [];
  let pos = 0;
  for (const r of ranges) {
    if (r.start < pos) continue;
    if (r.start > pos) segments.push({ text: text.slice(pos, r.start) });
    segments.push({ text: text.slice(r.start, r.end), refNum: r.refNum });
    pos = r.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}

export default function LessonContent({ content, quotes }) {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const [seenBefore] = useState(() => readFlag(KEYS.quoteHintSeen));
  const learned = seenBefore || (quotes && quotes.length > 0);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const idleTimer = useRef(null);
  const inside = useRef(false);

  useEffect(() => {
    if (!seenBefore && quotes && quotes.length > 0) writeFlag(KEYS.quoteHintSeen);
  }, [quotes, seenBefore]);

  const clearIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = null;
  }, []);

  const handleMove = useCallback(
    (e) => {
      if (learned) return;
      inside.current = true;
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(false);
      clearIdle();
      idleTimer.current = setTimeout(() => {
        if (inside.current) setVisible(true);
      }, 900);
    },
    [learned, clearIdle],
  );

  const handleLeave = useCallback(() => {
    inside.current = false;
    clearIdle();
    setVisible(false);
  }, [clearIdle]);

  // Mouse handlers only drive a decorative "select to quote" hint.
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-lesson-content
      className="relative flex max-w-[70ch] flex-col gap-5 text-[16.5px] leading-[1.8] text-text-2"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseDown={handleLeave}
    >
      {!learned && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-50 flex select-none items-center gap-1.5 rounded-full border border-fg/10 bg-surface/90 py-1 pl-2 pr-3 text-[12px] font-medium text-muted shadow-card backdrop-blur-md transition-all duration-300"
          style={{
            left: pos.x + 16,
            top: pos.y - 16,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.95)",
          }}
        >
          <PenLine size={13} className="text-info" />
          Select text to quote it in your notes
        </span>
      )}
      {paragraphs.map((para, pi) => (
        <p key={pi} className={pi === 0 ? "text-[17.5px] text-text" : undefined}>
          {buildSegments(para, quotes).map((seg, si) =>
            seg.refNum != null ? (
              <mark key={si} className="rounded-sm bg-info/15 px-0.5 text-text">
                <InlineText text={seg.text} />
                <sup aria-label={`note ${seg.refNum}`} className="ml-0.5 select-none text-[11px] font-semibold text-info-text">
                  [{seg.refNum}]
                </sup>
              </mark>
            ) : (
              <span key={si}><InlineText text={seg.text} /></span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

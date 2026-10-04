import { useState, useRef, useCallback, useEffect } from "react";
import { KEYS, readFlag, writeFlag } from "../../lib/storage";

function buildSegments(content, quotes) {
  if (!quotes || !quotes.length) return [{ text: content }];

  const positions = [];
  for (const q of quotes) {
    const idx = content.indexOf(q.quote);
    if (idx !== -1) {
      positions.push({
        start: idx,
        end: idx + q.quote.length,
        refNum: q.refNum,
      });
    }
  }

  positions.sort((a, b) => a.start - b.start);

  const merged = [];
  for (const p of positions) {
    if (merged.length && p.start < merged[merged.length - 1].end) continue;
    merged.push(p);
  }

  const segments = [];
  let pos = 0;
  for (const m of merged) {
    if (m.start > pos) {
      segments.push({ text: content.substring(pos, m.start) });
    }
    segments.push({
      text: content.substring(m.start, m.end),
      refNum: m.refNum,
    });
    pos = m.end;
  }
  if (pos < content.length) {
    segments.push({ text: content.substring(pos) });
  }

  return segments;
}

export default function LessonContent({ content, quotes }) {
  const segments = buildSegments(content, quotes);
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
      }, 800);
    },
    [learned, clearIdle],
  );

  const handleLeave = useCallback(() => {
    inside.current = false;
    clearIdle();
    setVisible(false);
  }, [clearIdle]);

  const handleDown = useCallback(() => {
    clearIdle();
    setVisible(false);
  }, [clearIdle]);

  // Mouse handlers only drive a decorative "select to quote" hint.
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-lesson-content
      className="relative text-[16.5px] leading-[1.8] text-txt-secondary mb-1 whitespace-pre-line cursor-text"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
    >
      {!learned && (
        <span
          aria-hidden="true"
          className="fixed z-50 pointer-events-none select-none flex items-center gap-1.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/[0.1] pl-2 pr-3 py-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out"
          style={{
            left: pos.x + 16,
            top: pos.y - 16,
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(4px) scale(0.95)",
          }}
        >
          <span className="w-5 h-5 rounded-full bg-brand-blue/15 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue-light"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          </span>
          <span className="text-[11px] font-medium text-txt-muted tracking-wide whitespace-nowrap">select to quote</span>
        </span>
      )}
      {segments.map((seg, i) =>
        seg.refNum != null ? (
          <mark
            key={i}
            className="bg-brand-blue/10 text-txt-primary rounded-sm px-0.5 -mx-0.5"
            style={{ textDecoration: "none" }}
          >
            {seg.text}
            <sup aria-label={`note ${seg.refNum}`} className="text-[11px] text-brand-blue-light font-semibold ml-0.5 select-none">
              [{seg.refNum}]
            </sup>
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </div>
  );
}

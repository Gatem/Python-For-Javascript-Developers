import { ArrowLeft, ArrowRight } from "lucide-react";

function NavCard({ entry, direction, onClick }) {
  const isNext = direction === "next";
  return (
    <a
      href={`#/${entry.key}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`group flex min-w-0 items-center gap-3 rounded-2xl border border-fg/10 bg-surface p-4 no-underline shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/40 ${
        isNext ? "justify-end text-right" : ""
      }`}
    >
      {!isNext && (
        <ArrowLeft aria-hidden="true" size={18} className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5 group-hover:text-accent" />
      )}
      <span className="min-w-0">
        <span className="block text-[12px] text-muted">
          {isNext ? "Next" : "Previous"}
          {entry.mod && <span aria-hidden="true"> · {entry.mod.title}</span>}
        </span>
        <span className="block truncate text-[15px] font-semibold text-text">{entry.lesson.title}</span>
      </span>
      {isNext && (
        <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      )}
    </a>
  );
}

export default function LessonNav({ prev, next, onPrev, onNext }) {
  return (
    <nav aria-label="Lesson navigation" className="grid gap-3 border-t border-fg/8 pt-8 sm:grid-cols-2">
      <div className="min-w-0">{prev && <NavCard entry={prev} direction="prev" onClick={onPrev} />}</div>
      <div className="min-w-0">{next && <NavCard entry={next} direction="next" onClick={onNext} />}</div>
    </nav>
  );
}

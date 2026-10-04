import { useEffect, useRef } from "react";
import { Trophy, Star, CircleCheck, Flame, Target, ArrowRight } from "lucide-react";
import ProgressRing from "../ui/ProgressRing";
import { ModuleIcon } from "../ui/moduleIcons";

function Confetti({ level }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const count = level === "course" ? 120 : level === "module" ? 80 : 45;
    const colors =
      level === "course"
        ? ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"]
        : level === "module"
          ? ["#10b981", "#3b82f6", "#f59e0b", "#a855f7"]
          : ["#10b981", "#3b82f6", "#60a5fa"];

    const pieces = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * -1.2,
      w: 4 + Math.random() * 6,
      h: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 1.5 + Math.random() * 3,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 8,
      opacity: 0.7 + Math.random() * 0.3,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.rot += p.rv;
        p.opacity -= 0.002;
        if (p.opacity <= 0 || p.y > canvas.height + 20) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [level]);

  return (
    <canvas
      aria-hidden="true"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

export default function CelebrationDialog({
  celebration,
  activity,
  onDismiss,
  onNext,
}) {
  const primaryRef = useRef(null);

  // Modal behaviour: focus the main action, close on Escape, and give focus
  // back to whatever had it before (usually the Check button).
  useEffect(() => {
    if (!celebration) return;
    const previous = document.activeElement;
    primaryRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onDismiss();
      if (e.key === "Tab") {
        const items = document.querySelectorAll("[data-celebration] button");
        if (items.length) {
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement && document.contains(previous)) previous.focus();
    };
  }, [celebration, onDismiss]);

  if (!celebration) return null;

  const {
    level,
    lessonTitle,
    moduleTitle,
    nextModule,
    totalCompleted,
    totalLessons,
  } = celebration;

  const handleAction = () => {
    onDismiss();
    if (level !== "course" && onNext) onNext();
  };

  const heading = level === "course" ? "Course complete!" : level === "module" ? "Module complete!" : "Lesson complete!";
  const HeroIcon = level === "course" ? Trophy : level === "module" ? Star : CircleCheck;
  const pct = totalLessons ? totalCompleted / totalLessons : 0;

  return (
    // Backdrop click is a mouse shortcut; keyboard users have Escape and the buttons.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 starting:bg-black/0 starting:backdrop-blur-none"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <Confetti level={level} />
      <div
        data-celebration
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-fg/10 bg-surface p-7 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 starting:translate-y-6 starting:scale-95 starting:opacity-0"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-accent/15 to-transparent" />
        <div className="relative">
          <span
            aria-hidden="true"
            className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl ${
              level === "course" ? "bg-amber-400/20 text-amber-500" : "bg-accent/15 text-accent"
            } ${level !== "lesson" ? "motion-safe:animate-bounce" : ""}`}
          >
            <HeroIcon size={32} strokeWidth={2} />
          </span>
          <h2 id="celebration-title" className="m-0 text-[24px] font-semibold tracking-tight text-text">
            {heading}
          </h2>
          <p className="m-0 mt-1.5 text-[14.5px] text-text-2">
            {level === "lesson" && lessonTitle}
            {level === "module" && moduleTitle}
            {level === "course" && `You finished all ${totalLessons} lessons. You speak Python now.`}
          </p>

          <div className="my-6 flex items-center justify-center gap-4">
            <ProgressRing value={pct} size={72} stroke={6}>
              <span className="text-[15px] font-semibold text-text">{Math.round(pct * 100)}%</span>
            </ProgressRing>
            <div className="text-left text-[13px] text-text-2">
              <div>
                <span className="font-semibold text-text">{totalCompleted}</span> of {totalLessons} lessons
              </div>
              {activity && (
                <>
                  {activity.streak > 0 && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Flame aria-hidden="true" size={14} className="text-orange-500" />
                      {activity.streak} day streak
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1.5">
                    <Target aria-hidden="true" size={14} className="text-accent" />
                    {activity.todayDone}/{activity.dailyTarget} today
                  </div>
                </>
              )}
            </div>
          </div>

          {level === "module" && nextModule && (
            <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-fg/5 px-3 py-2 text-[13px] text-text-2">
              Next up:
              <ModuleIcon id={nextModule.id} aria-hidden="true" size={15} className="text-accent" />
              <span className="font-medium text-text">{nextModule.title}</span>
            </div>
          )}

          <button
            ref={primaryRef}
            type="button"
            onClick={handleAction}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[14.5px] font-semibold text-accent-fg hover:bg-accent-strong cursor-pointer transition-colors"
          >
            {level === "course" ? "Celebrate" : "Continue"}
            {level !== "course" && <ArrowRight aria-hidden="true" size={16} />}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 h-10 w-full rounded-xl text-[13.5px] text-muted hover:bg-fg/5 hover:text-text cursor-pointer"
          >
            Stay on this lesson
          </button>
        </div>
      </div>
    </div>
  );
}

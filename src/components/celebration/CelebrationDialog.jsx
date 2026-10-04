import { useEffect, useRef } from "react";

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

function ProgressRing({ completed, total }) {
  const pct = total > 0 ? completed / total : 0;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative flex items-center justify-center my-3">
      <svg width="92" height="92" className="-rotate-90">
        <circle
          cx="46" cy="46" r={r}
          fill="none" stroke="currentColor" strokeWidth="5"
          className="text-white/[0.06]"
        />
        <circle
          cx="46" cy="46" r={r}
          fill="none" stroke="currentColor" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-green transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-[18px] font-bold text-txt-primary">
          {Math.round(pct * 100)}%
        </div>
        <div className="text-[10px] text-txt-dim">complete</div>
      </div>
    </div>
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
    moduleIcon,
    nextModule,
    totalCompleted,
    totalLessons,
  } = celebration;

  const handleAction = () => {
    onDismiss();
    if ((level === "module" || level === "lesson") && onNext) onNext();
  };

  const heading =
    level === "course"
      ? "Course Complete!"
      : level === "module"
        ? "Module Complete!"
        : "Lesson Complete!";

  const icon =
    level === "course"
      ? "\u{1F3C6}"
      : level === "module"
        ? "\u{1F31F}"
        : "\u{2705}";

  return (
    // Backdrop click is a mouse shortcut; keyboard users have Escape and the buttons.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-sm starting:bg-black/0 starting:backdrop-blur-none"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <Confetti level={level} />

      <div
        data-celebration
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className={`relative bg-surface-card border border-white/[0.08] rounded-2xl p-7 max-w-[380px] w-full shadow-[0_24px_80px_rgba(0,0,0,0.5)] text-center transition-all duration-500 opacity-100 scale-100 translate-y-0 starting:opacity-0 starting:scale-90 starting:translate-y-6`}
      >
        <div aria-hidden="true" className={`text-[48px] mb-1 ${level !== "lesson" ? "motion-safe:animate-bounce" : ""}`}>
          {icon}
        </div>

        <h2 id="celebration-title" className="text-[22px] font-bold m-0 mb-1 bg-linear-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
          {heading}
        </h2>

        {level === "lesson" && (
          <p className="text-[14px] text-txt-muted m-0">
            {moduleIcon} {lessonTitle}
          </p>
        )}

        {level === "module" && (
          <p className="text-[15px] text-txt-secondary m-0 font-medium">
            {moduleIcon} {moduleTitle}
          </p>
        )}

        {level === "course" && (
          <p className="text-[14px] text-txt-muted m-0 mt-1">
            You&apos;ve mastered all {totalLessons} lessons!
          </p>
        )}

        <ProgressRing completed={totalCompleted} total={totalLessons} />

        <div className="text-[13px] text-txt-dim mb-4">
          {totalCompleted} of {totalLessons} lessons
        </div>

        {activity && (
          <div className="flex items-center justify-center gap-4 mb-5 text-[12px]">
            {activity.streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                <span>{"\u{1F525}"}</span>
                <span className="text-amber-400 font-medium">
                  {activity.streak} day streak
                </span>
              </div>
            )}
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                activity.todayDone >= activity.dailyTarget
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-blue-500/10 border border-blue-500/20"
              }`}
            >
              <span>
                {activity.todayDone >= activity.dailyTarget
                  ? "\u{2705}"
                  : "\u{1F4CA}"}
              </span>
              <span
                className={`font-medium ${
                  activity.todayDone >= activity.dailyTarget
                    ? "text-emerald-400"
                    : "text-blue-400"
                }`}
              >
                {activity.todayDone}/{activity.dailyTarget} today
              </span>
            </div>
          </div>
        )}

        {level === "module" && nextModule && (
          <div className="text-[12px] text-txt-dimmer mb-4">
            Next up: {nextModule.icon} {nextModule.title}
          </div>
        )}

        <button
          ref={primaryRef}
          type="button"
          onClick={handleAction}
          className="w-full py-2.5 rounded-xl bg-linear-to-r from-brand-green to-brand-green-dark text-white text-[14px] font-semibold border-none cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:brightness-110 transition-all font-sans"
        >
          {level === "course"
            ? "Celebrate! \u{1F389}"
            : "Continue \u{2192}"}
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-2.5 bg-transparent border-none text-txt-dimmer text-[13px] cursor-pointer font-sans hover:text-txt-muted"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function ActivityMeter({ activity }) {
  if (!activity) return null;

  const { todayDone, dailyTarget, streak } = activity;
  const pct = Math.min(todayDone / dailyTarget, 1);
  const targetHit = todayDone >= dailyTarget;

  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex items-center gap-3">
      {streak > 0 && (
        <div
          className="flex items-center gap-1 text-[13px] font-semibold"
          title={`${streak} day streak!`}
        >
          <span className="sr-only">{streak} day streak</span>
          <span aria-hidden="true" className={`text-[16px] ${streak >= 3 ? "motion-safe:animate-pulse" : ""}`}>
            {streak >= 7 ? "\u{1F525}" : streak >= 3 ? "\u{1F525}" : "\u{2728}"}
          </span>
          <span aria-hidden="true" className="text-amber-400">{streak}</span>
        </div>
      )}

      <button
        type="button"
        aria-label={`${todayDone} of ${dailyTarget} lessons done today${streak ? `, ${streak} day streak` : ""}`}
        className="relative flex items-center justify-center cursor-default group rounded-full bg-transparent border-none p-0 text-inherit font-sans"
      >
        <svg aria-hidden="true" width="44" height="44" className="-rotate-90">
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/[0.06]"
          />
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-700 ease-out ${targetHit ? "text-brand-green" : "text-brand-blue-light"}`}
          />
        </svg>
        <span
          aria-hidden="true"
          className={`absolute text-[11px] font-bold ${targetHit ? "text-brand-green" : "text-txt-muted"}`}
        >
          {todayDone}/{dailyTarget}
        </span>

        <span aria-hidden="true" className="block absolute top-full mt-2 right-0 min-w-[200px] bg-surface-card/95 backdrop-blur-md border border-white/[0.08] rounded-xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left">
          <span className="block text-[12px] font-semibold text-txt-secondary mb-2">
            Today&apos;s Progress
          </span>
          <span className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="text-txt-dim">Lessons done</span>
            <span className="text-txt-primary font-medium">{todayDone}</span>
          </span>
          <span className="flex items-center justify-between text-[12px] mb-2.5">
            <span className="text-txt-dim">Daily target</span>
            <span className="text-txt-primary font-medium">{dailyTarget}</span>
          </span>
          <span className="block h-px bg-white/[0.06] mb-2.5" />
          {streak > 0 ? (
            <span className="text-[11px] text-amber-400/80 flex items-center gap-1.5">
              {"\u{1F525}"} {streak} day streak
              {streak >= 7 && " — on fire!"}
              {streak >= 3 && streak < 7 && " — keep it up!"}
            </span>
          ) : (
            <span className="block text-[12px] text-txt-dimmer">
              Complete {dailyTarget} lesson{dailyTarget > 1 ? "s" : ""} to start
              a streak
            </span>
          )}
          {targetHit && (
            <span className="text-[11px] text-brand-green/80 mt-1.5 flex items-center gap-1">
              {"✓"} Target hit — nice work today!
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

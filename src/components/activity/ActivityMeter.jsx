import { Flame, Target } from "lucide-react";
import ProgressRing from "../ui/ProgressRing";

export default function ActivityMeter({ activity }) {
  if (!activity) return null;
  const { todayDone, dailyTarget, streak, bestStreak } = activity;
  const targetHit = todayDone >= dailyTarget;
  const label = `${todayDone} of ${dailyTarget} lessons done today${streak ? `, ${streak} day streak` : ""}`;

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={label}
        className="flex items-center gap-2 rounded-full border border-fg/10 bg-surface/70 py-1 pl-1 pr-2.5 text-[12.5px] cursor-default"
      >
        <ProgressRing value={todayDone / dailyTarget} size={26} stroke={3}>
          <Target aria-hidden="true" size={12} className={targetHit ? "text-accent" : "text-muted"} />
        </ProgressRing>
        <span aria-hidden="true" className="flex items-center gap-1 font-semibold text-text">
          <Flame size={14} className={streak > 0 ? "text-orange-500 fill-orange-500/30" : "text-muted"} />
          {streak}
        </span>
      </button>

      <div
        aria-hidden="true"
        className="invisible absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-fg/10 bg-surface p-4 text-left opacity-0 shadow-card transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <div className="mb-3 text-[13px] font-semibold text-text">Today</div>
        <div className="mb-1.5 flex justify-between text-[13px]">
          <span className="text-muted">Lessons completed</span>
          <span className="font-medium text-text">{todayDone}</span>
        </div>
        <div className="mb-1.5 flex justify-between text-[13px]">
          <span className="text-muted">Daily goal</span>
          <span className="font-medium text-text">{dailyTarget}</span>
        </div>
        <div className="mb-3 flex justify-between text-[13px]">
          <span className="text-muted">Best streak</span>
          <span className="font-medium text-text">{bestStreak || 0} days</span>
        </div>
        <div className="rounded-xl bg-fg/5 px-3 py-2 text-[12.5px] text-text-2">
          {targetHit
            ? "Goal reached today. Nice work!"
            : streak > 0
              ? `Finish ${dailyTarget - todayDone} more to keep your ${streak}-day streak.`
              : `Complete ${dailyTarget} lessons today to start a streak.`}
        </div>
      </div>
    </div>
  );
}

import { CircleCheck, Circle, RotateCcw } from "lucide-react";
import { TIERS } from "../../data";
import ProgressRing from "../ui/ProgressRing";
import { ModuleIcon, TierIcon } from "../ui/moduleIcons";
import AuthorCard from "./AuthorCard";

function buildTierGroups(modules) {
  const byTier = {};
  modules.forEach((m) => {
    const tier = m.tier || 1;
    if (!byTier[tier]) byTier[tier] = { tier, ...(TIERS[tier] || { label: `Tier ${tier}` }), modules: [] };
    byTier[tier].modules.push(m);
  });
  return Object.keys(byTier).sort((a, b) => a - b).map((k) => byTier[k]);
}

const keyOf = (m, l) => `${m.id}/${l.id}`;

export default function SideNav({ modules, current, done, completedCount, totalLessons, onSelect, onReset }) {
  const currentModId = current.split("/")[0];
  const pct = totalLessons ? completedCount / totalLessons : 0;

  return (
    <nav aria-label="Course lessons" className="flex min-h-full flex-col gap-5 p-4">
      <div className="flex items-center gap-3 rounded-2xl border border-fg/8 bg-surface p-3.5 shadow-card">
        <ProgressRing value={pct} size={46} stroke={4}>
          <span className="text-[11px] font-semibold text-text">{Math.round(pct * 100)}%</span>
        </ProgressRing>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-text">Your progress</div>
          <div className="text-[12.5px] text-muted">
            {completedCount} of {totalLessons} lessons
          </div>
        </div>
      </div>

      {buildTierGroups(modules).map((group) => {
        return (
          <section key={group.tier} aria-labelledby={`tier-${group.tier}`}>
            <h2
              id={`tier-${group.tier}`}
              className="m-0 mb-1.5 flex items-center gap-1.5 px-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted"
            >
              <TierIcon tier={group.tier} aria-hidden="true" size={13} />
              {group.label}
            </h2>
            <ul className="m-0 list-none space-y-0.5 p-0">
              {group.modules.map((m) => {
                const doneCount = m.lessons.filter((l) => done[keyOf(m, l)]).length;
                const total = m.lessons.length;
                const isCurrentMod = m.id === currentModId;
                const complete = doneCount === total;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(keyOf(m, m.lessons[0]))}
                      aria-expanded={isCurrentMod}
                      className={`group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left cursor-pointer transition-colors ${
                        isCurrentMod ? "bg-accent/10" : "hover:bg-fg/5"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          isCurrentMod
                            ? "border-accent/30 bg-accent/15 text-accent-text"
                            : "border-fg/8 bg-surface text-text-2 group-hover:text-text"
                        }`}
                      >
                        <ModuleIcon id={m.id} size={16} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[14px] font-medium ${isCurrentMod ? "text-text" : "text-text-2"}`}>
                          {m.title}
                        </span>
                        <span className="block truncate text-[12px] text-muted">{m.subtitle}</span>
                      </span>
                      {complete ? (
                        <CircleCheck size={17} className="shrink-0 text-accent" aria-label="complete" />
                      ) : doneCount > 0 ? (
                        <span className="shrink-0 rounded-full bg-fg/6 px-1.5 py-0.5 text-[11px] font-medium text-text-2">
                          {doneCount}/{total}
                          <span className="sr-only"> lessons done</span>
                        </span>
                      ) : null}
                    </button>

                    {isCurrentMod && (
                      <ul className="relative m-0 mb-1 ml-[1.55rem] list-none border-l border-fg/10 p-0 py-1">
                        {m.lessons.map((l) => {
                          const key = keyOf(m, l);
                          const isCurrent = key === current;
                          const isDone = !!done[key];
                          return (
                            <li key={l.id}>
                              <a
                                href={`#/${key}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  onSelect(key);
                                }}
                                aria-current={isCurrent ? "page" : undefined}
                                className={`relative -ml-px flex items-center gap-2.5 border-l-2 py-1.5 pl-4 pr-2 text-[13.5px] no-underline transition-colors ${
                                  isCurrent
                                    ? "border-accent font-medium text-text"
                                    : "border-transparent text-muted hover:border-fg/25 hover:text-text"
                                }`}
                              >
                                {isDone ? (
                                  <CircleCheck size={15} className="shrink-0 text-accent" aria-hidden="true" />
                                ) : (
                                  <Circle
                                    size={15}
                                    className={`shrink-0 ${isCurrent ? "text-accent" : "text-fg/25"}`}
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="truncate">{l.title}</span>
                                {isDone && <span className="sr-only">(completed)</span>}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="mt-auto space-y-3 pt-2">
        <AuthorCard />
        {completedCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] text-muted hover:bg-danger/8 hover:text-danger cursor-pointer transition-colors"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Reset progress
          </button>
        )}
      </div>
    </nav>
  );
}

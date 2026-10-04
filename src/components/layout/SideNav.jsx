import { TIERS } from "../../data";
import ProgressBar from "../ui/ProgressBar";

const TIER_STYLES = {
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/25 text-emerald-400",
  blue:    "from-blue-500/20 to-blue-500/5 border-blue-500/25 text-blue-400",
  violet:  "from-violet-500/20 to-violet-500/5 border-violet-500/25 text-violet-400",
  amber:   "from-amber-500/20 to-amber-500/5 border-amber-500/25 text-amber-400",
};

function buildTierGroups(modules) {
  const byTier = {};
  modules.forEach((m) => {
    const tier = m.tier || 1;
    if (!byTier[tier]) {
      const info = TIERS[tier] || { label: `Tier ${tier}`, icon: "", color: "emerald" };
      byTier[tier] = { tier, ...info, modules: [] };
    }
    byTier[tier].modules.push(m);
  });
  return Object.keys(byTier).sort((a, b) => a - b).map((k) => byTier[k]);
}

const keyOf = (m, l) => `${m.id}/${l.id}`;

export default function SideNav({
  modules,
  current,
  done,
  completedCount,
  totalLessons,
  onSelect,
  onReset,
}) {
  const tierGroups = buildTierGroups(modules);
  const currentModId = current.split("/")[0];

  return (
    <nav aria-label="Course lessons">
      <ProgressBar completed={completedCount} total={totalLessons} />
      {tierGroups.map((group) => (
        <section key={group.tier} aria-labelledby={`tier-${group.tier}`}>
          <div className="mx-3 mt-4 mb-2">
            <h2
              id={`tier-${group.tier}`}
              className={`m-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-linear-to-r ${TIER_STYLES[group.color] || TIER_STYLES.emerald}`}
            >
              <span className="text-[13px]" aria-hidden="true">{group.icon}</span>
              <span className="text-[12px] font-bold uppercase tracking-[0.08em]">
                {group.label}
              </span>
            </h2>
          </div>
          <ul className="list-none m-0 p-0">
            {group.modules.map((m) => {
              const doneCount = m.lessons.filter((l) => done[keyOf(m, l)]).length;
              const total = m.lessons.length;
              const isCurrentMod = m.id === currentModId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(keyOf(m, m.lessons[0]))}
                    aria-expanded={isCurrentMod}
                    className={`w-full text-left bg-transparent border-0 border-l-[3px] font-sans text-txt-primary py-2.5 px-4 cursor-pointer ${
                      isCurrentMod
                        ? "border-l-brand-green bg-emerald-500/[0.08]"
                        : "border-l-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[14px]">
                        <span aria-hidden="true">{m.icon} </span>
                        {m.title}
                      </span>
                      {doneCount === total ? (
                        <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-emerald-500/20 text-[11px]" title="Module complete">
                          <span aria-hidden="true">{"✓"}</span>
                          <span className="sr-only">, complete</span>
                        </span>
                      ) : doneCount > 0 ? (
                        <span className="shrink-0 text-[11px] font-medium text-txt-dim bg-white/[0.06] rounded-full px-1.5 py-0.5">
                          <span className="sr-only">, </span>
                          {doneCount}/{total}
                          <span className="sr-only"> lessons done</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-[12px] text-txt-dim mt-[1px]">
                      {m.subtitle}
                    </span>
                    {doneCount > 0 && doneCount < total && (
                      <span className="block mt-1.5 h-[3px] rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
                        <span
                          className="block h-full rounded-full bg-brand-blue-light transition-all duration-500"
                          style={{ width: `${(doneCount / total) * 100}%` }}
                        />
                      </span>
                    )}
                  </button>
                  {isCurrentMod && (
                    <ul className="list-none m-0 p-0">
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
                              className={`py-1.5 pl-8 pr-4 text-[13.5px] flex items-center gap-2 no-underline ${
                                isCurrent
                                  ? "text-brand-green bg-emerald-500/[0.06]"
                                  : isDone
                                    ? "text-brand-green-light hover:bg-white/[0.03]"
                                    : "text-txt-muted hover:text-txt-secondary hover:bg-white/[0.03]"
                              }`}
                            >
                              <span className="text-[11px]" aria-hidden="true">
                                {isDone ? "✅" : isCurrent ? "▸" : "○"}
                              </span>
                              <span>{l.title}</span>
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
      ))}
      {completedCount > 0 && (
        <div className="px-4 pt-3 mt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onReset}
            className="bg-transparent border border-red-500/30 text-red-400 text-[12px] py-[5px] px-3 rounded-md cursor-pointer w-full font-sans hover:bg-red-500/10"
          >
            Reset Progress
          </button>
        </div>
      )}
    </nav>
  );
}

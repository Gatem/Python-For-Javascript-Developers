import { Lightbulb } from "lucide-react";
import InlineText from "./InlineText";

export default function TipsBox({ tips }) {
  if (!tips || !tips.length) return null;
  return (
    <aside
      aria-labelledby="tips-heading"
      className="rounded-2xl border border-warn/25 bg-warn/[0.06] p-5 dark:bg-warn/[0.05]"
    >
      <h3 id="tips-heading" className="m-0 mb-3 flex items-center gap-2 text-[14px] font-semibold text-text">
        <span className="flex size-7 items-center justify-center rounded-lg bg-warn/15 text-warn">
          <Lightbulb aria-hidden="true" size={15} />
        </span>
        Heads up
      </h3>
      <ul className="m-0 list-none space-y-2 p-0">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-text-2">
            <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-warn" />
            <span>
              <InlineText text={tip} />
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

import { LinkedinIcon } from "../ui/BrandIcons";
import { AUTHOR } from "../../config";

const initials = AUTHOR.name
  .split(" ")
  .filter((w) => /^[A-Z]/.test(w) && w.length > 2)
  .map((w) => w[0])
  .join("");

export default function AuthorCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-fg/8 bg-surface p-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-blue-500 text-[12px] font-semibold text-white"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] text-muted">Created by</div>
        <div className="truncate text-[13.5px] font-semibold text-text">{AUTHOR.name}</div>
      </div>
      <a
        href={AUTHOR.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label={`${AUTHOR.name} on LinkedIn (opens in a new tab)`}
        title="LinkedIn"
        className="inline-flex size-8 items-center justify-center rounded-lg text-[#0a66c2] dark:text-[#5aa9f6] hover:bg-fg/8 transition-colors"
      >
        <LinkedinIcon size={16} />
      </a>
    </div>
  );
}

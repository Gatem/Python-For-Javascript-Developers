import { Heart } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { AUTHOR, REPO_URL } from "../../config";

const link =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-text-2 no-underline hover:bg-fg/6 hover:text-text transition-colors";

export default function Footer() {
  return (
    <footer className="mt-14 flex flex-col items-center gap-3 border-t border-fg/8 pt-8 text-center text-[13px] text-muted sm:flex-row sm:justify-between sm:text-left">
      <p className="m-0 flex items-center gap-1.5">
        Built with <Heart aria-label="love" size={13} className="fill-rose-500 text-rose-500" /> by{" "}
        <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer" className="font-semibold text-text no-underline hover:text-accent-text">
          {AUTHOR.name}
        </a>
      </p>
      <div className="flex items-center gap-1">
        <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer" className={link}>
          <LinkedinIcon size={14} />
          LinkedIn
        </a>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className={link}>
          <GithubIcon size={14} />
          Source
        </a>
      </div>
    </footer>
  );
}

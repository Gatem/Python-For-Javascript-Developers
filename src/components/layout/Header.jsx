import { Menu, X, Moon, Sun, CircleHelp } from "lucide-react";
import LogoMark from "../ui/LogoMark";
import ActivityMeter from "../activity/ActivityMeter";
import ProgressRing from "../ui/ProgressRing";
import { GithubIcon } from "../ui/BrandIcons";
import { REPO_URL } from "../../config";
import { BASE } from "../../lib/routes";

const iconBtn =
  "size-9 items-center justify-center rounded-xl text-text-2 hover:text-text hover:bg-fg/8 cursor-pointer transition-colors";

export function Logo() {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <LogoMark size={34} className="shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold tracking-tight text-text">
          Python <span className="font-serif text-[17px] font-normal italic text-muted">for</span> JS Developers
        </span>
        <span className="hidden truncate text-[12px] text-muted md:block">
          Learn Python through what you already know
        </span>
      </span>
    </span>
  );
}

export default function Header({
  activity,
  theme,
  onToggleTheme,
  menuOpen,
  onMenu,
  onHome,
  onShowTour,
  completedCount,
  totalLessons,
}) {
  const pct = totalLessons ? completedCount / totalLessons : 0;
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-fg/8 bg-bg/75 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60">
      <div className="flex h-full items-center gap-3 px-3 sm:px-5">
        <button
          type="button"
          onClick={onMenu}
          aria-label={menuOpen ? "Close lesson menu" : "Open lesson menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-lesson-menu"
          className={`inline-flex md:hidden ${iconBtn}`}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <a
          href={BASE}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            onHome();
          }}
          className="min-w-0 rounded-xl no-underline"
          aria-label="Python for JS Developers, home page"
        >
          <Logo />
        </a>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div
              className="hidden md:flex items-center gap-2 rounded-full border border-fg/10 bg-surface/70 py-1 pl-1 pr-3 text-[12.5px] text-text-2"
              title="Course progress"
            >
              <ProgressRing value={pct} size={26} stroke={3} />
              <span>
                <span className="font-semibold text-text">{completedCount}</span>/{totalLessons}
                <span className="sr-only"> lessons completed</span>
              </span>
            </div>
          <ActivityMeter activity={activity} />
          <button
            type="button"
            onClick={onShowTour}
            className={`inline-flex ${iconBtn}`}
            aria-label="Show the quick tour"
            title="Quick tour"
          >
            <CircleHelp size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`inline-flex ${iconBtn}`}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={`hidden sm:inline-flex ${iconBtn}`}
            aria-label="Source code on GitHub (opens in a new tab)"
            title="View on GitHub"
          >
            <GithubIcon size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}

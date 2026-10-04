import { Menu, X, Moon, Sun } from "lucide-react";
import ActivityMeter from "../activity/ActivityMeter";
import ProgressRing from "../ui/ProgressRing";
import { GithubIcon } from "../ui/BrandIcons";
import { REPO_URL } from "../../config";

const iconBtn =
  "size-9 items-center justify-center rounded-xl text-text-2 hover:text-text hover:bg-fg/8 cursor-pointer transition-colors";

export function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      <span
        aria-hidden="true"
        className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 via-teal-500 to-blue-500 font-mono text-[13px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(16,185,129,0.6)]"
      >
        py
        <span className="absolute -right-1 -bottom-1 rounded-md bg-amber-400 px-1 text-[8px] leading-[14px] font-bold text-amber-950">
          JS
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold tracking-tight text-text">
          Python for JS Developers
        </span>
        {!compact && (
          <span className="block truncate text-[12px] text-muted">
            Learn Python through what you already know
          </span>
        )}
      </span>
    </span>
  );
}

export default function Header({
  activity,
  theme,
  onToggleTheme,
  isMobile,
  menuOpen,
  onMenu,
  completedCount,
  totalLessons,
}) {
  const pct = totalLessons ? completedCount / totalLessons : 0;
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-fg/8 bg-bg/75 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60">
      <div className="flex h-full items-center gap-3 px-3 sm:px-5">
        {isMobile && (
          <button
            type="button"
            onClick={onMenu}
            aria-label={menuOpen ? "Close lesson menu" : "Open lesson menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-lesson-menu"
            className={`inline-flex ${iconBtn}`}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        )}
        <div className="min-w-0">
          <Logo compact={isMobile} />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {!isMobile && (
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
          )}
          <ActivityMeter activity={activity} />
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

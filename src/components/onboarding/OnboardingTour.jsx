import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Eye,
  Flame,
  Lightbulb,
  NotebookPen,
  Play,
  Plus,
  Quote,
  X,
} from "lucide-react";
import ProgressRing from "../ui/ProgressRing";
import LogoMark from "../ui/LogoMark";

const kbd = "rounded-md border border-fg/15 bg-surface px-1.5 py-px font-mono text-[11.5px] text-text-2";

function Visual({ children }) {
  return (
    <div aria-hidden="true" className="relative flex h-[190px] items-center justify-center overflow-hidden border-b border-fg/8 bg-surface-2/70">
      <div className="grid-lines absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}

const STEPS = [
  {
    title: "Welcome! Here is how a lesson works",
    body: (
      <>
        Every lesson follows the same path: a short explanation, a <b>quick reference</b> table, the{" "}
        <b>heads up</b> traps, both languages <b>side by side</b>, and finally an <b>exercise</b>.
      </>
    ),
    visual: (
      <div className="flex w-[300px] flex-col gap-1.5">
        {[
          ["Explanation", BookOpen, "w-full"],
          ["Quick reference", null, "w-[88%]"],
          ["Heads up", Lightbulb, "w-[76%]"],
          ["Side by side", null, "w-[92%]"],
          ["Exercise", Play, "w-[82%]"],
        ].map(([label, Icon, w], i) => (
          <div
            key={label}
            className={`pop flex items-center gap-2 rounded-lg border border-fg/10 bg-surface px-3 py-1.5 text-[12px] font-medium text-text-2 shadow-card ${w}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="font-mono text-[10.5px] text-muted">0{i + 1}</span>
            {Icon && <Icon size={12} className="text-accent" />}
            {label}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Run your code, then check it",
    body: (
      <>
        <b>Run</b> executes your code with real Python and shows the output. <b>Check solution</b> also runs hidden
        tests; pass them and the lesson is complete. Shortcuts: <kbd className={kbd}>Ctrl</kbd>+
        <kbd className={kbd}>Enter</kbd> to run, add <kbd className={kbd}>Shift</kbd> to check. The very first run
        downloads Python once.
      </>
    ),
    visual: (
      <div className="w-[320px]">
        <div className="mb-2.5 flex gap-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12.5px] font-semibold text-accent-fg">
            <Check size={14} /> Check solution
          </span>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-fg/12 bg-surface px-3 text-[12.5px] font-medium text-text">
            <Play size={13} /> Run
          </span>
        </div>
        <div className="terminal pop rounded-xl bg-[var(--t-bg)] p-3 font-mono text-[12px] leading-[1.7] text-[var(--t-text)] shadow-card">
          <div className="text-[var(--t-dim)]">
            <span className="text-[var(--t-ok)]">$</span> python solution.py
          </div>
          <div>John scored 95</div>
          <div className="text-[var(--t-ok)]">✓ All checks and hidden tests passed</div>
        </div>
      </div>
    ),
  },
  {
    title: "Stuck? Use a hint first",
    body: (
      <>
        <b>Hint</b> gives you a nudge without spoiling the answer. <b>Answer</b> shows a reference solution, but any
        correct solution passes the tests, not just that one.
      </>
    ),
    visual: (
      <div className="w-[320px]">
        <div className="mb-2.5 flex justify-end gap-1.5">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fg/6 px-3 text-[12.5px] font-medium text-text">
            <Lightbulb size={13} /> Hint
          </span>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] text-text-2">
            <Eye size={13} /> Answer
          </span>
        </div>
        <div className="pop flex gap-2.5 rounded-xl border border-info/25 bg-info/[0.08] px-3.5 py-3 text-[12.5px] leading-relaxed text-text-2">
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-info" />
          Python has no .push(). Look for the list method that adds one item to the end.
        </div>
      </div>
    ),
  },
  {
    title: "Take notes as you learn",
    body: (
      <>
        Open <b>Notes</b> (the panel on the right, or the <NotebookPen size={13} className="inline -mt-0.5" /> button
        on small screens) and press <b>+</b> to write a note. Or <b>select any sentence</b> in a lesson and click{" "}
        <b>Quote in notes</b> to save it with a reference. Notes are kept per lesson.
      </>
    ),
    visual: (
      <div className="w-[330px]">
        <p className="m-0 text-[13px] leading-relaxed text-text-2">
          Python&apos;s list is your JS array, but{" "}
          <span className="relative rounded-sm bg-info/25 px-0.5 text-text">
            it is .append(), not .push()
            <span className="pop absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-lg bg-text px-2.5 py-1.5 text-[11.5px] font-semibold text-bg shadow-card">
              <Quote size={11} /> Quote in notes
            </span>
          </span>
          , and slicing is built in.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-fg/10 bg-surface px-3 py-2 shadow-card">
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-text">
            <NotebookPen size={14} className="text-info" /> Notes
          </span>
          <span className="flex size-6 items-center justify-center rounded-md bg-info/15 text-info">
            <Plus size={14} />
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Your progress is saved automatically",
    body: (
      <>
        Passing an exercise completes the lesson. Finish <b>2 lessons a day</b> to build a streak. Everything is saved
        in this browser, with no account needed, and every lesson has its own link you can bookmark.
      </>
    ),
    visual: (
      <div className="flex items-center gap-6">
        <ProgressRing value={0.36} size={92} stroke={8}>
          <span className="text-[18px] font-semibold text-text">36%</span>
        </ProgressRing>
        <div className="space-y-2 text-[13px] text-text-2">
          <div className="pop flex items-center gap-2" style={{ animationDelay: "80ms" }}>
            <CircleCheck size={16} className="text-accent" /> 12 of 33 lessons
          </div>
          <div className="pop flex items-center gap-2" style={{ animationDelay: "160ms" }}>
            <Flame size={16} className="fill-orange-500/30 text-orange-500" /> 5 day streak
          </div>
          <div className="pop flex items-center gap-2" style={{ animationDelay: "240ms" }}>
            <LogoMark size={16} /> Saved in your browser
          </div>
        </div>
      </div>
    ),
  },
];

// First-visit walkthrough of the lesson UI. Reopen it from the header.
export default function OnboardingTour({ onClose }) {
  const [step, setStep] = useState(0);
  const primaryRef = useRef(null);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  useEffect(() => {
    const previous = document.activeElement;
    return () => {
      if (previous instanceof HTMLElement && document.contains(previous)) previous.focus();
    };
  }, []);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setStep((n) => Math.min(n + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft") setStep((n) => Math.max(n - 1, 0));
      if (e.key === "Tab") {
        const items = document.querySelectorAll("[data-tour] button");
        const first = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm transition-all duration-300 starting:bg-black/0">
      <div
        data-tour
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="relative w-full max-w-[540px] overflow-hidden rounded-[26px] border border-fg/10 bg-surface shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] transition-all duration-500 starting:translate-y-4 starting:scale-[0.97] starting:opacity-0"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the tour"
          className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-fg/8 hover:text-text cursor-pointer"
        >
          <X size={17} aria-hidden="true" />
        </button>

        <div key={step}>
          <Visual>{s.visual}</Visual>
          <div className="px-6 pb-2 pt-6 sm:px-8">
            <p className="m-0 mb-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted">
              Quick tour · {step + 1} of {STEPS.length}
            </p>
            <h2 id="tour-title" className="m-0 text-[21px] font-semibold tracking-tight text-text">
              {s.title}
            </h2>
            <p id="tour-body" className="m-0 mt-2.5 text-[14.5px] leading-[1.7] text-text-2">
              {s.body}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-5 sm:px-8">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-5 bg-accent" : "w-1.5 bg-fg/20"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step === 0 ? (
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl px-4 text-[14px] text-muted hover:bg-fg/6 hover:text-text cursor-pointer"
              >
                Skip
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[14px] text-text-2 hover:bg-fg/6 hover:text-text cursor-pointer"
              >
                <ArrowLeft size={15} aria-hidden="true" /> Back
              </button>
            )}
            <button
              ref={primaryRef}
              type="button"
              onClick={() => (last ? onClose() : setStep(step + 1))}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-accent px-4 text-[14px] font-semibold text-accent-fg hover:bg-accent-strong cursor-pointer dark:hover:bg-accent-text"
            >
              {last ? "Start learning" : "Next"}
              {!last && <ArrowRight size={15} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

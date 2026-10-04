import { useEffect, useRef, useState } from "react";
import { CircleCheck } from "lucide-react";
import { HighlightedLines } from "../ui/Code";

const EXAMPLES = [
  {
    label: "filter + map",
    js: `const active = users
  .filter((u) => u.active)
  .map((u) => u.name);
console.log(\`\${active.length} active\`);`,
    py: `active = [u["name"] for u in users if u["active"]]
print(f"{len(active)} active")`,
  },
  {
    label: "safe defaults",
    js: `const city = user?.address?.city ?? "Unknown";
if (city === null) throw new Error("No city");`,
    py: `city = user.get("address", {}).get("city", "Unknown")
if city is None:
    raise ValueError("No city")`,
  },
  {
    label: "classes",
    js: `class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}`,
    py: `@dataclass
class Point:
    x: float
    y: float`,
  },
  {
    label: "async",
    js: `const [a, b] = await Promise.all([
  fetchUser(1),
  fetchUser(2),
]);`,
    py: `a, b = await asyncio.gather(
    fetch_user(1),
    fetch_user(2),
)`,
  },
];

const TYPE_MS = 26;
const HOLD_MS = 2600;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Hero visual: a JavaScript snippet that gets "typed out" as Python.
// Purely decorative; screen readers get a short description instead.
export default function TranslatorDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [paused, setPaused] = useState(false);
  const cardRef = useRef(null);
  const ex = EXAMPLES[index];
  const done = typed >= ex.py.length;

  // Pause while off-screen or when the tab is hidden.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const reduced = prefersReducedMotion();
    if (!done) {
      const t = setTimeout(
        () => setTyped(reduced ? ex.py.length : (n) => n + (ex.py[n] === " " ? 2 : 1)),
        reduced ? 0 : TYPE_MS,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % EXAMPLES.length);
      setTyped(0);
    }, reduced ? HOLD_MS * 2 : HOLD_MS);
    return () => clearTimeout(t);
  }, [typed, done, paused, ex]);

  const select = (i) => {
    setIndex(i);
    setTyped(0);
  };

  return (
    <div ref={cardRef} className="relative min-w-0">
      {/* soft light under the card */}
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[40px] bg-linear-to-br from-amber-400/10 via-transparent to-emerald-400/15 blur-2xl" />
      <div
        role="img"
        aria-label="Animated example: JavaScript code being translated into the equivalent Python."
        className="overflow-hidden rounded-[22px] border border-fg/10 bg-surface/90 shadow-[0_30px_80px_-30px_rgba(2,6,23,0.45)] backdrop-blur"
      >
        <div aria-hidden="true" className="flex items-center justify-between border-b border-fg/8 px-4 py-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-muted">
            <span className="size-1.5 rounded-full bg-js" /> app.js
            <span className="mx-1.5 text-fg/25">→</span>
            <span className="size-1.5 rounded-full bg-py" /> app.py
          </div>
          <span className="rounded-full border border-fg/10 px-2 py-0.5 font-mono text-[11px] text-muted">{ex.label}</span>
        </div>

        <div aria-hidden="true" className="font-mono text-[12.5px] leading-[1.75] sm:text-[13px]">
          <pre className="m-0 min-h-[136px] overflow-hidden max-sm:whitespace-pre-wrap max-sm:break-words bg-js/[0.035] px-5 py-4 text-text">
            <code>
              <HighlightedLines code={ex.js} lang="js" />
            </code>
          </pre>
          <div className="relative flex items-center gap-3 border-y border-fg/8 px-5 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-muted">
            <span className="h-px flex-1 bg-fg/10" />
            <span className="font-sans">in Python</span>
            <span className="h-px flex-1 bg-fg/10" />
          </div>
          <pre className="m-0 min-h-[136px] overflow-hidden max-sm:whitespace-pre-wrap max-sm:break-words bg-py/[0.04] px-5 py-4 text-text">
            <code>
              <HighlightedLines code={ex.py.slice(0, typed)} lang="py" />
              {!done && <span className="caret ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-accent" />}
            </code>
          </pre>
        </div>

        <div aria-hidden="true" className="flex items-center justify-between gap-3 border-t border-fg/8 px-4 py-2.5">
          <div className="h-5">
            {done && (
              <span key={index} className="pop inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-text">
                <CircleCheck size={14} /> Same result, fewer lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {EXAMPLES.map((e, i) => (
              <button
                key={e.label}
                type="button"
                tabIndex={-1}
                aria-label={`Show the ${e.label} example`}
                onClick={() => select(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === index ? "w-5 bg-accent" : "w-1.5 bg-fg/20 hover:bg-fg/40"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

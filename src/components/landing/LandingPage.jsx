import { useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Moon,
  Sun,
  Plus,
  NotebookPen,
  Flame,
  SunMoon,
  Keyboard,
  Link2,
  Scale,
} from "lucide-react";
import { courseModules, lessonList, TIERS } from "../../data";
import { useReveal } from "../../hooks/useReveal";
import { AUTHOR, REPO_URL } from "../../config";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { ModuleIcon } from "../ui/moduleIcons";
import { linkProps } from "../../lib/routes";
import { HighlightedLines } from "../ui/Code";
import LogoMark from "../ui/LogoMark";
import TranslatorDemo from "./TranslatorDemo";
import { AUTHOR_PHOTO } from "../../assets/authorPhoto";

const MAPPINGS = [
  [".push(x)", ".append(x)"],
  ["===", "=="],
  ["null", "None"],
  ["arr.length", "len(arr)"],
  ["`Hi ${name}`", 'f"Hi {name}"'],
  ["else if", "elif"],
  ["&& || !", "and or not"],
  ["catch (e)", "except E as e"],
  ["throw", "raise"],
  ["this", "self"],
  ["arr.map(fn)", "[fn(x) for x in arr]"],
  ["Promise.all", "asyncio.gather"],
  ["constructor", "__init__"],
  ["obj?.a ?? b", 'obj.get("a", b)'],
  ["console.log", "print"],
  ["npm install", "uv add"],
];

const TIER_BLURBS = {
  1: "Syntax, data structures and loops: the part you will use every single day.",
  2: "Functions, classes, modules, and the gotchas that trip up JavaScript developers.",
  3: "Files, generators, modern typing, async and testing: what real projects need.",
  4: "The idioms and tooling that make your code look like a Python developer wrote it.",
};

const FAQ = [
  [
    "Do I need to install Python?",
    "No. Exercises run on real Python (Pyodide, compiled to WebAssembly) inside your browser. The first run downloads the runtime once; after that it is instant.",
  ],
  [
    "How are my answers checked?",
    "Two layers. Quick static checks catch JavaScript habits like console.log or ===. Then your code runs together with hidden tests that check what it actually does, so any correct solution passes, not just the reference one.",
  ],
  [
    "Who is this for?",
    "Developers who are comfortable with JavaScript or TypeScript and want to become productive in Python quickly. It is not an intro to programming.",
  ],
  [
    "Where is my progress saved?",
    "In your own browser. There is no account, no sign-up and no tracking. Clearing your site data resets it.",
  ],
  [
    "Which Python version does it teach?",
    "Modern Python: the lessons target 3.12 and newer, and the in-browser runtime is Python 3.14.",
  ],
  ["Is it free?", "Yes. Free and open source under the MIT license."],
];

const EXTRAS = [
  [NotebookPen, "Notes and quotes", "Write notes per lesson, or select any sentence to quote it."],
  [Flame, "Streaks and goals", "A small daily goal and a streak to keep you coming back."],
  [SunMoon, "Light and dark", "Follows your system theme, switchable any time."],
  [Keyboard, "Keyboard friendly", "Run and check with shortcuts, accessible to screen readers."],
  [Link2, "Deep links", "Every lesson has its own URL you can bookmark or share."],
  [Scale, "Open source", "MIT licensed. Read the code, suggest a fix, fork it."],
];

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function SectionLabel({ num, children }) {
  return (
    <div data-reveal className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
      <span className="text-text">{num}</span>
      <span className="mx-2 text-fg/25">/</span>
      {children}
    </div>
  );
}

function Chip({ kind, children }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[12.5px] ${
        kind === "js" ? "bg-js/10 text-js" : "bg-py/10 text-py"
      }`}
    >
      {children}
    </span>
  );
}

function Nav({ theme, onToggleTheme, onStart, ctaLabel }) {
  const link = "rounded-lg px-3 py-1.5 text-[14px] text-text-2 hover:text-text hover:bg-fg/6 cursor-pointer transition-colors";
  const icon = "inline-flex size-9 items-center justify-center rounded-xl text-text-2 hover:text-text hover:bg-fg/8 cursor-pointer transition-colors";
  return (
    <header className="sticky top-0 z-40 border-b border-fg/6 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <LogoMark size={32} />
          <span className="text-[15px] font-semibold tracking-tight text-text">
            Python <span className="font-serif text-[17px] font-normal italic text-muted">for</span> JS Developers
          </span>
        </span>
        <nav aria-label="Page sections" className="ml-6 hidden items-center gap-1 md:flex">
          <button type="button" className={link} onClick={() => scrollToId("how")}>How it works</button>
          <button type="button" className={link} onClick={() => scrollToId("curriculum")}>Curriculum</button>
          <button type="button" className={link} onClick={() => scrollToId("faq")}>FAQ</button>
          <button type="button" className={link} onClick={() => scrollToId("creator")}>Creator</button>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className={icon}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={`hidden sm:inline-flex ${icon}`} aria-label="Source code on GitHub (opens in a new tab)">
            <GithubIcon size={18} />
          </a>
          <button
            type="button"
            onClick={onStart}
            className="ml-1 hidden h-9 items-center gap-1.5 rounded-xl bg-text px-3.5 text-[13.5px] font-medium text-bg hover:opacity-90 cursor-pointer sm:inline-flex"
          >
            {ctaLabel} <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart, ctaLabel, resumeTitle, stats }) {
  const d = (ms) => ({ animationDelay: `${ms}ms` });
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10" />
      <div className="[&>*]:min-w-0 mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24">
        <div>
          <p className="rise m-0 mb-6 inline-flex items-center gap-2 rounded-full border border-fg/10 bg-surface/70 py-1 pl-1 pr-3 font-mono text-[12px] text-muted" style={d(0)}>
            <span className="rounded-full bg-text px-2 py-0.5 font-sans text-[11px] font-semibold text-bg">Free</span>
            a Python course for JavaScript developers
          </p>
          <h1
            className="rise m-0 text-balance text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-text sm:text-[58px] lg:text-[66px]"
            style={d(80)}
          >
            Learn Python{" "}
            <span className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em] text-accent-text">through</span>{" "}
            the JavaScript you already know.
          </h1>
          <p className="rise m-0 mt-6 max-w-[33rem] text-[17.5px] leading-[1.65] text-text-2" style={d(180)}>
            Side-by-side lessons that map every Python idea to its JS twin, flag the habits that will bite you,
            and check your code with real Python running in your browser.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-3" style={d(280)}>
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-6 text-[15px] font-semibold text-accent-fg shadow-[0_12px_30px_-12px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-px hover:bg-accent-strong cursor-pointer dark:hover:bg-accent-text"
            >
              {ctaLabel}
              <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToId("curriculum")}
              className="inline-flex h-12 items-center rounded-2xl border border-fg/12 bg-surface/60 px-5 text-[15px] font-medium text-text hover:border-fg/25 cursor-pointer transition-colors"
            >
              See the curriculum
            </button>
          </div>
          {resumeTitle && (
            <p className="rise m-0 mt-3 text-[13px] text-muted" style={d(320)}>
              Up next: <span className="text-text-2">{resumeTitle}</span>
            </p>
          )}
          <dl className="rise mt-12 grid max-w-[30rem] grid-cols-3 gap-6 border-t border-fg/8 pt-6" style={d(380)}>
            {stats.map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="m-0 text-[28px] font-semibold tracking-tight text-text">{value}</dd>
                <dd aria-hidden="true" className="m-0 text-[13px] text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rise" style={d(250)}>
          <TranslatorDemo />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MAPPINGS, ...MAPPINGS];
  return (
    <div aria-hidden="true" className="marquee relative overflow-hidden border-y border-fg/8 bg-surface/40 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-bg to-transparent" />
      <div className="marquee-track flex w-max items-center gap-10">
        {items.map(([js, py], i) => (
          <span key={i} className="flex items-center gap-2.5">
            <Chip kind="js">{js}</Chip>
            <ArrowRight size={13} className="text-muted" />
            <Chip kind="py">{py}</Chip>
          </span>
        ))}
      </div>
    </div>
  );
}

function Why() {
  const points = [
    ["Mapped to what you know", "Every concept starts from its JavaScript equivalent. Arrays become lists, objects become dicts, Promise.all becomes asyncio.gather."],
    ["The traps, called out", "Empty arrays that are falsy, mutable default arguments, is versus ==. The habits that quietly break Python code get flagged before they cost you an afternoon."],
    ["Real code, really checked", "Exercises run on real Python in your browser. Hidden tests check what your code does, so any correct solution passes."],
  ];
  return (
    <section id="why" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-[200px_1fr]">
        <SectionLabel num="01">Why</SectionLabel>
        <div>
          <h2 data-reveal className="m-0 max-w-[44rem] text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-text sm:text-[44px]">
            You don&apos;t need another beginner course. You need a{" "}
            <span className="font-serif font-normal italic text-accent-text">translation</span>.
          </h2>
          <div className="[&>*]:min-w-0 mt-14 grid gap-10 sm:grid-cols-3">
            {points.map(([title, body], i) => (
              <div key={title} data-reveal style={{ "--reveal-delay": `${i * 110}ms` }} className="border-t border-fg/12 pt-5">
                <div className="mb-3 font-mono text-[12px] text-muted">0{i + 1}</div>
                <h3 className="m-0 mb-2 text-[17px] font-semibold text-text">{title}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-text-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const card = "flex h-full flex-col rounded-[22px] border border-fg/10 bg-surface p-5 shadow-card [&>*:last-child]:mt-auto";
  const step = (n, title, body) => (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2 font-mono text-[12px] text-muted">
        <span className="flex size-6 items-center justify-center rounded-full border border-fg/15 text-text">{n}</span>
        Step {n}
      </div>
      <h3 className="m-0 mb-1.5 text-[18px] font-semibold text-text">{title}</h3>
      <p className="m-0 text-[14.5px] leading-relaxed text-text-2">{body}</p>
    </div>
  );
  return (
    <section id="how" className="scroll-mt-20 border-y border-fg/8 bg-surface-2/40">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-[200px_1fr]">
          <SectionLabel num="02">How it works</SectionLabel>
          <div>
            <h2 data-reveal className="m-0 max-w-[40rem] text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-text sm:text-[44px]">
              Read it. Write it.{" "}
              <span className="font-serif font-normal italic text-accent-text">Run it.</span>
            </h2>
            <p data-reveal className="m-0 mt-4 max-w-[36rem] text-[16.5px] leading-relaxed text-text-2">
              Every lesson follows the same short loop, so you spend your time on Python, not on figuring out the course.
            </p>
            <div className="[&>*]:min-w-0 mt-14 grid gap-5 lg:grid-cols-3">
              <div data-reveal className={card}>
                {step(1, "Read the comparison", "The idea in plain words, a quick-reference table and both languages side by side.")}
                <div className="space-y-2 rounded-xl border border-fg/8 bg-bg/60 p-3">
                  {[[".push(x)", ".append(x)"], ["arr.at(-1)", "arr[-1]"], ["arr.slice(1, 3)", "arr[1:3]"]].map(([a, b]) => (
                    <div key={a} className="flex items-center gap-2">
                      <Chip kind="js">{a}</Chip>
                      <ArrowRight size={12} aria-hidden="true" className="text-muted" />
                      <Chip kind="py">{b}</Chip>
                    </div>
                  ))}
                </div>
              </div>
              <div data-reveal style={{ "--reveal-delay": "110ms" }} className={card}>
                {step(2, "Write the Python", "A focused exercise with an editor that highlights as you type. Hints when you are stuck.")}
                <pre aria-hidden="true" className="m-0 overflow-hidden rounded-xl border border-fg/8 bg-code p-3 font-mono text-[12.5px] leading-[1.7] text-text">
                  <code>
                    <HighlightedLines code={'fruits = ["apple", "fig"]\nfruits.append("kiwi")\nprint(fruits[-1])'} lang="py" />
                  </code>
                </pre>
              </div>
              <div data-reveal style={{ "--reveal-delay": "220ms" }} className={card}>
                {step(3, "Get checked for real", "Your code runs on Python 3.14 in the browser, with hidden tests for the result.")}
                <div aria-hidden="true" className="terminal rounded-xl bg-[var(--t-bg)] p-3 font-mono text-[12.5px] leading-[1.8] text-[var(--t-text)]">
                  <div className="text-[var(--t-dim)]"><span className="text-[var(--t-ok)]">$</span> check solution</div>
                  <div className="text-[var(--t-text)]">kiwi</div>
                  <div className="text-[var(--t-ok)]">✓ all hidden tests passed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Curriculum({ done, onStart }) {
  const tiers = Object.keys(TIERS).map(Number);
  let num = 0;
  return (
    <section id="curriculum" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-[200px_1fr]">
        <SectionLabel num="03">Curriculum</SectionLabel>
        <div>
          <h2 data-reveal className="m-0 max-w-[44rem] text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-text sm:text-[44px]">
            From <span className="font-mono text-[0.8em] font-medium text-py">print()</span> to the tooling real teams{" "}
            <span className="font-serif font-normal italic text-accent-text">ship with</span>.
          </h2>
          <div className="mt-14 space-y-12">
            {tiers.map((tier) => {
              const mods = courseModules.filter((m) => (m.tier || 1) === tier);
              if (!mods.length) return null;
              return (
                <div key={tier} className="grid gap-5 md:grid-cols-[240px_1fr] md:gap-10">
                  <div data-reveal>
                    <h3 className="m-0 text-[19px] font-semibold text-text">{TIERS[tier].label}</h3>
                    <p className="m-0 mt-1.5 text-[14px] leading-relaxed text-muted">{TIER_BLURBS[tier]}</p>
                  </div>
                  <ul className="m-0 list-none divide-y divide-fg/8 border-y border-fg/8 p-0">
                    {mods.map((m) => {
                      num += 1;
                      const total = m.lessons.length;
                      const doneCount = m.lessons.filter((l) => done[`${m.id}/${l.id}`]).length;
                      return (
                        <li
                          key={m.id}
                          data-reveal
                          className="group relative grid grid-cols-[34px_1fr_auto] items-start gap-4 px-1 py-4 sm:grid-cols-[34px_36px_1fr_auto_20px]"
                        >
                          <span className="pt-0.5 font-mono text-[12.5px] text-muted">{String(num).padStart(2, "0")}</span>
                          <span className="hidden size-9 items-center justify-center rounded-xl border border-fg/10 bg-surface text-text-2 transition-colors group-hover:border-accent/40 group-hover:text-accent sm:flex">
                            <ModuleIcon id={m.id} size={17} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="m-0 text-[16px] font-medium">
                              {/* Stretched link: the whole row opens the module's first lesson. */}
                              <a
                                {...linkProps(`${m.id}/${m.lessons[0].id}`, onStart)}
                                className="text-text no-underline transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text"
                              >
                                {m.title}
                              </a>
                            </h4>
                            <p className="m-0 text-[13.5px] text-muted">{m.subtitle}</p>
                            <ul className="relative z-10 m-0 mt-2 hidden list-none flex-wrap gap-x-1 gap-y-1 p-0 sm:flex">
                              {m.lessons.map((l) => (
                                <li key={l.id}>
                                  <a
                                    {...linkProps(`${m.id}/${l.id}`, onStart)}
                                    className="rounded-md px-1.5 py-0.5 text-[12.5px] text-text-2 no-underline hover:bg-fg/6 hover:text-text"
                                  >
                                    {done[`${m.id}/${l.id}`] && <span className="mr-1 text-accent">✓</span>}
                                    {l.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <span className="pt-0.5 text-right text-[13px] text-muted">
                            {doneCount > 0 ? (
                              <span className="text-accent-text">
                                {doneCount}/{total} done
                              </span>
                            ) : (
                              `${total} lessons`
                            )}
                          </span>
                          <ArrowUpRight
                            size={17}
                            aria-hidden="true"
                            className="mt-0.5 hidden text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:block"
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="[&>*]:min-w-0 mt-20 grid gap-x-10 gap-y-7 border-t border-fg/8 pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {EXTRAS.map(([Icon, title, body], i) => (
              <div key={title} data-reveal style={{ "--reveal-delay": `${(i % 3) * 90}ms` }} className="flex gap-3.5">
                {Icon && <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />}
                <div>
                  <h3 className="m-0 text-[15px] font-semibold text-text">{title}</h3>
                  <p className="m-0 mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-fg/8">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-[200px_1fr]">
          <SectionLabel num="04">FAQ</SectionLabel>
          <div>
            <h2 data-reveal className="m-0 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-text sm:text-[44px]">
              Questions, <span className="font-serif font-normal italic text-accent-text">answered</span>.
            </h2>
            <div className="mt-12 divide-y divide-fg/8 border-y border-fg/8">
              {FAQ.map(([q, a]) => (
                <details key={q} data-reveal className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[17px] font-medium text-text [&::-webkit-details-marker]:hidden">
                    {q}
                    <Plus size={18} aria-hidden="true" className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="m-0 max-w-[44rem] pb-5 text-[15.5px] leading-relaxed text-text-2">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Creator() {
  return (
    <section id="creator" className="scroll-mt-20 border-t border-fg/8 bg-surface-2/40">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-[200px_1fr]">
          <SectionLabel num="05">The creator</SectionLabel>
          <div data-reveal className="[&>*]:min-w-0 grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
            <div className="relative mx-auto md:mx-0">
              <div aria-hidden="true" className="absolute -inset-4 rounded-[42px] bg-linear-to-br from-amber-400/35 via-transparent to-emerald-400/40 blur-2xl" />
              <div className="relative size-40 sm:size-48">
                <img
                  src={AUTHOR_PHOTO}
                  alt={AUTHOR.name}
                  width={192}
                  height={192}
                  className="size-full rounded-[34px] border border-fg/10 object-cover shadow-card"
                />
                <span className="absolute -bottom-3 -right-3 rounded-2xl border border-fg/10 bg-surface p-2 shadow-card">
                  <LogoMark size={34} />
                </span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="m-0 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Designed and built by</p>
              <h2 className="m-0 mt-2 font-serif text-[46px] font-normal italic leading-none tracking-[-0.01em] text-text sm:text-[60px]">
                {AUTHOR.name}
              </h2>
              <p className="m-0 mx-auto mt-5 max-w-[36rem] text-[16.5px] leading-relaxed text-text-2 md:mx-0">{AUTHOR.intro}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <a
                  href={AUTHOR.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0a66c2] px-5 text-[14.5px] font-semibold text-white no-underline shadow-[0_10px_24px_-10px_rgba(10,102,194,0.8)] transition-transform hover:-translate-y-px"
                >
                  <LinkedinIcon size={16} /> Connect on LinkedIn
                </a>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-fg/12 bg-surface px-5 text-[14.5px] font-medium text-text no-underline transition-colors hover:border-fg/25"
                >
                  <GithubIcon size={16} /> Star the repo
                </a>
              </div>
              <p className="m-0 mt-4 text-[13px] text-muted">
                <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer" className="text-muted underline decoration-fg/20 underline-offset-4 hover:text-text">
                  {AUTHOR.linkedin.replace(/^https:\/\/(www\.)?/, "")}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ onStart, ctaLabel }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10" />
      <div data-reveal className="mx-auto max-w-[900px] px-5 py-28 text-center sm:px-8 sm:py-36">
        <h2 className="m-0 text-balance text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-text sm:text-[56px]">
          Your next language is a{" "}
          <span className="font-serif font-normal italic text-accent-text">translation</span> away.
        </h2>
        <button
          type="button"
          onClick={onStart}
          className="group mt-10 inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-7 text-[15px] font-semibold text-accent-fg shadow-[0_12px_30px_-12px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-px hover:bg-accent-strong cursor-pointer dark:hover:bg-accent-text"
        >
          {ctaLabel}
          <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-fg/8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-5 py-8 text-[13px] text-muted sm:flex-row sm:px-8">
        <div className="flex items-center gap-2.5">
          <LogoMark size={22} />
          <span>
            © {new Date().getFullYear()} {AUTHOR.name} · MIT License
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted no-underline hover:text-text">
            <LinkedinIcon size={14} /> LinkedIn
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted no-underline hover:text-text">
            <GithubIcon size={14} /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ theme, onToggleTheme, onStart, currentEntry, completedCount, done }) {
  const rootRef = useRef(null);
  useReveal(rootRef);

  useEffect(() => {
    document.title = "Python for JS Developers · Learn Python through the JavaScript you know";
  }, []);

  const hasProgress = completedCount > 0;
  const ctaLabel = hasProgress ? "Continue learning" : "Start learning";
  const start = () => onStart(hasProgress ? currentEntry.key : lessonList[0].key);
  const stats = [
    [String(lessonList.length), "lessons"],
    [String(courseModules.length), "modules"],
    ["0", "installs needed"],
  ];

  return (
    <div ref={rootRef} className="min-h-screen font-sans text-text">
      <Nav theme={theme} onToggleTheme={onToggleTheme} onStart={start} ctaLabel={ctaLabel} />
      <main id="lesson-main" tabIndex={-1} className="outline-none">
        <Hero onStart={start} ctaLabel={ctaLabel} resumeTitle={hasProgress ? currentEntry.lesson.title : null} stats={stats} />
        <Marquee />
        <Why />
        <HowItWorks />
        <Curriculum done={done} onStart={onStart} />
        <Faq />
        <Creator />
        <FinalCta onStart={start} ctaLabel={ctaLabel} />
      </main>
      <LandingFooter />
    </div>
  );
}

import { useEffect, useRef } from "react";
import { Clock, CircleCheck, ChevronRight } from "lucide-react";
import LessonContent from "./LessonContent";
import DiffTable from "./DiffTable";
import TipsBox from "./TipsBox";
import CodeComparison from "./CodeComparison";
import LessonNav from "./LessonNav";
import Footer from "../layout/Footer";
import ExercisePanel from "../exercise/ExercisePanel";
import { ModuleIcon } from "../ui/moduleIcons";

function readingMinutes(lesson) {
  const words = [lesson.content, ...lesson.tips].join(" ").split(/\s+/).length;
  return Math.max(2, Math.round(words / 200) + 2); // + time for code and exercise
}

export default function LessonView({
  mod,
  lesson,
  lessonKey,
  prev,
  next,
  isDone,
  onNext,
  onGo,
  code,
  onCodeChange,
  exercise,
  quotes,
}) {
  const mainRef = useRef(null);
  const firstRender = useRef(true);
  const index = mod.lessons.indexOf(lesson);

  // On lesson change: start at the top and move focus to the lesson, so
  // screen reader and keyboard users land on the new content.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [lessonKey]);

  useEffect(() => {
    document.title = `${lesson.title} · ${mod.title} | Python for JS Developers`;
  }, [lesson, mod]);

  return (
    <main
      id="lesson-main"
      ref={mainRef}
      tabIndex={-1}
      aria-labelledby="lesson-title"
      className="min-w-0 flex-1 outline-none"
    >
      <article className="mx-auto max-w-[920px] px-4 pb-10 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <header className="mb-9">
          <p className="m-0 mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fg/10 bg-surface px-2.5 py-1 font-medium text-text-2">
              <ModuleIcon id={mod.id} aria-hidden="true" size={14} className="text-accent" />
              {mod.title}
            </span>
            <ChevronRight aria-hidden="true" size={14} />
            <span>
              Lesson {index + 1} of {mod.lessons.length}
            </span>
          </p>
          <h1
            id="lesson-title"
            className="m-0 text-[30px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[38px]"
          >
            {lesson.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" size={14} />
              {readingMinutes(lesson)} min
            </span>
            {isDone && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-0.5 font-medium text-accent-text">
                <CircleCheck aria-hidden="true" size={14} />
                Completed
              </span>
            )}
          </div>
        </header>

        <div className="space-y-10">
          <LessonContent content={lesson.content} quotes={quotes} />
          <DiffTable diffs={lesson.keyDiffs} />
          <TipsBox tips={lesson.tips} />
          <CodeComparison jsCode={lesson.jsCode} pyCode={lesson.pyCode} />
          <ExercisePanel
            exercise={lesson.exercise}
            state={exercise}
            code={code}
            onCodeChange={onCodeChange}
            onNext={onNext}
            hasNext={!!next}
            isDone={isDone}
          />
          <LessonNav prev={prev} next={next} onGo={onGo} />
        </div>
        <Footer />
      </article>
    </main>
  );
}

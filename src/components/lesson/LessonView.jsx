import { useEffect, useRef } from "react";
import LessonHeader from "./LessonHeader";
import LessonContent from "./LessonContent";
import DiffTable from "./DiffTable";
import TipsBox from "./TipsBox";
import CodeComparison from "./CodeComparison";
import LessonNav from "./LessonNav";
import ExercisePanel from "../exercise/ExercisePanel";

export default function LessonView({
  mod,
  lesson,
  lessonKey,
  isMobile,
  isFirst,
  isLast,
  isDone,
  onPrev,
  onNext,
  code,
  onCodeChange,
  exercise,
  quotes,
}) {
  const mainRef = useRef(null);
  const firstRender = useRef(true);

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
      className={`flex-1 min-w-0 overflow-y-auto min-h-screen outline-none ${isMobile ? "p-4" : "p-6"}`}
    >
      <article className="max-w-[920px] mx-auto">
        <LessonHeader mod={mod} lesson={lesson} />
        <LessonContent content={lesson.content} quotes={quotes} />
        <DiffTable diffs={lesson.keyDiffs} />
        <TipsBox tips={lesson.tips} />
        <CodeComparison jsCode={lesson.jsCode} pyCode={lesson.pyCode} isMobile={isMobile} />
        <ExercisePanel
          exercise={lesson.exercise}
          state={exercise}
          code={code}
          onCodeChange={onCodeChange}
          onNext={onNext}
          isDone={isDone}
        />
        <LessonNav onPrev={onPrev} onNext={onNext} isFirst={isFirst} isLast={isLast} />
      </article>
    </main>
  );
}

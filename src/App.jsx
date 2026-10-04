import { useState, useCallback, useEffect } from "react";
import { courseModules, lessonList } from "./data";
import { useCourseState } from "./hooks/useCourseState";
import { useResponsive } from "./hooks/useResponsive";
import { useExercise } from "./hooks/useExercise";
import { useNotes } from "./hooks/useNotes";
import { useActivity } from "./hooks/useActivity";
import { useTheme } from "./hooks/useTheme";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MobileSidebar from "./components/layout/MobileSidebar";
import LessonView from "./components/lesson/LessonView";
import NotesPanel from "./components/notes/NotesPanel";
import QuotePopover from "./components/notes/QuotePopover";
import CelebrationDialog from "./components/celebration/CelebrationDialog";
import LandingPage from "./components/landing/LandingPage";
import OnboardingTour from "./components/onboarding/OnboardingTour";
import { KEYS, readFlag, writeFlag } from "./lib/storage";

const isBrowser = typeof window !== "undefined";

// `initialPath` is only passed when pre-rendering pages at build time.
export default function App({ initialPath } = {}) {
  const course = useCourseState(initialPath);
  const { theme, toggleTheme } = useTheme();
  const { isWide, menuOpen, toggleMenu, closeMenu } = useResponsive();
  const { activity, celebration, recordCompletion, dismissCelebration } = useActivity();
  const { markComplete, done } = course;

  const handlePass = useCallback(
    (lesson) => {
      const entry = lessonList.find((e) => e.lesson === lesson);
      if (!entry || done[entry.key]) return;
      recordCompletion(entry.key, done);
      markComplete(entry.key);
    },
    [done, markComplete, recordCompletion],
  );

  const exercise = useExercise(course.lesson, course.code, handlePass);
  const { entries, addNote, addQuote, updateEntry, deleteEntry, saved, totalNoteCount, quotes } =
    useNotes(course.current);

  // null = automatic (open on wide screens, decided by CSS so the pre-rendered
  // HTML matches every screen size); true/false once the learner toggles it.
  const [notesOpen, setNotesOpen] = useState(null);
  const [focusEntryId, setFocusEntryId] = useState(null);
  const [tourOpen, setTourOpen] = useState(() => isBrowser && !readFlag(KEYS.tourSeen));

  // Landing <-> lessons: always start at the top of the new page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [course.view]);

  const closeTour = useCallback(() => {
    writeFlag(KEYS.tourSeen);
    setTourOpen(false);
  }, []);

  const handleSelect = (key) => {
    course.goTo(key);
    closeMenu();
  };

  const handleReset = () => {
    if (!window.confirm("Reset all progress and saved code? Your notes are kept. This cannot be undone.")) return;
    course.resetProgress();
  };

  const navProps = {
    modules: courseModules,
    current: course.current,
    done: course.done,
    completedCount: course.completedCount,
    totalLessons: course.totalLessons,
    onSelect: handleSelect,
    onReset: handleReset,
  };

  if (course.view === "home") {
    return (
      <LandingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onStart={course.goTo}
        currentEntry={course.entry}
        completedCount={course.completedCount}
        done={course.done}
      />
    );
  }

  return (
    <div className="min-h-screen font-sans text-text">
      <a
        href="#lesson-main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("lesson-main")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Skip to lesson
      </a>
      <Header
        activity={activity}
        theme={theme}
        onToggleTheme={toggleTheme}
        menuOpen={menuOpen}
        onMenu={toggleMenu}
        onHome={course.goHome}
        onShowTour={() => setTourOpen(true)}
        completedCount={course.completedCount}
        totalLessons={course.totalLessons}
      />
      <div className="flex w-full">
        <Sidebar {...navProps} />
        <MobileSidebar isOpen={menuOpen} onClose={closeMenu} {...navProps} />
        <LessonView
          mod={course.mod}
          lesson={course.lesson}
          lessonKey={course.current}
          prev={lessonList[course.index - 1]}
          next={lessonList[course.index + 1]}
          isDone={!!course.done[course.current]}
          onNext={() => course.nav(1)}
          onGo={course.goTo}
          code={course.code}
          onCodeChange={course.updateCode}
          exercise={exercise}
          quotes={quotes}
        />
        <NotesPanel
          entries={entries}
          onAddNote={() => {
            const id = addNote();
            setFocusEntryId(id);
          }}
          onUpdateEntry={updateEntry}
          onDeleteEntry={deleteEntry}
          saved={saved}
          lessonTitle={course.lesson.title}
          totalNoteCount={totalNoteCount}
          isOpen={notesOpen}
          isWide={isWide}
          onToggle={() => setNotesOpen((p) => (p === null ? !isWide : !p))}
          focusEntryId={focusEntryId}
          onClearFocus={() => setFocusEntryId(null)}
        />
        <QuotePopover
          onQuote={(text) => {
            const id = addQuote(text);
            setNotesOpen(true);
            setFocusEntryId(id);
          }}
        />
      </div>
      {tourOpen && <OnboardingTour onClose={closeTour} />}
      <CelebrationDialog
        celebration={celebration}
        activity={activity}
        onDismiss={dismissCelebration}
        onNext={() => course.nav(1)}
      />
    </div>
  );
}

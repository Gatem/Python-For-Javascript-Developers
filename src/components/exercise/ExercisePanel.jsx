import { Play, Check, Lightbulb, Eye, EyeOff, ArrowRight, Dumbbell, CircleCheck, LoaderCircle, Cpu } from "lucide-react";
import { usePythonStatus } from "../../hooks/usePythonRunner";
import { guessLang } from "../../lib/highlight";
import Button from "../ui/Button";
import Code from "../ui/Code";
import CodeEditor from "./CodeEditor";
import TerminalOutput from "./TerminalOutput";
import InlineText from "../lesson/InlineText";

export default function ExercisePanel({ exercise, state, code, onCodeChange, onNext, hasNext, isDone }) {
  const pyStatus = usePythonStatus();
  if (!exercise) return null;

  const { busy, result, run, check, showHint, toggleHint, showAnswer, toggleAnswer, clearResult } = state;
  const loadingPython = busy && pyStatus === "loading";
  const promptLang = exercise.prompt ? guessLang(exercise.prompt) : null;
  const spinner = <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />;

  return (
    <section
      aria-labelledby="exercise-heading"
      className="relative overflow-hidden rounded-3xl border border-fg/10 bg-surface shadow-card"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-teal-400 to-blue-500" />
      <div className="p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="exercise-heading" className="m-0 flex items-center gap-2.5 text-[19px] font-semibold text-text">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent/12 text-accent-text">
              <Dumbbell aria-hidden="true" size={18} />
            </span>
            Exercise
            {isDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-0.5 text-[12.5px] font-medium text-accent-text">
                <CircleCheck aria-hidden="true" size={13} /> Completed
              </span>
            )}
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
            <Cpu aria-hidden="true" size={13} />
            Real Python, running in your browser
          </span>
        </div>

        <p className="m-0 whitespace-pre-line text-[16px] leading-[1.7] text-text">{exercise.question}</p>

        {exercise.prompt &&
          (promptLang ? (
            <Code code={exercise.prompt} lang={promptLang} title={promptLang === "js" ? "JavaScript to convert" : "Starter code"} className="mt-4" />
          ) : (
            <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-fg/8 bg-surface-2 px-4 py-3.5 text-[14.5px] leading-[1.75] text-text-2">
              {exercise.prompt}
            </div>
          ))}

        {exercise.output && (
          <div className="mt-4">
            <div className="mb-1.5 text-[12.5px] font-medium text-muted">Expected output</div>
            <pre className="m-0 overflow-x-auto scroll-thin rounded-xl border border-fg/8 bg-code px-4 py-3 font-mono text-[13px] leading-[1.6] text-text-2">
              {exercise.output}
            </pre>
          </div>
        )}

        <div className="mt-5">
          <CodeEditor value={code} onChange={onCodeChange} onRun={run} onCheck={check} placeholder="# Write your Python here..." />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={check} disabled={!!busy} icon={busy === "check" ? null : Check} title="Check solution (Ctrl+Shift+Enter)">
            {busy === "check" && spinner}
            {busy === "check" ? (loadingPython ? "Loading Python…" : "Checking…") : "Check solution"}
          </Button>
          <Button variant="secondary" onClick={run} disabled={!!busy} icon={busy === "run" ? null : Play} title="Run (Ctrl+Enter)">
            {busy === "run" && spinner}
            {busy === "run" ? (loadingPython ? "Loading Python…" : "Running…") : "Run"}
          </Button>
          <div className="flex items-center gap-1 sm:ml-auto">
            <Button variant="ghost" size="sm" onClick={toggleHint} aria-expanded={showHint} icon={Lightbulb}>
              {showHint ? "Hide hint" : "Hint"}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleAnswer} aria-expanded={showAnswer} icon={showAnswer ? EyeOff : Eye}>
              {showAnswer ? "Hide answer" : "Answer"}
            </Button>
          </div>
        </div>

        {loadingPython && (
          <p className="m-0 mt-3 text-[13px] text-muted">
            Downloading the Python runtime (first run only, a few MB). After that, runs are instant.
          </p>
        )}

        <div aria-live="polite">
          <TerminalOutput result={result} onClear={clearResult} />
          {pyStatus === "error" && !busy && !result && (
            <p className="m-0 mt-3 text-[13px] text-danger">
              Could not load Python. Check your internet connection and try again.
            </p>
          )}
        </div>

        {(isDone || result?.pass) && hasNext && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-3">
            <span className="flex items-center gap-2 text-[14px] font-medium text-text">
              <CircleCheck aria-hidden="true" size={18} className="text-accent" />
              Nice! Ready for the next lesson?
            </span>
            <Button variant="primary" size="sm" onClick={onNext}>
              Continue <ArrowRight aria-hidden="true" size={15} />
            </Button>
          </div>
        )}

        {showHint && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-info/25 bg-info/[0.07] px-4 py-3 text-[14.5px] leading-relaxed text-text-2">
            <Lightbulb aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-info" />
            <span>
              <InlineText text={exercise.hint} />
            </span>
          </div>
        )}
        {showAnswer && <Code code={exercise.answer} lang="py" title="Reference solution" className="mt-4" />}
      </div>
    </section>
  );
}

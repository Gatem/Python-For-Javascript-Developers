import { usePythonStatus } from "../../hooks/usePythonRunner";
import Button from "../ui/Button";
import CodeEditor from "./CodeEditor";
import TerminalOutput from "./TerminalOutput";
import StyledCode from "../lesson/StyledCode";

export default function ExercisePanel({ exercise, state, code, onCodeChange, onNext, isDone }) {
  const pyStatus = usePythonStatus();
  if (!exercise) return null;

  const { busy, result, run, check, showHint, toggleHint, showAnswer, toggleAnswer, clearResult } = state;
  const loadingPython = busy && pyStatus === "loading";

  return (
    <section
      aria-labelledby="exercise-heading"
      className="bg-blue-500/[0.06] border border-blue-500/15 rounded-xl p-5 mt-6"
    >
      <h3 id="exercise-heading" className="text-[18px] font-semibold m-0 mb-2.5 text-brand-blue-light">
        Exercise {isDone && <span className="text-[13px] text-brand-green font-medium ml-2">{"✓"} completed</span>}
      </h3>
      <p className="text-[15.5px] leading-[1.7] text-txt-secondary whitespace-pre-line m-0 mb-2.5">
        {exercise.question}
      </p>
      {exercise.prompt && (
        <pre className="font-mono text-[14px] leading-[1.7] p-3.5 rounded-lg overflow-x-auto text-left whitespace-pre-wrap break-words m-0 bg-black/20 border border-white/[0.06] my-2.5">
          {exercise.prompt}
        </pre>
      )}
      {exercise.output && (
        <div className="my-2.5">
          <div className="text-[12px] text-txt-muted mb-1">Expected output:</div>
          <pre className="font-mono text-[13px] leading-[1.6] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap m-0 bg-black/30 border border-white/[0.06] text-txt-secondary">
            {exercise.output}
          </pre>
        </div>
      )}
      <div className="mt-2.5">
        <CodeEditor
          value={code}
          onChange={onCodeChange}
          onRun={run}
          onCheck={check}
          placeholder="# Write your Python code here..."
        />
      </div>
      <div className="flex gap-2 mt-3 flex-wrap items-center">
        <Button variant="run" onClick={run} disabled={!!busy} title="Run (Ctrl+Enter)">
          {busy === "run" ? (loadingPython ? "Loading Python..." : "Running...") : "▶ Run"}
        </Button>
        <Button variant="primary" onClick={check} disabled={!!busy} title="Check solution (Ctrl+Shift+Enter)">
          {busy === "check" ? (loadingPython ? "Loading Python..." : "Checking...") : "✓ Check Solution"}
        </Button>
        <Button variant="hint" onClick={toggleHint} aria-expanded={showHint}>
          {showHint ? "Hide Hint" : "\u{1F4A1} Hint"}
        </Button>
        <Button variant="secondary" onClick={toggleAnswer} aria-expanded={showAnswer}>
          {showAnswer ? "Hide Answer" : "\u{1F441} Answer"}
        </Button>
        {(isDone || result?.pass) && (
          <Button variant="primary" onClick={onNext}>
            Next {"→"}
          </Button>
        )}
      </div>
      {loadingPython && (
        <p className="text-[13px] text-txt-muted mt-2 mb-0">
          Downloading the Python runtime (first run only, a few MB). Later runs are instant.
        </p>
      )}
      <div aria-live="polite">
        <TerminalOutput result={result} onClear={clearResult} />
        {pyStatus === "error" && !busy && !result && (
          <p className="text-[13px] text-term-error mt-2">
            Could not load Python. Check your internet connection and try again.
          </p>
        )}
      </div>
      {showHint && (
        <div className="mt-3 py-2.5 px-3.5 rounded-lg bg-[rgba(234,179,8,0.07)] border border-[rgba(234,179,8,0.18)] text-[14px] text-amber-400">
          <span aria-hidden="true">{"\u{1F4A1}"} </span>
          {exercise.hint}
        </div>
      )}
      {showAnswer && (
        <div className="mt-3">
          <div className="text-[13px] text-brand-green-light mb-1.5">Reference solution:</div>
          <StyledCode code={exercise.answer} variant="py" />
        </div>
      )}
    </section>
  );
}

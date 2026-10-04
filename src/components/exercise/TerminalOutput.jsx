const LINE_STYLES = {
  success: "text-term-success",
  warning: "text-term-warning",
  error: "text-term-error",
};

const ICONS = { success: "✅ ", warning: "⚠️ ", error: "❌ " };

function Line({ type, children }) {
  return (
    <div className={`py-0.5 whitespace-pre-wrap ${LINE_STYLES[type] || "text-txt-muted"}`}>
      <span aria-hidden="true">{ICONS[type]}</span>
      {children}
    </div>
  );
}

// Shows the real result of running or checking the learner's code.
export default function TerminalOutput({ result, onClear }) {
  if (!result) return null;
  const { kind, pass, errors = [], warnings = [], stdout, error, testFailure } = result;
  const ran = stdout != null || error != null || testFailure != null;
  const title = kind === "check" ? "check solution" : "python solution.py";

  let summary;
  if (kind === "check") {
    summary = pass
      ? { type: "success", text: "All checks and hidden tests passed. Lesson complete!" }
      : { type: "error", text: errors.length ? "Fix the issues above, then check again." : "Not quite yet. See the details above." };
  } else if (error) {
    summary = { type: "error", text: "Your code raised an error." };
  }

  return (
    <div className="font-mono text-[13px] leading-[1.7] bg-[#0c0c0c] rounded-lg overflow-hidden mt-3.5 border border-white/[0.08]">
      <div className="bg-[#1a1a2e] px-3 py-1.5 text-[12px] text-txt-dim flex items-center gap-1.5 border-b border-white/[0.06]">
        <span aria-hidden="true" className="text-term-error text-[9px]">{"●"}</span>
        <span aria-hidden="true" className="text-term-warning text-[9px]">{"●"}</span>
        <span aria-hidden="true" className="text-term-success text-[9px]">{"●"}</span>
        <span className="ml-1.5">{title}</span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear output"
            className="ml-auto text-txt-dim hover:text-txt-secondary bg-transparent border-none cursor-pointer text-[12px]"
          >
            <span aria-hidden="true">{"✕"}</span>
          </button>
        )}
      </div>
      <div className="p-3 max-h-[320px] overflow-y-auto">
        {errors.map((e, i) => (
          <Line key={`e${i}`} type={e.type}>{e.msg}</Line>
        ))}
        {warnings.map((w, i) => (
          <Line key={`w${i}`} type="warning">{w.msg}</Line>
        ))}
        {ran && (
          <>
            <div className="text-txt-dim mb-1 mt-1">$ python solution.py</div>
            {stdout ? (
              <div className="text-txt-primary whitespace-pre-wrap">{stdout.replace(/\n$/, "")}</div>
            ) : (
              !error && <div className="text-txt-dim italic">(no output)</div>
            )}
            {error && <div className="text-term-error whitespace-pre-wrap mt-1">{error}</div>}
            {testFailure && (
              <div className="mt-2 border-t border-white/[0.06] pt-2">
                <Line type="error">{testFailure}</Line>
              </div>
            )}
          </>
        )}
        {summary && (
          <div className={`mt-2 border-t border-white/[0.06] pt-2 ${LINE_STYLES[summary.type]}`}>
            {summary.text}
          </div>
        )}
      </div>
    </div>
  );
}

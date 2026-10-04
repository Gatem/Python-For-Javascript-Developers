import { X, CircleCheck, CircleX, TriangleAlert, Terminal } from "lucide-react";

const ICON = { error: CircleX, warning: TriangleAlert, success: CircleCheck };
const COLOR = { error: "text-[var(--t-err)]", warning: "text-[var(--t-warn)]", success: "text-[var(--t-ok)]" };

function Line({ type, children }) {
  const Icon = ICON[type];
  return (
    <div className={`flex gap-2 py-0.5 whitespace-pre-wrap ${COLOR[type] || ""}`}>
      {Icon && <Icon aria-hidden="true" size={15} className="mt-[3px] shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

// Shows the real result of running or checking the learner's code.
// Always dark, like a real terminal.
export default function TerminalOutput({ result, onClear }) {
  if (!result) return null;
  const { kind, pass, errors = [], warnings = [], stdout, error, testFailure } = result;
  const ran = stdout != null || error != null || testFailure != null;

  let status = null;
  if (kind === "check") status = pass ? "passed" : "failed";
  else if (error) status = "error";

  const badge = {
    passed: "bg-[var(--t-ok)]/15 text-[var(--t-ok)]",
    failed: "bg-[var(--t-err)]/15 text-[var(--t-err)]",
    error: "bg-[var(--t-err)]/15 text-[var(--t-err)]",
  };

  return (
    <div className="terminal mt-4 overflow-hidden rounded-2xl border border-black/20 bg-[var(--t-bg)] font-mono text-[13px] leading-[1.7] text-[var(--t-text)] shadow-card">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[var(--t-bar)] px-3.5 py-2 text-[12px] text-[var(--t-dim)]">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <Terminal aria-hidden="true" size={13} className="ml-2" />
        <span>{kind === "check" ? "check solution" : "python solution.py"}</span>
        {status && (
          <span className={`ml-2 rounded-full px-2 py-px font-sans text-[11px] font-semibold uppercase tracking-wide ${badge[status]}`}>
            {status}
          </span>
        )}
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear output"
            className="ml-auto rounded-md p-1 text-[var(--t-dim)] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X aria-hidden="true" size={14} />
          </button>
        )}
      </div>
      <div className="max-h-[340px] overflow-y-auto scroll-thin p-4">
        {errors.map((e, i) => (
          <Line key={`e${i}`} type={e.type}>{e.msg}</Line>
        ))}
        {warnings.map((w, i) => (
          <Line key={`w${i}`} type="warning">{w.msg}</Line>
        ))}
        {ran && (
          <>
            <div className="text-[var(--t-dim)]">
              <span className="text-[var(--t-ok)]">$</span> python solution.py
            </div>
            {stdout ? (
              <div className="whitespace-pre-wrap">{stdout.replace(/\n$/, "")}</div>
            ) : (
              !error && <div className="italic text-[var(--t-dim)]">(no output)</div>
            )}
            {error && <div className="mt-1 whitespace-pre-wrap text-[var(--t-err)]">{error}</div>}
            {testFailure && (
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <Line type="error">{testFailure}</Line>
              </div>
            )}
          </>
        )}
        {kind === "check" && (
          <div className={`mt-3 border-t border-white/[0.06] pt-3 font-sans text-[13.5px] font-medium ${pass ? "text-[var(--t-ok)]" : "text-[var(--t-err)]"}`}>
            {pass
              ? "All checks and hidden tests passed. Lesson complete!"
              : errors.length
                ? "Fix the issues above, then check again."
                : "Not quite yet. See the details above."}
          </div>
        )}
        {kind === "run" && error && (
          <div className="mt-3 border-t border-white/[0.06] pt-3 font-sans text-[13.5px] text-[var(--t-err)]">Your code raised an error.</div>
        )}
      </div>
    </div>
  );
}

import StyledCode from "./StyledCode";

export default function CodeComparison({ jsCode, pyCode, isMobile }) {
  return (
    <div
      className={`grid gap-3.5 my-5 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
    >
      <div>
        <div className="mb-1.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-amber-500/12 text-amber-400 border border-amber-500/25">
            JavaScript
          </span>
        </div>
        <StyledCode code={jsCode} variant="js" label="JavaScript example" />
      </div>
      <div>
        <div className="mb-1.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-emerald-500/12 text-brand-green-light border border-emerald-500/25">
            Python
          </span>
        </div>
        <StyledCode code={pyCode} variant="py" label="Python example" />
      </div>
    </div>
  );
}

export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="px-4 pb-2.5 border-b border-white/5">
      <div id="course-progress-label" className="text-[12px] text-txt-dim mb-1">
        Progress: {completed}/{total} lessons
      </div>
      <div
        role="progressbar"
        aria-labelledby="course-progress-label"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        className="h-1 bg-white/5 rounded-sm mx-0 overflow-hidden"
      >
        <div
          className="h-full bg-linear-to-r from-brand-green to-brand-blue rounded-sm transition-[width] duration-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

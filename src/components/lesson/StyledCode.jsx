export default function StyledCode({ code, variant = "py", label }) {
  const lines = (code || "").split("\n");
  const bg =
    variant === "js"
      ? "bg-[rgba(234,179,8,0.07)] border-[rgba(234,179,8,0.18)]"
      : "bg-[rgba(16,185,129,0.07)] border-[rgba(16,185,129,0.18)]";

  return (
    <pre
      aria-label={label}
      // Focusable so keyboard users can scroll wide code horizontally.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={`font-mono text-[14px] leading-[1.7] p-3.5 rounded-lg overflow-x-auto text-left whitespace-pre-wrap break-words m-0 border ${bg}`}
    >
      {lines.map((line, i) => {
        const trimmed = line.trimStart();
        const isComment =
          trimmed.startsWith("//") || trimmed.startsWith("#");
        return (
          <div
            key={i}
            className={isComment ? "text-txt-muted italic" : undefined}
          >
            {line}
            {i < lines.length - 1 ? "\n" : ""}
          </div>
        );
      })}
    </pre>
  );
}

// Code-looking fragments inside prose get monospace styling:
// dunders, calls like json.loads() or print(x), snake_case names,
// operators like === or &&, and short 'quoted' identifiers.
const INLINE_CODE =
  /(__\w+__|\b[A-Za-z_][\w.]*\((?:[^()\n]|\([^()\n]*\)){0,40}\)|\.[a-z_]\w*\(\)|\b[A-Za-z_]\w*\[[^\]\s]{0,12}\]|\b[a-z]+(?:_[a-z0-9]+)+\b|(?<=^|\s|\()(?:===|!==|&&|\|\||\?\?|\?\.|=>|\*\*|\/\/|:=|\+=|-=|==|!=)(?=$|\s|[,.;:)])|'[A-Za-z_.@*][\w.()*@=]{0,23}')/g;

function renderInline(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_CODE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const raw = m[0];
    const code = raw.startsWith("'") && raw.endsWith("'") ? raw.slice(1, -1) : raw;
    out.push(
      <code
        key={m.index}
        className="rounded-md border border-fg/8 bg-fg/[0.05] px-[0.35em] py-[0.08em] font-mono text-[0.86em] text-text"
      >
        {code}
      </code>,
    );
    last = m.index + raw.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Prose with code-looking fragments rendered as inline code.
export default function InlineText({ text }) {
  return renderInline(text);
}

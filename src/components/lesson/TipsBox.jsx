export default function TipsBox({ tips }) {
  if (!tips || !tips.length) return null;
  return (
    <aside aria-labelledby="tips-heading" className="bg-amber-500/[0.06] border border-amber-500/15 rounded-[10px] py-3.5 px-4 mt-4">
      <h3 id="tips-heading" className="text-[12px] font-semibold text-amber-500 mb-1.5 mt-0 uppercase tracking-wider">
        <span aria-hidden="true">{"\u{1F4A1}"} </span>Heads Up
      </h3>
      <ul className="m-0 pl-5 list-disc marker:text-amber-500">
        {tips.map((tip, i) => (
          <li key={i} className="text-[14.5px] leading-relaxed text-amber-400 py-[3px]">
            {tip}
          </li>
        ))}
      </ul>
    </aside>
  );
}

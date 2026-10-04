export default function DiffTable({ diffs }) {
  if (!diffs || !diffs.length) return null;
  return (
    <div className="mt-5 mb-1.5">
      <h3 id="quick-ref-heading" className="text-[13px] font-semibold text-txt-muted mb-2 mt-0 uppercase tracking-wider">
        Quick Reference
      </h3>
      <div className="rounded-lg overflow-x-auto border border-white/[0.06]">
        <table aria-labelledby="quick-ref-heading" className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-white/[0.03]">
              <th scope="col" className="p-2 px-2.5 text-left border-b-2 border-white/10 text-txt-muted font-semibold text-[12px] uppercase tracking-wider">
                JavaScript
              </th>
              <th scope="col" className="p-2 px-2.5 text-left border-b-2 border-white/10 text-txt-muted font-semibold text-[12px] uppercase tracking-wider">
                Python
              </th>
              <th scope="col" className="p-2 px-2.5 text-left border-b-2 border-white/10 text-txt-muted font-semibold text-[12px] uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((d, i) => (
              <tr
                key={i}
                className={
                  i % 2 ? "bg-white/[0.015]" : "bg-transparent"
                }
              >
                <td className="py-[7px] px-2.5 border-b border-white/[0.04] font-mono text-[13px] text-amber-400">
                  {d.js}
                </td>
                <td className="py-[7px] px-2.5 border-b border-white/[0.04] font-mono text-[13px] text-brand-green-light">
                  {d.py}
                </td>
                <td className="py-[7px] px-2.5 border-b border-white/[0.04] text-txt-muted">
                  {d.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

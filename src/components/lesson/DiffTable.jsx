import { ArrowLeftRight, ArrowRight } from "lucide-react";
import SectionTitle from "./SectionTitle";
import InlineText from "./InlineText";

const chip = "inline-block rounded-md px-1.5 py-0.5 font-mono text-[12.5px] leading-snug break-words";

export default function DiffTable({ diffs }) {
  if (!diffs || !diffs.length) return null;
  return (
    <section aria-labelledby="quick-ref-heading">
      <SectionTitle id="quick-ref-heading" icon={ArrowLeftRight}>
        Quick reference
      </SectionTitle>
      <div className="overflow-hidden rounded-2xl border border-fg/10 bg-surface shadow-card">
        <table aria-labelledby="quick-ref-heading" className="w-full border-collapse text-[14px] max-sm:block">
          <thead className="max-sm:hidden">
            <tr className="bg-surface-2 text-left text-[12px] uppercase tracking-wider text-muted">
              <th scope="col" className="w-[36%] px-4 py-2.5 font-semibold">
                JavaScript
              </th>
              <th scope="col" className="w-[36%] px-4 py-2.5 font-semibold">
                Python
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {diffs.map((d, i) => (
              <tr
                key={i}
                className="border-t border-fg/6 first:border-t-0 sm:first:border-t max-sm:grid max-sm:grid-cols-[1fr_auto_1fr] max-sm:items-center max-sm:gap-x-2 max-sm:gap-y-1.5 max-sm:px-4 max-sm:py-3"
              >
                <td className="px-4 py-2.5 align-top max-sm:p-0">
                  <span className={`${chip} bg-js/10 text-js`}>{d.js}</span>
                </td>
                <td aria-hidden="true" className="hidden max-sm:block text-muted">
                  <ArrowRight size={14} />
                </td>
                <td className="px-4 py-2.5 align-top max-sm:p-0">
                  <span className={`${chip} bg-py/10 text-py`}>{d.py}</span>
                </td>
                <td className="px-4 py-2.5 align-top text-[13.5px] text-text-2 max-sm:col-span-3 max-sm:p-0">
                  <InlineText text={d.note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

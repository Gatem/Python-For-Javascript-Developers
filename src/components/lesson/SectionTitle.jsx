export default function SectionTitle({ id, icon: Icon, children, tone = "text-muted" }) {
  return (
    <h3 id={id} className="m-0 mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
      {Icon && <Icon aria-hidden="true" size={15} className={tone} />}
      {children}
    </h3>
  );
}

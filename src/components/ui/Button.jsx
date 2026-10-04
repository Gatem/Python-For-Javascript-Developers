const VARIANTS = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-strong dark:hover:bg-accent-text shadow-sm",
  secondary:
    "bg-surface text-text border border-fg/12 hover:bg-surface-2 hover:border-fg/20",
  ghost: "text-text-2 hover:bg-fg/6 hover:text-text",
  soft: "bg-accent/10 text-accent-text hover:bg-accent/15",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[14px] gap-2 rounded-xl",
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  icon: Icon,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-medium whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" size={size === "sm" ? 15 : 16} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

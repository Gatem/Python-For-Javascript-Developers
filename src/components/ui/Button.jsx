const variants = {
  primary:
    "bg-linear-to-r from-brand-green to-brand-green-dark text-white border border-transparent",
  run: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  hint: "bg-amber-500/12 text-amber-400 border border-amber-500/25",
  secondary: "bg-blue-500/12 text-blue-300 border border-blue-500/25",
};

export default function Button({
  variant = "secondary",
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`px-[18px] py-2 rounded-lg cursor-pointer text-[14px] font-semibold font-sans disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant] || variants.secondary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import { useId } from "react";

// Brand mark: a JavaScript brace "{" (amber) that turns into a Python snake
// (green). Original artwork; deliberately not based on the Python logo.
// Keep in sync with public/favicon.svg.
export default function LogoMark({ size = 36, className = "", title }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#15203a" />
          <stop offset="1" stopColor="#0a0f1c" />
        </linearGradient>
        <linearGradient id={`${id}-snake`} x1="30" y1="14" x2="52" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id={`${id}-brace`} x1="12" y1="14" x2="24" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}-tile)`} />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
      {/* JS brace */}
      <path
        d="M24 15.5c-5 0-6.5 2.4-6.5 6.6v4.2c0 3.2-1.6 5.2-5 5.7 3.4.5 5 2.5 5 5.7v4.2c0 4.2 1.5 6.6 6.5 6.6"
        fill="none"
        stroke={`url(#${id}-brace)`}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Python snake */}
      <path
        d="M49.5 20.5c-2.2-3.4-6-5-10-4.4-4.6.7-7.6 4-7.2 8 .4 4.3 4.4 5.6 8.6 6.6 4.4 1 8.9 2.4 9.1 7.3.2 4.6-3.6 8.2-8.9 8.4-3.4.1-6.4-1.1-8.4-3.4"
        fill="none"
        stroke={`url(#${id}-snake)`}
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* snake head, eye and tongue */}
      <ellipse cx="48.2" cy="19.4" rx="4.7" ry="3.7" transform="rotate(-32 48.2 19.4)" fill="#34d399" />
      <circle cx="49.3" cy="18" r="1.25" fill="#0a0f1c" />
      <path d="M52.4 16.9l2.4-1.9M52.4 16.9l3 .2" stroke="#f472b6" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

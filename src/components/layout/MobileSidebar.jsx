import { useEffect, useRef } from "react";
import SideNav from "./SideNav";

export default function MobileSidebar({ isOpen, onToggle, onClose, ...navProps }) {
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.querySelector("[aria-current='page'], button, a")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <div>
      <button
        ref={toggleRef}
        type="button"
        aria-label={isOpen ? "Close lesson menu" : "Open lesson menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-lesson-menu"
        className="fixed top-3 left-3 z-60 w-11 h-11 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-brand-green cursor-pointer flex items-center justify-center text-[18px]"
        onClick={onToggle}
      >
        <span aria-hidden="true">{isOpen ? "✕" : "☰"}</span>
      </button>
      {isOpen && (
        <div
          id="mobile-lesson-menu"
          ref={panelRef}
          className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.97)] overflow-y-auto pt-16 pb-4 custom-scrollbar"
        >
          <SideNav {...navProps} />
        </div>
      )}
    </div>
  );
}

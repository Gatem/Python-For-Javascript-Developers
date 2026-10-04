import { useEffect, useRef } from "react";
import SideNav from "./SideNav";

export default function MobileSidebar({ isOpen, onClose, ...navProps }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    (panel?.querySelector("[aria-current='page']") || panel?.querySelector("button, a"))?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 top-16 z-30 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        id="mobile-lesson-menu"
        ref={panelRef}
        className="fixed bottom-0 left-0 top-16 z-30 w-[86vw] max-w-[340px] overflow-y-auto scroll-thin border-r border-fg/10 bg-bg shadow-card"
      >
        <SideNav {...navProps} />
      </div>
    </>
  );
}

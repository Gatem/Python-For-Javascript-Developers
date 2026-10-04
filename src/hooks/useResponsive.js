import { useState, useEffect, useCallback } from "react";

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsWide(window.innerWidth >= 1280);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((p) => !p), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return { isMobile, isWide, menuOpen, toggleMenu, closeMenu };
}

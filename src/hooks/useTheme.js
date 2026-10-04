import { useState, useEffect, useCallback } from "react";
import {
  getStoredTheme,
  resolveTheme,
  applyTheme,
  storeTheme,
  onSystemThemeChange,
} from "../lib/theme";

export function useTheme() {
  const [pref, setPref] = useState(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState(() => resolveTheme(null));
  const theme = pref || systemTheme;

  useEffect(() => onSystemThemeChange(setSystemTheme), []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    storeTheme(next);
    setPref(next);
  }, [theme]);

  return { theme, toggleTheme };
}

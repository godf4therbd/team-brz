"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

// Keep this in sync with the inline script in app/layout.tsx — that script
// sets data-theme on <html> before hydration (reading the same key) so
// there's no flash of the wrong theme while React boots up.
const STORAGE_KEY = "team-brz-theme";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline script in layout.tsx already set the correct value on
  // <html data-theme="..."> before this component ever mounts, so read it
  // back from the DOM rather than defaulting to "dark" here — otherwise a
  // returning light-mode visitor would see a flash of this context
  // thinking it's dark until the effect below corrects it.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing / storage disabled — theme just won't persist.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

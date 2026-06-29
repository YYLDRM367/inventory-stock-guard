"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const COLOR_THEMES = {
  blue: {
    label: { tr: "Mavi", en: "Blue" },
    desc: { tr: "Varsayılan profesyonel mavi", en: "Default professional blue" },
    primary: "oklch(56% 0.22 260)",
    hex: "#3B6FD4",
    gradient: "linear-gradient(135deg, #3B6FD4 0%, #6090E8 100%)",
  },
  amber: {
    label: { tr: "Kehribar", en: "Amber" },
    desc: { tr: "Sıcak altın kehribar", en: "Warm golden amber" },
    primary: "oklch(70% 0.15 65)",
    hex: "#D97706",
    gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
  },
  emerald: {
    label: { tr: "Zümrüt", en: "Emerald" },
    desc: { tr: "Taze zümrüt yeşili", en: "Fresh emerald green" },
    primary: "oklch(58% 0.17 152)",
    hex: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
  },
} as const;

export type ColorThemeName = keyof typeof COLOR_THEMES;
const STORAGE_KEY = "isg-color-theme";

export function applyColorTheme(name: ColorThemeName) {
  const val = COLOR_THEMES[name].primary;
  const root = document.documentElement;
  root.style.setProperty("--color-primary", val);
  root.style.setProperty("--color-accent", val);
  root.style.setProperty("--color-ring", val);
  root.style.setProperty("--color-sidebar-active", val);
}

/* ── Context ──────────────────────────────────────────────────────────────── */

type Ctx = { colorTheme: ColorThemeName; setColorTheme: (n: ColorThemeName) => void };
const Ctx = createContext<Ctx>({ colorTheme: "blue", setColorTheme: () => {} });

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorThemeName>("blue");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ColorThemeName | null;
    if (saved && COLOR_THEMES[saved]) {
      setColorThemeState(saved);
      applyColorTheme(saved);
    }
  }, []);

  function setColorTheme(name: ColorThemeName) {
    setColorThemeState(name);
    localStorage.setItem(STORAGE_KEY, name);
    applyColorTheme(name);
  }

  return <Ctx.Provider value={{ colorTheme, setColorTheme }}>{children}</Ctx.Provider>;
}

export function useColorTheme() {
  return useContext(Ctx);
}

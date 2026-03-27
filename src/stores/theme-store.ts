import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>((set, get) => ({
  theme: "light",

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(newTheme);
  },
}));

export function initializeTheme() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored ?? (prefersDark ? "dark" : "light");
    useTheme.getState().setTheme(theme);
  }
}

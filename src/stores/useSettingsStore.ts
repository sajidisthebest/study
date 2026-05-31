import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings, Theme } from "@/types";

interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  setCardDisplayFields: (fields: string[]) => void;
  setExamModeActive: (active: boolean) => void;
  applyTheme: () => void;
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "system",
      accentColor: "blue",
      cardDisplayFields: ["subject", "dueDate", "tags"],
      examModeActive: false,
      setTheme: (theme) => {
        set({ theme });
        const resolved = theme === "system" ? getSystemTheme() : theme;
        document.documentElement.classList.toggle("dark", resolved === "dark");
      },
      setAccentColor: (accentColor) => set({ accentColor }),
      setCardDisplayFields: (cardDisplayFields) => set({ cardDisplayFields }),
      setExamModeActive: (examModeActive) => set({ examModeActive }),
      applyTheme: () => {
        const { theme } = get();
        const resolved = theme === "system" ? getSystemTheme() : theme;
        document.documentElement.classList.toggle("dark", resolved === "dark");
      },
    }),
    { name: "settings-storage" }
  )
);

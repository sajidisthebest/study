import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoutineEntry } from "@/types";
import { generateId } from "@/lib/utils";

interface RoutineState {
  entries: RoutineEntry[];
  addEntry: (entry: Omit<RoutineEntry, "id" | "deletedAt">) => void;
  updateEntry: (id: string, updates: Partial<RoutineEntry>) => void;
  deleteEntry: (id: string) => void;
  restoreEntry: (id: string) => void;
  getActiveEntries: () => RoutineEntry[];
  getEntriesByDay: (dayOfWeek: number) => RoutineEntry[];
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, { ...entry, id: generateId(), deletedAt: null }],
        })),
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e
          ),
        })),
      restoreEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, deletedAt: null } : e
          ),
        })),
      getActiveEntries: () =>
        get().entries.filter((e) => e.deletedAt === null),
      getEntriesByDay: (dayOfWeek) =>
        get().entries.filter((e) => e.deletedAt === null && e.dayOfWeek === dayOfWeek),
    }),
    { name: "routine-storage" }
  )
);

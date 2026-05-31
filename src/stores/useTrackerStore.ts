import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackerEntry, TrackerType } from "@/types";
import { generateId } from "@/lib/utils";

interface TrackerState {
  entries: TrackerEntry[];
  addEntry: (entry: Omit<TrackerEntry, "id" | "createdAt" | "deletedAt">) => void;
  updateEntry: (id: string, updates: Partial<TrackerEntry>) => void;
  deleteEntry: (id: string) => void;
  restoreEntry: (id: string) => void;
  getActiveEntries: () => TrackerEntry[];
  getEntriesByType: (type: TrackerType) => TrackerEntry[];
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: generateId(),
              createdAt: new Date().toISOString(),
              deletedAt: null,
            },
          ],
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
      getEntriesByType: (type) =>
        get().entries.filter(
          (e) => e.deletedAt === null && e.type === type
        ),
    }),
    { name: "tracker-storage" }
  )
);

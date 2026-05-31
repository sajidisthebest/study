import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyLog } from "@/types";
import { generateId } from "@/lib/utils";

interface DailyLogState {
  logs: DailyLog[];
  addLog: (log: Omit<DailyLog, "id" | "createdAt" | "deletedAt">) => void;
  updateLog: (id: string, updates: Partial<DailyLog>) => void;
  deleteLog: (id: string) => void;
  restoreLog: (id: string) => void;
  getActiveLogs: () => DailyLog[];
  getLogsByDate: (date: string) => DailyLog[];
}

export const useDailyLogStore = create<DailyLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              ...log,
              id: generateId(),
              createdAt: new Date().toISOString(),
              deletedAt: null,
            },
          ],
        })),
      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      deleteLog: (id) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === id ? { ...l, deletedAt: new Date().toISOString() } : l
          ),
        })),
      restoreLog: (id) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === id ? { ...l, deletedAt: null } : l
          ),
        })),
      getActiveLogs: () => get().logs.filter((l) => l.deletedAt === null),
      getLogsByDate: (date) =>
        get().logs.filter((l) => l.deletedAt === null && l.date === date),
    }),
    { name: "daily-log-storage" }
  )
);

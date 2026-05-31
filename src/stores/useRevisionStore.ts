import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RevisionSchedule } from "@/types";
import { generateId } from "@/lib/utils";

interface RevisionState {
  schedules: RevisionSchedule[];
  addSchedule: (schedule: Omit<RevisionSchedule, "id" | "deletedAt" | "reviewCount" | "intervals" | "status">) => void;
  updateSchedule: (id: string, updates: Partial<RevisionSchedule>) => void;
  deleteSchedule: (id: string) => void;
  restoreSchedule: (id: string) => void;
  markReviewed: (id: string) => void;
  getActiveSchedules: () => RevisionSchedule[];
  getDueSchedules: () => RevisionSchedule[];
}

const DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 60];

export const useRevisionStore = create<RevisionState>()(
  persist(
    (set, get) => ({
      schedules: [],
      addSchedule: (schedule) =>
        set((state) => ({
          schedules: [
            ...state.schedules,
            {
              ...schedule,
              id: generateId(),
              reviewCount: 0,
              intervals: DEFAULT_INTERVALS,
              status: "pending",
              deletedAt: null,
            },
          ],
        })),
      updateSchedule: (id, updates) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s
          ),
        })),
      restoreSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, deletedAt: null } : s
          ),
        })),
      markReviewed: (id) =>
        set((state) => ({
          schedules: state.schedules.map((s) => {
            if (s.id !== id) return s;
            const newCount = s.reviewCount + 1;
            const nextInterval =
              s.intervals[Math.min(newCount, s.intervals.length - 1)];
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + nextInterval);
            return {
              ...s,
              reviewCount: newCount,
              nextReviewDate: nextDate.toISOString(),
              status:
                newCount >= s.intervals.length
                  ? ("mastered" as const)
                  : ("reviewed" as const),
            };
          }),
        })),
      getActiveSchedules: () =>
        get().schedules.filter((s) => s.deletedAt === null),
      getDueSchedules: () => {
        const now = new Date().toISOString();
        return get().schedules.filter(
          (s) =>
            s.deletedAt === null &&
            s.status !== "mastered" &&
            s.nextReviewDate <= now
        );
      },
    }),
    { name: "revision-storage" }
  )
);

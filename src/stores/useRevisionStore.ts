import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RevisionSchedule } from "@/types";
import { generateId } from "@/lib/utils";
import { startOfDay, addDays, endOfDay, isWithinInterval } from "date-fns";

interface RevisionState {
  schedules: RevisionSchedule[];
  addSchedule: (schedule: Omit<RevisionSchedule, "id" | "deletedAt" | "reviewCount" | "intervals" | "status">) => void;
  updateSchedule: (id: string, updates: Partial<RevisionSchedule>) => void;
  deleteSchedule: (id: string) => void;
  restoreSchedule: (id: string) => void;
  markReviewed: (id: string) => void;
  skipItem: (id: string) => void;
  reschedule: (id: string, date: string) => void;
  getActiveSchedules: () => RevisionSchedule[];
  getDueSchedules: () => RevisionSchedule[];
  getItemsDueToday: () => RevisionSchedule[];
  getItemsDueThisWeek: () => RevisionSchedule[];
  getCompletedToday: () => RevisionSchedule[];
}

const DEFAULT_INTERVALS = [1, 3, 7, 14, 30];

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
            if (newCount >= s.intervals.length) {
              return {
                ...s,
                reviewCount: newCount,
                nextReviewDate: new Date().toISOString(),
                status: "mastered" as const,
              };
            }
            const nextInterval = s.intervals[newCount];
            const nextDate = addDays(new Date(), nextInterval);
            return {
              ...s,
              reviewCount: newCount,
              nextReviewDate: nextDate.toISOString(),
              status: "reviewed" as const,
            };
          }),
        })),
      skipItem: (id) =>
        set((state) => ({
          schedules: state.schedules.map((s) => {
            if (s.id !== id) return s;
            const nextDate = addDays(new Date(), 1);
            return {
              ...s,
              nextReviewDate: nextDate.toISOString(),
            };
          }),
        })),
      reschedule: (id, date) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, nextReviewDate: date } : s
          ),
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
      getItemsDueToday: () => {
        const todayEnd = endOfDay(new Date()).toISOString();
        return get().schedules.filter(
          (s) =>
            s.deletedAt === null &&
            s.status !== "mastered" &&
            s.nextReviewDate <= todayEnd
        );
      },
      getItemsDueThisWeek: () => {
        const todayEnd = endOfDay(new Date());
        const weekEnd = endOfDay(addDays(new Date(), 7));
        return get().schedules.filter((s) => {
          if (s.deletedAt !== null || s.status === "mastered") return false;
          const reviewDate = new Date(s.nextReviewDate);
          return isWithinInterval(reviewDate, { start: todayEnd, end: weekEnd });
        });
      },
      getCompletedToday: () => {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        return get().schedules.filter((s) => {
          if (s.deletedAt !== null) return false;
          if (s.status === "mastered") {
            const reviewDate = new Date(s.nextReviewDate);
            return isWithinInterval(reviewDate, { start: todayStart, end: todayEnd });
          }
          // Items reviewed today have had their nextReviewDate moved forward,
          // and reviewCount > 0. We check if last action was today.
          if (s.reviewCount > 0 && s.status === "reviewed") {
            // The nextReviewDate was set when reviewed, so the "reviewed at" date
            // is nextReviewDate minus the interval
            const interval = s.intervals[Math.min(s.reviewCount, s.intervals.length - 1)];
            const reviewedAt = addDays(new Date(s.nextReviewDate), -interval);
            return isWithinInterval(reviewedAt, { start: todayStart, end: todayEnd });
          }
          return false;
        });
      },
    }),
    { name: "revision-storage" }
  )
);

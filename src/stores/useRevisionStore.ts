import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RevisionSchedule } from "@/types";
import { generateId } from "@/lib/utils";
import { startOfDay, addDays, endOfDay, isWithinInterval } from "date-fns";

interface RevisionState {
  schedules: RevisionSchedule[];
  addSchedule: (schedule: Omit<RevisionSchedule, "id" | "deletedAt" | "reviewCount" | "intervals" | "status" | "lastReviewedAt">) => void;
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
      addSchedule: (schedule) => {
        // Dedup: don't create a duplicate if an active (non-deleted) revision
        // already exists for the same topicName + subjectId + paperId
        const existing = get().schedules.find(
          (s) =>
            s.deletedAt === null &&
            s.topicName === schedule.topicName &&
            s.subjectId === schedule.subjectId &&
            s.paperId === schedule.paperId
        );
        if (existing) return;

        set((state) => ({
          schedules: [
            ...state.schedules,
            {
              ...schedule,
              id: generateId(),
              reviewCount: 0,
              intervals: DEFAULT_INTERVALS,
              status: "pending",
              lastReviewedAt: null,
              deletedAt: null,
            },
          ],
        }));
      },
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
            const now = new Date();
            const newCount = s.reviewCount + 1;
            if (newCount >= s.intervals.length) {
              return {
                ...s,
                reviewCount: newCount,
                nextReviewDate: now.toISOString(),
                lastReviewedAt: now.toISOString(),
                status: "mastered" as const,
              };
            }
            const nextInterval = s.intervals[newCount];
            const nextDate = addDays(now, nextInterval);
            return {
              ...s,
              reviewCount: newCount,
              nextReviewDate: nextDate.toISOString(),
              lastReviewedAt: now.toISOString(),
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
          if (!s.lastReviewedAt) return false;
          const reviewedAt = new Date(s.lastReviewedAt);
          return isWithinInterval(reviewedAt, { start: todayStart, end: todayEnd });
        });
      },
    }),
    { name: "revision-storage" }
  )
);

import { format, subDays } from "date-fns";
import type { Task, DailyLog, TrackerEntry, RevisionSchedule } from "@/types";

/**
 * Calculate the current study streak - consecutive days with any activity.
 * Activity is defined as: adding a daily log, completing a task,
 * logging a study session, or completing a revision review.
 */
export function getStudyStreak(
  tasks: Task[],
  logs: DailyLog[],
  entries: TrackerEntry[],
  revisionSchedules: RevisionSchedule[]
): number {
  const activeDates = new Set<string>();

  // Daily logs
  for (const log of logs) {
    if (log.deletedAt === null) {
      activeDates.add(log.date);
    }
  }

  // Completed tasks
  for (const task of tasks) {
    if (task.completedAt) {
      activeDates.add(format(new Date(task.completedAt), "yyyy-MM-dd"));
    }
  }

  // Tracker entries (any type)
  for (const entry of entries) {
    if (entry.deletedAt === null) {
      activeDates.add(entry.date);
    }
  }

  // Revision reviews (createdAt approximation - items that have been reviewed)
  for (const schedule of revisionSchedules) {
    if (schedule.deletedAt === null && schedule.reviewCount > 0) {
      // Use firstStudiedAt as at least one activity day
      activeDates.add(format(new Date(schedule.firstStudiedAt), "yyyy-MM-dd"));
    }
  }

  // Count consecutive days backwards from today
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    if (activeDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

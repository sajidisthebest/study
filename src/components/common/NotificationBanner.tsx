import { useState, useMemo } from "react";
import { X, AlertTriangle, Info, PartyPopper } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useExamStore } from "@/stores/useExamStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { useDailyLogStore } from "@/stores/useDailyLogStore";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { isToday, isPast, differenceInDays } from "date-fns";
import { getStudyStreak } from "@/lib/streak";

interface Notification {
  id: string;
  type: "info" | "warning" | "celebration";
  message: string;
}

export function NotificationBanner() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const tasks = useTaskStore((s) => s.tasks);
  const exams = useExamStore((s) => s.exams);
  const revisionItems = useRevisionStore((s) => s.schedules);
  const logs = useDailyLogStore((s) => s.logs);
  const entries = useTrackerStore((s) => s.entries);

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // Tasks due today
    const dueTodayCount = tasks.filter(
      (t) =>
        t.deletedAt === null &&
        t.status !== "completed" &&
        t.dueDate &&
        (isToday(new Date(t.dueDate)) || isPast(new Date(t.dueDate)))
    ).length;
    if (dueTodayCount > 0) {
      notifs.push({
        id: "tasks-due",
        type: "info",
        message: `You have ${dueTodayCount} task${dueTodayCount > 1 ? "s" : ""} due tonight`,
      });
    }

    // Upcoming exams within 7 days
    const activeExams = exams.filter(
      (e) => e.deletedAt === null && e.type === "upcoming"
    );
    for (const exam of activeExams) {
      const daysUntil = differenceInDays(new Date(exam.startDate), new Date());
      if (daysUntil > 0 && daysUntil <= 7) {
        notifs.push({
          id: `exam-${exam.id}`,
          type: "warning",
          message: `Exam "${exam.name}" in ${daysUntil} day${daysUntil > 1 ? "s" : ""}!`,
        });
      }
    }

    // Pending revision items
    const pendingRevisions = revisionItems.filter(
      (s) =>
        s.deletedAt === null &&
        s.status !== "mastered" &&
        new Date(s.nextReviewDate) <= new Date()
    ).length;
    if (pendingRevisions > 0) {
      notifs.push({
        id: "revisions-pending",
        type: "info",
        message: `${pendingRevisions} revision item${pendingRevisions > 1 ? "s" : ""} pending today`,
      });
    }

    // Streak milestones
    const streak = getStudyStreak(tasks, logs, entries, revisionItems);
    if (streak === 7 || streak === 14 || streak === 30) {
      notifs.push({
        id: `streak-${streak}`,
        type: "celebration",
        message: `Amazing! ${streak} day streak!`,
      });
    }

    return notifs;
  }, [tasks, exams, revisionItems, logs, entries]);

  const visibleNotifications = notifications.filter(
    (n) => !dismissed.has(n.id)
  );

  if (visibleNotifications.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-2 mb-4">
      {visibleNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
            notif.type === "warning"
              ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
              : notif.type === "celebration"
              ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
              : "bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400"
          }`}
        >
          {notif.type === "warning" && <AlertTriangle className="h-4 w-4 shrink-0" />}
          {notif.type === "info" && <Info className="h-4 w-4 shrink-0" />}
          {notif.type === "celebration" && <PartyPopper className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{notif.message}</span>
          <button
            onClick={() => dismiss(notif.id)}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

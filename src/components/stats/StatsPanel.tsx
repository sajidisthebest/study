import { useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Brain,
  Flame,
  BarChart3,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { useDailyLogStore } from "@/stores/useDailyLogStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { getStudyStreak } from "@/lib/streak";

export function StatsPanel() {
  const tasks = useTaskStore((s) => s.tasks);
  const entries = useTrackerStore((s) => s.entries);
  const revisionSchedules = useRevisionStore((s) => s.schedules);
  const logs = useDailyLogStore((s) => s.logs);
  const subjects = useSubjectStore((s) => s.subjects);

  const weekInterval = useMemo(() => {
    const now = new Date();
    return { start: startOfWeek(now, { weekStartsOn: 6 }), end: endOfWeek(now, { weekStartsOn: 6 }) };
  }, []);

  // Study hours this week (from self-study sessions)
  const studyHoursThisWeek = useMemo(() => {
    const selfStudyEntries = entries.filter(
      (e) =>
        e.deletedAt === null &&
        e.type === "self_study" &&
        e.duration &&
        isWithinInterval(new Date(e.date), weekInterval)
    );
    const totalMinutes = selfStudyEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [entries, weekInterval]);

  // Tasks completed this week
  const tasksCompletedThisWeek = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.completedAt &&
        isWithinInterval(new Date(t.completedAt), weekInterval)
    ).length;
  }, [tasks, weekInterval]);

  // Revision items reviewed this week
  const revisionsThisWeek = useMemo(() => {
    return revisionSchedules.filter(
      (s) =>
        s.deletedAt === null &&
        s.reviewCount > 0 &&
        (s.status === "reviewed" || s.status === "mastered")
    ).length;
  }, [revisionSchedules]);

  // Study streak
  const streak = useMemo(
    () => getStudyStreak(tasks, logs, entries, revisionSchedules),
    [tasks, logs, entries, revisionSchedules]
  );

  // Completion rate
  const completionRate = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.deletedAt === null);
    if (activeTasks.length === 0) return 0;
    const completed = activeTasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / activeTasks.length) * 100);
  }, [tasks]);

  // Subject-wise time distribution
  const subjectDistribution = useMemo(() => {
    const subjectTime: Record<string, number> = {};
    const selfStudyEntries = entries.filter(
      (e) => e.deletedAt === null && e.type === "self_study" && e.duration
    );
    for (const entry of selfStudyEntries) {
      subjectTime[entry.subjectId] = (subjectTime[entry.subjectId] || 0) + (entry.duration || 0);
    }
    const total = Object.values(subjectTime).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(subjectTime)
      .map(([subjectId, minutes]) => {
        const subject = subjects.find((s) => s.id === subjectId);
        return {
          name: subject?.name || "Unknown",
          percentage: Math.round((minutes / total) * 100),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [entries, subjects]);

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-yellow-500",
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Weekly Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold">{studyHoursThisWeek}h</p>
              <p className="text-[10px] text-muted-foreground">Study Hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold">{tasksCompletedThisWeek}</p>
              <p className="text-[10px] text-muted-foreground">Tasks Done</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-lg font-bold">{revisionsThisWeek}</p>
              <p className="text-[10px] text-muted-foreground">Reviewed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-lg font-bold">
                {streak > 0 ? `${streak} 🔥` : "0"}
              </p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Completion rate */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" /> Completion Rate
            </span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Subject distribution */}
        {subjectDistribution.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Time by Subject</p>
            {subjectDistribution.map((item, idx) => (
              <div key={item.name} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[idx % colors.length]}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

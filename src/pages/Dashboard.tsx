import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, differenceInDays, isToday, isPast } from "date-fns";
import {
  BookOpen,
  CheckSquare,
  Clock,
  Brain,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/stores/useTaskStore";
import { useExamStore } from "@/stores/useExamStore";
import { useRoutineStore } from "@/stores/useRoutineStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRevisionStore } from "@/stores/useRevisionStore";

export function Dashboard() {
  const tasks = useTaskStore((s) => s.getActiveTasks());
  const exams = useExamStore((s) => s.getActiveExams());
  const routineEntries = useRoutineStore((s) => s.entries);
  const subjects = useSubjectStore((s) => s.subjects);
  const revisionItems = useRevisionStore((s) => s.schedules);

  const today = new Date();
  const dayOfWeek = today.getDay();

  // Due tonight tasks
  const dueTonight = useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false;
        const date = new Date(t.dueDate);
        return isToday(date) || isPast(date);
      }),
    [tasks]
  );

  // Tasks due today count
  const tasksDueToday = dueTonight.length;

  // Revision items pending
  const pendingRevisions = useMemo(
    () =>
      revisionItems.filter(
        (r) => r.deletedAt === null && r.status === "pending"
      ).length,
    [revisionItems]
  );

  // Upcoming exam within 30 days
  const upcomingExam = useMemo(() => {
    const upcoming = exams
      .filter((e) => e.type === "upcoming")
      .filter((e) => {
        const start = new Date(e.startDate);
        const diff = differenceInDays(start, today);
        return diff >= 0 && diff <= 30;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    return upcoming[0] || null;
  }, [exams, today]);

  // Today's routine
  const todayRoutine = useMemo(
    () =>
      routineEntries
        .filter((e) => e.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [routineEntries, dayOfWeek]
  );

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Exam Countdown */}
      {upcomingExam && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{upcomingExam.name}</p>
              <p className="text-xs text-muted-foreground">
                Starts {format(new Date(upcomingExam.startDate), "MMM d")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {differenceInDays(new Date(upcomingExam.startDate), today)}
              </p>
              <p className="text-xs text-muted-foreground">days left</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <CheckSquare className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{tasksDueToday}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Brain className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{pendingRevisions}</p>
            <p className="text-xs text-muted-foreground">To Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{todayRoutine.length}</p>
            <p className="text-xs text-muted-foreground">Classes Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Due Tonight Section */}
      {dueTonight.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Due Tonight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueTonight.slice(0, 5).map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                >
                  <Badge variant="secondary" className="text-[10px]">
                    {subject?.name || "?"}
                  </Badge>
                  <span className="text-sm flex-1 truncate">{task.topic}</span>
                </div>
              );
            })}
            {dueTonight.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{dueTonight.length - 5} more
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Classes */}
      {todayRoutine.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today&apos;s Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayRoutine.map((entry) => {
              const subject = subjects.find((s) => s.id === entry.subjectId);
              const paper = subject?.papers.find((p) => p.id === entry.paperId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-muted-foreground w-[80px] text-xs">
                    {entry.startTime} - {entry.endTime}
                  </span>
                  <span className="font-medium">{subject?.name || "?"}</span>
                  {paper && (
                    <span className="text-xs text-muted-foreground">
                      ({paper.name})
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick action */}
      <Link to="/daily-log">
        <Button variant="outline" className="w-full h-12 gap-2">
          <BookOpen className="h-5 w-5" />
          Log today&apos;s classes
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>
      </Link>

      {/* Revision suggestions if no tasks */}
      {dueTonight.length === 0 && pendingRevisions > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Suggested Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {pendingRevisions} topics ready for review.
            </p>
            <Link to="/revision">
              <Button variant="link" size="sm" className="p-0 mt-1">
                Go to revision queue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

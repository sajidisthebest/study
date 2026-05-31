import { useMemo } from "react";
import { Link } from "react-router-dom";
import { isToday, isPast } from "date-fns";
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
import { useRoutineStore } from "@/stores/useRoutineStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { ExamCountdown } from "@/components/exams/ExamCountdown";

export function Dashboard() {
  const tasks = useTaskStore((s) => s.getActiveTasks());
  const routineEntries = useRoutineStore((s) => s.entries);
  const subjects = useSubjectStore((s) => s.subjects);
  const revisionItems = useRevisionStore((s) => s.schedules);
  const examModeActive = useSettingsStore((s) => s.examModeActive);
  const getItemsDueToday = useRevisionStore((s) => s.getItemsDueToday);

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

      {/* Exam Mode Banner */}
      {examModeActive && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-3 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-600">EXAM MODE ACTIVE</span>
            <span className="text-xs text-muted-foreground ml-auto">Focus on exam subjects</span>
          </CardContent>
        </Card>
      )}

      {/* Exam Countdown */}
      <ExamCountdown />

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
              Revision Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {getItemsDueToday().slice(0, 3).map((item) => {
              const subject = subjects.find((s) => s.id === item.subjectId);
              return (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Badge variant="secondary" className="text-[10px]">
                    {subject?.name || "?"}
                  </Badge>
                  <span className="text-sm flex-1 truncate">{item.topicName}</span>
                </div>
              );
            })}
            <Link to="/revision">
              <Button variant="link" size="sm" className="p-0 mt-1">
                Go to revision queue ({pendingRevisions} items)
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

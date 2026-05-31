import { format } from "date-fns";
import { X, Clock, BookOpen, CheckSquare, GraduationCap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoutineStore } from "@/stores/useRoutineStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useExamStore } from "@/stores/useExamStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { cn } from "@/lib/utils";
import type { RoutineEntry, Task, Exam, RevisionSchedule } from "@/types";

interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

export function DayDetail({ date, onClose }: DayDetailProps) {
  const entries = useRoutineStore((s) => s.entries);
  const tasks = useTaskStore((s) => s.tasks);
  const exams = useExamStore((s) => s.exams);
  const schedules = useRevisionStore((s) => s.schedules);
  const subjects = useSubjectStore((s) => s.subjects);

  const dayOfWeek = date.getDay();
  const dateStr = format(date, "yyyy-MM-dd");

  // Classes for this day of week
  const classes = entries
    .filter((e) => e.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Tasks due on this date
  const dueTasks = tasks.filter(
    (t) => t.deletedAt === null && t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === dateStr
  );

  // Exams on this date
  const activeExams = exams.filter((e) => {
    if (e.deletedAt !== null) return false;
    const start = format(new Date(e.startDate), "yyyy-MM-dd");
    const end = format(new Date(e.endDate), "yyyy-MM-dd");
    return dateStr >= start && dateStr <= end;
  });

  // Revision items due on this date
  const dueRevisions = schedules.filter(
    (s) =>
      s.deletedAt === null &&
      s.status !== "mastered" &&
      format(new Date(s.nextReviewDate), "yyyy-MM-dd") === dateStr
  );

  const getSubjectName = (subjectId: string) =>
    subjects.find((s) => s.id === subjectId)?.name || "Unknown";

  const getPaperName = (subjectId: string, paperId: string | null) => {
    if (!paperId) return null;
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.papers.find((p) => p.id === paperId)?.name || null;
  };

  const hasContent = classes.length > 0 || dueTasks.length > 0 || activeExams.length > 0 || dueRevisions.length > 0;

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      {/* Overlay for mobile */}
      <div className="absolute inset-0 bg-black/50 md:hidden" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l shadow-lg overflow-y-auto md:relative md:border md:rounded-lg md:shadow-none">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold">{format(date, "EEEE, MMM d, yyyy")}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {!hasContent && (
            <p className="text-center text-muted-foreground py-8">No items for this day.</p>
          )}

          {/* Classes */}
          {classes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-medium">Classes</h4>
                <Badge variant="secondary" className="text-xs">{classes.length}</Badge>
              </div>
              <div className="space-y-2">
                {classes.map((entry) => (
                  <ClassItem key={entry.id} entry={entry} getSubjectName={getSubjectName} getPaperName={getPaperName} />
                ))}
              </div>
            </div>
          )}

          {/* Tasks Due */}
          {dueTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4 text-red-500" />
                <h4 className="text-sm font-medium">Tasks Due</h4>
                <Badge variant="secondary" className="text-xs">{dueTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {dueTasks.map((task) => (
                  <TaskItem key={task.id} task={task} getSubjectName={getSubjectName} />
                ))}
              </div>
            </div>
          )}

          {/* Exams */}
          {activeExams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-purple-500" />
                <h4 className="text-sm font-medium">Exams</h4>
                <Badge variant="secondary" className="text-xs">{activeExams.length}</Badge>
              </div>
              <div className="space-y-2">
                {activeExams.map((exam) => (
                  <ExamItem key={exam.id} exam={exam} />
                ))}
              </div>
            </div>
          )}

          {/* Revision */}
          {dueRevisions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-green-500" />
                <h4 className="text-sm font-medium">Revision Due</h4>
                <Badge variant="secondary" className="text-xs">{dueRevisions.length}</Badge>
              </div>
              <div className="space-y-2">
                {dueRevisions.map((revision) => (
                  <RevisionItem key={revision.id} revision={revision} getSubjectName={getSubjectName} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassItem({
  entry,
  getSubjectName,
  getPaperName,
}: {
  entry: RoutineEntry;
  getSubjectName: (id: string) => string;
  getPaperName: (subjectId: string, paperId: string | null) => string | null;
}) {
  const paper = getPaperName(entry.subjectId, entry.paperId);
  return (
    <div className="p-2.5 rounded-md border bg-blue-50 dark:bg-blue-950/30 text-sm">
      <div className="font-medium">{getSubjectName(entry.subjectId)}</div>
      {paper && <div className="text-xs text-muted-foreground">{paper}</div>}
      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        <Clock className="h-3 w-3" />
        {entry.startTime} - {entry.endTime}
      </div>
    </div>
  );
}

function TaskItem({ task, getSubjectName }: { task: Task; getSubjectName: (id: string) => string }) {
  return (
    <div className="p-2.5 rounded-md border bg-red-50 dark:bg-red-950/30 text-sm">
      <div className="font-medium">{task.topic}</div>
      <div className="text-xs text-muted-foreground">{getSubjectName(task.subjectId)}</div>
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] mt-1",
          task.urgency === "critical" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          task.urgency === "high" && "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
          task.urgency === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
        )}
      >
        {task.urgency}
      </Badge>
    </div>
  );
}

function ExamItem({ exam }: { exam: Exam }) {
  return (
    <div className="p-2.5 rounded-md border bg-purple-50 dark:bg-purple-950/30 text-sm">
      <div className="font-medium">{exam.name}</div>
      <div className="text-xs text-muted-foreground">
        {format(new Date(exam.startDate), "MMM d")} - {format(new Date(exam.endDate), "MMM d")}
      </div>
    </div>
  );
}

function RevisionItem({
  revision,
  getSubjectName,
}: {
  revision: RevisionSchedule;
  getSubjectName: (id: string) => string;
}) {
  return (
    <div className="p-2.5 rounded-md border bg-green-50 dark:bg-green-950/30 text-sm">
      <div className="font-medium">{revision.topicName}</div>
      <div className="text-xs text-muted-foreground">{getSubjectName(revision.subjectId)}</div>
      <div className="text-xs text-muted-foreground">Review #{revision.reviewCount + 1}</div>
    </div>
  );
}

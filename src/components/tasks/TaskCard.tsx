import { useState } from "react";
import { format, isToday, isPast, isThisWeek } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTagStore } from "@/stores/useTagStore";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
}

function getDueDateColor(dueDate: string | null): string {
  if (!dueDate) return "text-muted-foreground";
  const date = new Date(dueDate);
  if (isPast(date) || isToday(date)) return "text-red-500";
  if (isThisWeek(date)) return "text-orange-500";
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  if (date <= thirtyDaysFromNow) return "text-yellow-500";
  return "text-muted-foreground";
}

function getSubjectColor(name: string): string {
  const colors: Record<string, string> = {
    Bangla: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    English: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ICT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Finance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Accounting: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Management: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    Marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  };
  return colors[name] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
}

function getTagColor(color: string): string {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };
  return colors[color] || "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
}

export function TaskCard({
  task,
  selectionMode = false,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const subjects = useSubjectStore((s) => s.subjects);
  const tags = useTagStore((s) => s.tags);

  const subject = subjects.find((s) => s.id === task.subjectId);
  const paper = subject?.papers.find((p) => p.id === task.paperId);
  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  return (
    <Card
      className={cn(
        "p-3 transition-all",
        selected && "ring-2 ring-primary",
        hovered && "shadow-md"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-2">
        {selectionMode && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect?.(task.id)}
            className="mt-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {subject && (
              <Badge
                variant="secondary"
                className={cn("text-xs", getSubjectColor(subject.name))}
              >
                {subject.name}
              </Badge>
            )}
            {paper && (
              <span className="text-xs text-muted-foreground">
                {paper.name}
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-tight line-clamp-2">
            {task.topic}
          </p>
          {task.dueDate && (
            <p className={cn("text-xs mt-1", getDueDateColor(task.dueDate))}>
              {isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
                ? "Overdue: "
                : isToday(new Date(task.dueDate))
                ? "Due tonight: "
                : ""}
              {format(new Date(task.dueDate), "MMM d")}
            </p>
          )}
          {taskTags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {taskTags.map((tag) => (
                <span
                  key={tag.id}
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                    getTagColor(tag.color)
                  )}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={cn("flex flex-col gap-1", !hovered && !selectionMode && "md:opacity-0")}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit?.(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

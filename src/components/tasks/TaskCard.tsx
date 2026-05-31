import { useState, useMemo } from "react";
import { format, isToday, isPast, isThisWeek } from "date-fns";
import { Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTagStore } from "@/stores/useTagStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useColumnStore } from "@/stores/useColumnStore";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onMove?: (id: string, columnId: string) => void;
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
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };
  return colors[color] || "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
}

function getUrgencyBorderColor(urgency: Task["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "border-l-red-500";
    case "high":
      return "border-l-orange-500";
    case "medium":
      return "border-l-yellow-500";
    default:
      return "border-l-transparent";
  }
}

export function TaskCard({
  task,
  selectionMode = false,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
  onMove,
}: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const subjects = useSubjectStore((s) => s.subjects);
  const tags = useTagStore((s) => s.tags);
  const cardDisplayFields = useSettingsStore((s) => s.cardDisplayFields);
  const allColumns = useColumnStore((s) => s.columns);
  const columns = useMemo(() => allColumns.filter((c) => c.deletedAt === null), [allColumns]);
  const currentColumn = columns.find((c) => c.id === task.columnId);

  // Default fields if none configured
  const fields = cardDisplayFields.length > 0
    ? cardDisplayFields
    : ["subject", "paper", "dueDate", "tags", "urgency"];

  const showSubject = fields.includes("subject");
  const showPaper = fields.includes("paper");
  const showDueDate = fields.includes("dueDate");
  const showTags = fields.includes("tags");
  const showDescription = fields.includes("description");
  const showUrgency = fields.includes("urgency");

  const subject = subjects.find((s) => s.id === task.subjectId);
  const paper = subject?.papers.find((p) => p.id === task.paperId);
  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  return (
    <Card
      className={cn(
        "p-3 transition-all border-l-4",
        selected && "ring-2 ring-primary",
        hovered && "shadow-md",
        showUrgency ? getUrgencyBorderColor(task.urgency) : "border-l-transparent"
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
          {(showSubject || showPaper) && (
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {showSubject && subject && (
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getSubjectColor(subject.name))}
                >
                  {subject.name}
                </Badge>
              )}
              {showPaper && paper && (
                <span className="text-xs text-muted-foreground">
                  {paper.name}
                </span>
              )}
            </div>
          )}
          <p className="text-sm font-medium leading-tight line-clamp-2">
            {task.topic}
          </p>
          {showDescription && task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {task.description}
            </p>
          )}
          {showDueDate && task.dueDate && (
            <p className={cn("text-xs mt-1", getDueDateColor(task.dueDate))}>
              {isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
                ? "Overdue: "
                : isToday(new Date(task.dueDate))
                ? "Due tonight: "
                : ""}
              {format(new Date(task.dueDate), "MMM d")}
            </p>
          )}
          {showTags && taskTags.length > 0 && (
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
          {currentColumn && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground mt-1.5">
              {currentColumn.name}
            </span>
          )}
        </div>
        <div className={cn("flex flex-col gap-1", !hovered && !selectionMode && "md:opacity-0")}>
          {onMove && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMoveOpen(!moveOpen)}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </Button>
              {moveOpen && (
                <div className="absolute right-0 top-7 z-50 min-w-[140px] bg-popover border rounded-md shadow-md py-1">
                  {columns
                    .filter((c) => c.id !== task.columnId)
                    .map((col) => (
                      <button
                        key={col.id}
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          onMove(task.id, col.id);
                          setMoveOpen(false);
                        }}
                      >
                        {col.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
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

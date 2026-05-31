import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { isToday, isPast, isThisWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/types";

interface ListViewProps {
  tasks: Task[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectSection: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onMove?: (id: string, columnId: string) => void;
}

interface Section {
  key: string;
  title: string;
  tasks: Task[];
}

function categorizeTask(task: Task): string {
  if (!task.dueDate) return "pending";
  const date = new Date(task.dueDate);
  if (isPast(date) || isToday(date)) return "due-tonight";
  if (isThisWeek(date)) return "this-week";
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  if (date <= thirtyDaysFromNow) return "upcoming";
  return "pending";
}

export function ListView({
  tasks,
  selectedIds,
  onSelect,
  onSelectSection,
  onDelete,
  onEdit,
  onMove,
}: ListViewProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const sections: Section[] = [
    { key: "due-tonight", title: "Due Tonight", tasks: [] },
    { key: "this-week", title: "Due This Week", tasks: [] },
    { key: "upcoming", title: "Upcoming", tasks: [] },
    { key: "pending", title: "Pending", tasks: [] },
  ];

  tasks.forEach((task) => {
    const category = categorizeTask(task);
    const section = sections.find((s) => s.key === category);
    if (section) section.tasks.push(task);
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isAllSelected = (sectionTasks: Task[]) =>
    sectionTasks.length > 0 && sectionTasks.every((t) => selectedIds.has(t.id));

  return (
    <div className="space-y-4">
      {sections.map(
        (section) =>
          section.tasks.length > 0 && (
            <div key={section.key}>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => toggleSection(section.key)}
                >
                  {collapsedSections.has(section.key) ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Checkbox
                  checked={isAllSelected(section.tasks)}
                  onCheckedChange={() =>
                    onSelectSection(section.tasks.map((t) => t.id))
                  }
                />
                <h3 className="text-sm font-semibold">{section.title}</h3>
                <span className="text-xs text-muted-foreground">
                  ({section.tasks.length})
                </span>
              </div>
              {!collapsedSections.has(section.key) && (
                <div className="space-y-2 ml-2">
                  {section.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      selectionMode={selectedIds.size > 0}
                      selected={selectedIds.has(task.id)}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onMove={onMove}
                    />
                  ))}
                </div>
              )}
            </div>
          )
      )}
      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No tasks to display.
        </p>
      )}
    </div>
  );
}

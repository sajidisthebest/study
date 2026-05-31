import { useState, useMemo, useCallback } from "react";
import { List, LayoutGrid, Plus, Search, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListView } from "@/components/tasks/ListView";
import { BoardView } from "@/components/tasks/BoardView";
import { BulkActionBar } from "@/components/tasks/BulkActionBar";
import { TaskForm } from "@/components/tasks/TaskForm";
import { EmptyState } from "@/components/common/EmptyState";
import { useTaskStore } from "@/stores/useTaskStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTagStore } from "@/stores/useTagStore";
import { useToastUndo } from "@/lib/useToastUndo";
import type { Task } from "@/types";

type ViewMode = "list" | "board";

export function Tasks() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("tasks-view-mode");
    return (saved as ViewMode) || "list";
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterPaper, setFilterPaper] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setAddColumnId] = useState<string | null>(null);

  const allTasks = useTaskStore((s) => s.tasks);
  const tasks = useMemo(() => allTasks.filter((t) => t.deletedAt === null), [allTasks]);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const restoreTask = useTaskStore((s) => s.restoreTask);
  const moveTask = useTaskStore((s) => s.moveTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const allSubjects = useSubjectStore((s) => s.subjects);
  const subjects = useMemo(() => allSubjects.filter((s) => s.deletedAt === null), [allSubjects]);
  const allTags = useTagStore((s) => s.tags);
  const tags = useMemo(() => allTags.filter((t) => t.deletedAt === null), [allTags]);
  const { scheduleDelete } = useToastUndo();

  const changeView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("tasks-view-mode", mode);
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterSubject && filterSubject !== "all") {
      result = result.filter((t) => t.subjectId === filterSubject);
    }
    if (filterPaper && filterPaper !== "all") {
      result = result.filter((t) => t.paperId === filterPaper);
    }
    if (filterTag && filterTag !== "all") {
      result = result.filter((t) => t.tags.includes(filterTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.topic.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, filterSubject, filterPaper, filterTag, searchQuery]);

  const selectedSubject = subjects.find((s) => s.id === filterSubject);
  const papers = selectedSubject?.papers.filter((p) => !p.deletedAt) || [];

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectSection = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      scheduleDelete([id], deleteTask, restoreTask);
    },
    [deleteTask, restoreTask, scheduleDelete]
  );

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    scheduleDelete(ids, deleteTask, restoreTask);
    setSelectedIds(new Set());
  }, [selectedIds, deleteTask, restoreTask, scheduleDelete]);

  const handleBulkMove = useCallback(
    (columnId: string) => {
      selectedIds.forEach((id) => moveTask(id, columnId));
      setSelectedIds(new Set());
    },
    [selectedIds, moveTask]
  );

  const handleBulkTag = useCallback(
    (tagId: string) => {
      selectedIds.forEach((id) => {
        const task = tasks.find((t) => t.id === id);
        if (task && !task.tags.includes(tagId)) {
          updateTask(id, { tags: [...task.tags, tagId] });
        }
      });
      setSelectedIds(new Set());
    },
    [selectedIds, tasks, updateTask]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
  }, [filteredTasks]);

  const handleEdit = useCallback((task: Task) => {
    setEditTask(task);
    setFormOpen(true);
  }, []);

  const handleMove = useCallback(
    (id: string, columnId: string) => {
      moveTask(id, columnId);
    },
    [moveTask]
  );

  const handleAddTask = useCallback((columnId?: string) => {
    setEditTask(null);
    if (columnId) setAddColumnId(columnId);
    setFormOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => changeView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => changeView("board")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            className="hidden md:flex"
            onClick={() => handleAddTask()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterSubject} onValueChange={(v) => { setFilterSubject(v); setFilterPaper("all"); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {papers.length > 0 && (
          <Select value={filterPaper} onValueChange={setFilterPaper}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Paper" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Papers</SelectItem>
              {papers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Views */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="No tasks yet. Add homework from your Daily Log or create a task manually."
          actionLabel="Add Task"
          onAction={() => handleAddTask()}
        />
      ) : viewMode === "list" ? (
        <ListView
          tasks={filteredTasks}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectSection={handleSelectSection}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onMove={handleMove}
        />
      ) : (
        <BoardView
          tasks={filteredTasks}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAddTask={handleAddTask}
        />
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onSelectAll={handleSelectAll}
        onClear={() => setSelectedIds(new Set())}
        onDelete={handleBulkDelete}
        onMove={handleBulkMove}
        onTag={handleBulkTag}
      />

      {/* Floating Add Button (mobile) */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-30"
        onClick={() => handleAddTask()}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Task Form */}
      <TaskForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditTask(null);
            setAddColumnId(null);
          }
        }}
        editTask={editTask}
      />
    </div>
  );
}

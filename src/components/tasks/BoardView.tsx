import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./TaskCard";
import { useColumnStore } from "@/stores/useColumnStore";
import { useTaskStore } from "@/stores/useTaskStore";
import type { Task } from "@/types";

interface BoardViewProps {
  tasks: Task[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}

function SortableTaskCard({
  task,
  selectedIds,
  onSelect,
  onDelete,
  onEdit,
}: {
  task: Task;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        selectionMode={selectedIds.size > 0}
        selected={selectedIds.has(task.id)}
        onSelect={onSelect}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}

export function BoardView({
  tasks,
  selectedIds,
  onSelect,
  onDelete,
  onEdit,
  onAddTask,
}: BoardViewProps) {
  const allColumns = useColumnStore((s) => s.columns);
  const columns = useMemo(() => allColumns.filter((c) => c.deletedAt === null), [allColumns]);
  const updateColumn = useColumnStore((s) => s.updateColumn);
  const addColumn = useColumnStore((s) => s.addColumn);
  const moveTask = useTaskStore((s) => s.moveTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      moveTask(taskId, targetColumn.id);
      return;
    }

    // Check if dropped on another task - move to that task's column
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && targetTask.id !== taskId) {
      moveTask(taskId, targetTask.columnId);
    }
  };

  const startEditingColumn = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setEditingColumnName(currentName);
  };

  const saveColumnName = () => {
    if (editingColumnId && editingColumnName.trim()) {
      updateColumn(editingColumnId, editingColumnName.trim());
    }
    setEditingColumnId(null);
    setEditingColumnName("");
  };

  const cancelEditingColumn = () => {
    setEditingColumnId(null);
    setEditingColumnName("");
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim());
      setNewColumnName("");
      setAddingColumn(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none scrollbar-hide">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.columnId === column.id);
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-[280px] md:w-[300px] snap-center"
            >
              <div className="bg-muted/50 rounded-lg p-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  {editingColumnId === column.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        value={editingColumnName}
                        onChange={(e) => setEditingColumnName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveColumnName();
                          if (e.key === "Escape") cancelEditingColumn();
                        }}
                        onBlur={saveColumnName}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={saveColumnName}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={cancelEditingColumn}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-semibold">{column.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                          onClick={() => startEditingColumn(column.id, column.name)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        {columnTasks.length}
                      </span>
                    </>
                  )}
                </div>
                <SortableContext
                  id={column.id}
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ScrollArea className="flex-1 max-h-[60vh]">
                    <div className="space-y-2 pr-2">
                      {columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          selectedIds={selectedIds}
                          onSelect={onSelect}
                          onDelete={onDelete}
                          onEdit={onEdit}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </SortableContext>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-muted-foreground"
                  onClick={() => onAddTask(column.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add task
                </Button>
              </div>
            </div>
          );
        })}
        {/* Add Column Button */}
        <div className="flex-shrink-0 w-[280px] md:w-[300px] snap-center">
          {addingColumn ? (
            <div className="bg-muted/50 rounded-lg p-3">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column name..."
                className="h-8 text-sm mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") {
                    setAddingColumn(false);
                    setNewColumnName("");
                  }
                }}
              />
              <div className="flex gap-1">
                <Button size="sm" className="h-7 text-xs" onClick={handleAddColumn}>
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setAddingColumn(false);
                    setNewColumnName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-12 border-dashed text-muted-foreground"
              onClick={() => setAddingColumn(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </Button>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}

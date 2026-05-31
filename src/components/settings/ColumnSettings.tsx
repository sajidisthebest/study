import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useColumnStore } from "@/stores/useColumnStore";
import type { Column } from "@/types";

function SortableColumn({
  column,
  isEditing,
  editName,
  setEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  canDelete,
}: {
  column: Column;
  isEditing: boolean;
  editName: string;
  setEditName: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 border rounded-md bg-card">
      <button type="button" className="cursor-grab touch-none text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
            autoFocus
            className="h-8"
          />
          <Button size="sm" variant="ghost" onClick={onSaveEdit}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium">{column.name}</span>
          <Button size="sm" variant="ghost" onClick={onStartEdit} className="h-7 w-7 p-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Tasks will move to Pending"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function ColumnSettings() {
  const { columns, addColumn, updateColumn, deleteColumn, reorderColumns } = useColumnStore();
  const activeColumns = columns
    .filter((c) => c.deletedAt === null)
    .sort((a, b) => a.order - b.order);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim());
      setNewColumnName("");
      setShowAddForm(false);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editingColumnName.trim()) {
      updateColumn(id, editingColumnName.trim());
    }
    setEditingColumnId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeColumns.findIndex((c) => c.id === active.id);
    const newIndex = activeColumns.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(activeColumns, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i,
    }));
    reorderColumns(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Board Columns</h3>
        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-1" />
          Add Column
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Drag to reorder columns. Deleting a column moves its tasks to the first available column.
      </p>

      {showAddForm && (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <Input
            placeholder="Column name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            autoFocus
          />
          <Button size="sm" onClick={handleAddColumn}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setNewColumnName(""); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activeColumns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {activeColumns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                isEditing={editingColumnId === column.id}
                editName={editingColumnName}
                setEditName={setEditingColumnName}
                onStartEdit={() => { setEditingColumnId(column.id); setEditingColumnName(column.name); }}
                onSaveEdit={() => handleSaveEdit(column.id)}
                onCancelEdit={() => setEditingColumnId(null)}
                onDelete={() => deleteColumn(column.id)}
                canDelete={activeColumns.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

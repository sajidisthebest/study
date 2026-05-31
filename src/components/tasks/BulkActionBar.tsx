import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useColumnStore } from "@/stores/useColumnStore";
import { useTagStore } from "@/stores/useTagStore";

interface BulkActionBarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete: () => void;
  onMove: (columnId: string) => void;
  onTag: (tagId: string) => void;
}

export function BulkActionBar({
  selectedCount,
  onSelectAll,
  onClear,
  onDelete,
  onMove,
  onTag,
}: BulkActionBarProps) {
  const columns = useColumnStore((s) => s.getActiveColumns());
  const tags = useTagStore((s) => s.getActiveTags());

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 flex items-center justify-center px-4">
      <div className="flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg flex-wrap justify-center max-w-lg w-full">
        <span className="text-sm font-medium px-2">
          {selectedCount} selected
        </span>
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          Select All
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
        <Select onValueChange={onMove}>
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Move to..." />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={onTag}>
          <SelectTrigger className="h-8 w-[90px] text-xs">
            <SelectValue placeholder="Tag..." />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTagStore } from "@/stores/useTagStore";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  { name: "red", value: "red" },
  { name: "orange", value: "orange" },
  { name: "yellow", value: "yellow" },
  { name: "green", value: "green" },
  { name: "blue", value: "blue" },
  { name: "purple", value: "purple" },
  { name: "pink", value: "pink" },
  { name: "gray", value: "gray" },
];

function getTagColorClasses(color: string): string {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };
  return colors[color] || colors.gray;
}

function getSwatchBg(color: string): string {
  const colors: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    gray: "bg-gray-500",
  };
  return colors[color] || "bg-gray-500";
}

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const [customHex, setCustomHex] = useState("");

  return (
    <div className="space-y-3 p-2">
      <div className="grid grid-cols-4 gap-2">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color.value}
            type="button"
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all",
              getSwatchBg(color.value),
              value === color.value ? "border-foreground scale-110" : "border-transparent"
            )}
            onClick={() => onChange(color.value)}
            title={color.name}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="#hex"
          value={customHex}
          onChange={(e) => setCustomHex(e.target.value)}
          className="h-7 text-xs"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-7"
          onClick={() => {
            if (customHex.trim()) {
              onChange(customHex.trim());
              setCustomHex("");
            }
          }}
        >
          Set
        </Button>
      </div>
    </div>
  );
}

export function TagSettings() {
  const { tags, addTag, updateTag, deleteTag } = useTagStore();
  const activeTags = tags.filter((t) => t.deletedAt === null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName.trim(), newTagColor);
      setNewTagName("");
      setNewTagColor("blue");
      setShowAddForm(false);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editingTagName.trim()) {
      updateTag(id, { name: editingTagName.trim() });
    }
    setEditingTagId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tags</h3>
        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      </div>

      {showAddForm && (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 flex-wrap">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            autoFocus
            className="flex-1 min-w-[120px]"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span className={cn("h-4 w-4 rounded-full", getSwatchBg(newTagColor))} />
                Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ColorPicker value={newTagColor} onChange={setNewTagColor} />
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={handleAddTag}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setNewTagName(""); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {activeTags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-3 p-3 border rounded-md">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn("h-6 w-6 rounded-full shrink-0 cursor-pointer border", getSwatchBg(tag.color))}
                  title="Change color"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ColorPicker value={tag.color} onChange={(color) => updateTag(tag.id, { color })} />
              </PopoverContent>
            </Popover>

            {editingTagId === tag.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(tag.id)}
                  autoFocus
                  className="h-8"
                />
                <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(tag.id)}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingTagId(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{tag.name}</span>
                <Badge variant="secondary" className={cn("text-xs", getTagColorClasses(tag.color))}>
                  {tag.name}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditingTagId(tag.id); setEditingTagName(tag.name); }}
                  className="h-7 w-7 p-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteTag(tag.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

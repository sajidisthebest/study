import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTagStore } from "@/stores/useTagStore";
import { useColumnStore } from "@/stores/useColumnStore";
import { useTaskStore } from "@/stores/useTaskStore";
import type { Task } from "@/types";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: Task | null;
}

export function TaskForm({ open, onOpenChange, editTask }: TaskFormProps) {
  const allSubjects = useSubjectStore((s) => s.subjects);
  const subjects = useMemo(() => allSubjects.filter((s) => s.deletedAt === null), [allSubjects]);
  const allTags = useTagStore((s) => s.tags);
  const tags = useMemo(() => allTags.filter((t) => t.deletedAt === null), [allTags]);
  const allColumns = useColumnStore((s) => s.columns);
  const columns = useMemo(() => allColumns.filter((c) => c.deletedAt === null), [allColumns]);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [subjectId, setSubjectId] = useState("");
  const [paperId, setPaperId] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [columnId, setColumnId] = useState("");

  useEffect(() => {
    if (editTask) {
      setSubjectId(editTask.subjectId);
      setPaperId(editTask.paperId || "");
      setTopic(editTask.topic);
      setDescription(editTask.description);
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate) : undefined);
      setSelectedTags(editTask.tags);
      setColumnId(editTask.columnId);
    } else {
      setSubjectId("");
      setPaperId("");
      setTopic("");
      setDescription("");
      setDueDate(undefined);
      setSelectedTags([]);
      setColumnId(columns[0]?.id || "");
    }
  }, [editTask, open, columns]);

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const papers = selectedSubject?.papers.filter((p) => !p.deletedAt) || [];

  const handleSubmit = () => {
    if (!topic.trim() || !subjectId) return;

    if (editTask) {
      updateTask(editTask.id, {
        subjectId,
        paperId: paperId || null,
        topic: topic.trim(),
        description: description.trim(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        tags: selectedTags,
        columnId: columnId || columns[0]?.id || "",
      });
    } else {
      addTask({
        subjectId,
        paperId: paperId || null,
        topic: topic.trim(),
        description: description.trim(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        tags: selectedTags,
        columnId: columnId || columns[0]?.id || "",
      });
    }
    onOpenChange(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const formContent = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setPaperId(""); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {papers.length > 0 && (
        <div className="space-y-2">
          <Label>Paper</Label>
          <Select value={paperId} onValueChange={setPaperId}>
            <SelectTrigger>
              <SelectValue placeholder="Select paper" />
            </SelectTrigger>
            <SelectContent>
              {papers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Topic</Label>
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What needs to be done?"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Column</Label>
        <Select value={columnId} onValueChange={setColumnId}>
          <SelectTrigger>
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={!topic.trim() || !subjectId}>
        {editTask ? "Update Task" : "Add Task"}
      </Button>
    </div>
  );

  // Use Sheet on mobile, Dialog on desktop
  return (
    <>
      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editTask ? "Edit Task" : "Add Task"}</SheetTitle>
              <SheetDescription>
                {editTask ? "Update the task details below." : "Fill in the details to create a new task."}
              </SheetDescription>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Dialog */}
      <div className="hidden md:block">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editTask ? "Edit Task" : "Add Task"}</DialogTitle>
              <DialogDescription>
                {editTask ? "Update the task details below." : "Fill in the details to create a new task."}
              </DialogDescription>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

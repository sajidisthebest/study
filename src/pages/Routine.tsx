import { useState } from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRoutineStore } from "@/stores/useRoutineStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import type { RoutineEntry } from "@/types";
import { cn } from "@/lib/utils";

const DAYS = [
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
];



function getSubjectColorClass(name: string): string {
  const colors: Record<string, string> = {
    Bangla: "bg-green-200 dark:bg-green-900 border-green-400",
    English: "bg-blue-200 dark:bg-blue-900 border-blue-400",
    ICT: "bg-purple-200 dark:bg-purple-900 border-purple-400",
    Finance: "bg-yellow-200 dark:bg-yellow-900 border-yellow-400",
    Accounting: "bg-red-200 dark:bg-red-900 border-red-400",
    Management: "bg-indigo-200 dark:bg-indigo-900 border-indigo-400",
    Marketing: "bg-pink-200 dark:bg-pink-900 border-pink-400",
  };
  return colors[name] || "bg-gray-200 dark:bg-gray-800 border-gray-400";
}

interface FormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  paperId: string | null;
}

export function Routine() {
  const { addEntry, updateEntry, deleteEntry, getActiveEntries } = useRoutineStore();
  const entries = getActiveEntries();
  const subjects = useSubjectStore((s) => s.subjects).filter((s) => s.deletedAt === null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    dayOfWeek: 6,
    startTime: "09:00",
    endTime: "10:00",
    subjectId: "",
    paperId: null,
  });

  const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
  const activePapers = selectedSubject?.papers.filter((p) => p.deletedAt === null) || [];

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.startTime || !formData.endTime) return;
    if (editingId) {
      updateEntry(editingId, formData);
      setEditingId(null);
    } else {
      addEntry(formData);
    }
    setFormData({ dayOfWeek: 6, startTime: "09:00", endTime: "10:00", subjectId: "", paperId: null });
    setShowForm(false);
  };

  const handleEdit = (entry: RoutineEntry) => {
    setFormData({
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subjectId,
      paperId: entry.paperId,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ dayOfWeek: 6, startTime: "09:00", endTime: "10:00", subjectId: "", paperId: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Class Routine</h1>
          <p className="text-muted-foreground mt-1">Your weekly class schedule.</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-1" />
          Add Class
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Day</label>
              <Select
                value={String(formData.dayOfWeek)}
                onValueChange={(v) => setFormData({ ...formData, dayOfWeek: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Select
                value={formData.subjectId}
                onValueChange={(v) => setFormData({ ...formData, subjectId: v, paperId: null })}
              >
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Start Time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Time</label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            {activePapers.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Paper (optional)</label>
                <Select
                  value={formData.paperId || "none"}
                  onValueChange={(v) => setFormData({ ...formData, paperId: v === "none" ? null : v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {activePapers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>
              {editingId ? "Update" : "Add"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Desktop: Grid View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {DAYS.map((day) => (
            <div key={day.value} className="text-center">
              <div className="text-sm font-medium p-2 bg-muted rounded-t-md">{day.label}</div>
              <div className="border rounded-b-md min-h-[200px] p-1 space-y-1">
                {entries
                  .filter((e) => e.dayOfWeek === day.value)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((entry) => {
                    const subject = subjects.find((s) => s.id === entry.subjectId);
                    const paper = subject?.papers.find((p) => p.id === entry.paperId);
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "p-1.5 rounded text-xs border cursor-pointer transition-opacity hover:opacity-80",
                          subject ? getSubjectColorClass(subject.name) : "bg-muted"
                        )}
                        onClick={() => handleEdit(entry)}
                      >
                        <div className="font-medium truncate">{subject?.name || "Unknown"}</div>
                        {paper && <div className="text-[10px] opacity-70 truncate">{paper.name}</div>}
                        <div className="text-[10px] opacity-70 flex items-center gap-0.5 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {entry.startTime}-{entry.endTime}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: List View grouped by day */}
      <div className="md:hidden space-y-4">
        {DAYS.map((day) => {
          const dayEntries = entries
            .filter((e) => e.dayOfWeek === day.value)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          if (dayEntries.length === 0) return null;
          return (
            <div key={day.value}>
              <h3 className="text-sm font-medium mb-2">{day.label}</h3>
              <div className="space-y-1.5">
                {dayEntries.map((entry) => {
                  const subject = subjects.find((s) => s.id === entry.subjectId);
                  const paper = subject?.papers.find((p) => p.id === entry.paperId);
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-md border",
                        subject ? getSubjectColorClass(subject.name) : "bg-muted"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{subject?.name || "Unknown"}</p>
                        {paper && <p className="text-xs opacity-70">{paper.name}</p>}
                        <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {entry.startTime} - {entry.endTime}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)} className="h-7 w-7 p-0">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteEntry(entry.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No classes added yet. Click "Add Class" to get started.
          </p>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useColumnStore } from "@/stores/useColumnStore";

export function TuitionTracker() {
  const allSubjects = useSubjectStore((s) => s.subjects);
  const subjects = useMemo(() => allSubjects.filter((s) => s.deletedAt === null), [allSubjects]);
  const allEntries = useTrackerStore((s) => s.entries);
  const entries = useMemo(() => allEntries.filter((e) => e.deletedAt === null && e.type === "tuition"), [allEntries]);
  const addEntry = useTrackerStore((s) => s.addEntry);
  const addTask = useTaskStore((s) => s.addTask);
  const columns = useColumnStore((s) => s.columns);

  // Filter to Finance and Accounting only
  const tuitionSubjects = subjects.filter(
    (s) => s.name === "Finance" || s.name === "Accounting"
  );

  const [showForm, setShowForm] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    subjectId: "",
    paperId: "",
    topic: "",
    homework: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!form.subjectId || !form.topic) return;
    addEntry({
      type: "tuition",
      date: form.date,
      subjectId: form.subjectId,
      paperId: form.paperId || null,
      topic: form.topic,
      notes: form.notes,
      duration: null,
      teacherName: null,
      location: null,
      accomplishment: null,
      homework: form.homework || null,
    });

    // If homework entered, create a task
    if (form.homework.trim()) {
      const pendingCol = columns.find((c) => c.name === "This Week" && !c.deletedAt);
      addTask({
        subjectId: form.subjectId,
        paperId: form.paperId || null,
        topic: `Tuition HW: ${form.topic}`,
        description: form.homework,
        dueDate: null,
        columnId: pendingCol?.id || columns[0]?.id || "",
        tags: [],
      });
    }

    setForm({ date: format(new Date(), "yyyy-MM-dd"), subjectId: "", paperId: "", topic: "", homework: "", notes: "" });
    setShowForm(false);
  };

  const selectedSubject = tuitionSubjects.find((s) => s.id === form.subjectId);
  const activePapers = selectedSubject?.papers.filter((p) => !p.deletedAt) || [];

  const filteredEntries = filterSubject === "all"
    ? entries
    : entries.filter((e) => e.subjectId === filterSubject);

  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Finance & Accounting tuition lessons</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Log Lesson
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Log Tuition Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Subject</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v, paperId: "" }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {tuitionSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activePapers.length > 0 && (
              <div>
                <Label className="text-xs">Paper</Label>
                <Select
                  value={form.paperId}
                  onValueChange={(v) => setForm((f) => ({ ...f, paperId: v }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select paper" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePapers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs">Topic Covered</Label>
              <Input
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="What was taught"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Homework from Tutor</Label>
              <Textarea
                value={form.homework}
                onChange={(e) => setForm((f) => ({ ...f, homework: e.target.value }))}
                placeholder="Homework details (will create a task)"
                className="text-xs min-h-[60px]"
              />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes"
                className="text-xs min-h-[60px]"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit}>Save Lesson</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filterSubject === "all" ? "default" : "outline"}
          onClick={() => setFilterSubject("all")}
          className="text-xs h-7"
        >
          All
        </Button>
        {tuitionSubjects.map((s) => (
          <Button
            key={s.id}
            size="sm"
            variant={filterSubject === s.id ? "default" : "outline"}
            onClick={() => setFilterSubject(s.id)}
            className="text-xs h-7"
          >
            {s.name}
          </Button>
        ))}
      </div>

      {/* Lesson List */}
      {sortedEntries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No tuition lessons logged yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedEntries.map((entry) => {
            const subject = subjects.find((s) => s.id === entry.subjectId);
            const paper = subject?.papers.find((p) => p.id === entry.paperId);
            return (
              <Card key={entry.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {subject?.name || "?"}
                        </Badge>
                        {paper && (
                          <span className="text-[10px] text-muted-foreground">{paper.name}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{entry.topic}</p>
                      {entry.homework && (
                        <p className="text-xs text-muted-foreground">HW: {entry.homework}</p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground">{entry.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), "MMM d")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

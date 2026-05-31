import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useDailyLogStore } from "@/stores/useDailyLogStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useColumnStore } from "@/stores/useColumnStore";

export function DailyLog() {
  const [subjectId, setSubjectId] = useState("");
  const [paperId, setPaperId] = useState("");
  const [whatWasTaught, setWhatWasTaught] = useState("");
  const [homework, setHomework] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const allSubjects = useSubjectStore((s) => s.subjects);
  const subjects = useMemo(() => allSubjects.filter((s) => s.deletedAt === null), [allSubjects]);
  const addLog = useDailyLogStore((s) => s.addLog);
  const allLogs = useDailyLogStore((s) => s.logs);
  const logs = useMemo(() => allLogs.filter((l) => l.deletedAt === null), [allLogs]);
  const addTask = useTaskStore((s) => s.addTask);
  const allColumns = useColumnStore((s) => s.columns);
  const columns = useMemo(() => allColumns.filter((c) => c.deletedAt === null), [allColumns]);

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const papers = selectedSubject?.papers.filter((p) => !p.deletedAt) || [];

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLogs = useMemo(
    () => logs.filter((l) => l.date === todayStr),
    [logs, todayStr]
  );

  const handleSave = () => {
    if (!subjectId || !whatWasTaught.trim()) return;

    // Save daily log
    addLog({
      date: todayStr,
      subjectId,
      paperId: paperId || null,
      whatWasTaught: whatWasTaught.trim(),
      homework: homework.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
    });

    // Auto-create a task from homework if provided
    if (homework.trim()) {
      addTask({
        subjectId,
        paperId: paperId || null,
        topic: homework.trim(),
        description: `Auto-created from daily log on ${format(new Date(), "MMM d")}`,
        dueDate: dueDate ? dueDate.toISOString() : null,
        tags: [],
        columnId: columns[0]?.id || "",
      });
    }

    // Reset form
    setSubjectId("");
    setPaperId("");
    setWhatWasTaught("");
    setHomework("");
    setDueDate(undefined);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Daily Log</h1>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">What happened today?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={subjectId}
              onValueChange={(v) => {
                setSubjectId(v);
                setPaperId("");
              }}
            >
              <SelectTrigger className="h-12 text-base">
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

          {/* Paper (conditional) */}
          {papers.length > 0 && (
            <div className="space-y-2">
              <Label>Paper</Label>
              <Select value={paperId} onValueChange={setPaperId}>
                <SelectTrigger className="h-12 text-base">
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

          {/* What was taught */}
          <div className="space-y-2">
            <Label>What was taught</Label>
            <Textarea
              value={whatWasTaught}
              onChange={(e) => setWhatWasTaught(e.target.value)}
              placeholder="Topics covered in class today..."
              className="min-h-[80px] text-base"
            />
          </div>

          {/* Homework */}
          <div className="space-y-2">
            <Label>Homework</Label>
            <Textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="Assignment or homework given..."
              className="min-h-[60px] text-base"
            />
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left text-base font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a due date"}
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

          <Button
            onClick={handleSave}
            className="w-full h-12 text-base"
            disabled={!subjectId || !whatWasTaught.trim()}
          >
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {/* Today's Logs */}
      {todayLogs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Today&apos;s Entries</h2>
          {todayLogs.map((log) => {
            const subject = subjects.find((s) => s.id === log.subjectId);
            const paper = subject?.papers.find((p) => p.id === log.paperId);
            return (
              <Card key={log.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {subject?.name || "Unknown"}
                    </Badge>
                    {paper && (
                      <span className="text-xs text-muted-foreground">
                        {paper.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{log.whatWasTaught}</p>
                  {log.homework && (
                    <p className="text-xs text-muted-foreground mt-1">
                      HW: {log.homework}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

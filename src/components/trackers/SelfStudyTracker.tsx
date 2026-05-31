import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth, subDays } from "date-fns";
import { Plus, Flame, Clock } from "lucide-react";
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

export function SelfStudyTracker() {
  const subjects = useSubjectStore((s) => s.getActiveSubjects());
  const entries = useTrackerStore((s) => s.getEntriesByType("self_study"));
  const addEntry = useTrackerStore((s) => s.addEntry);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    subjectId: "",
    paperId: "",
    topic: "",
    duration: "",
    notes: "",
    accomplishment: "",
  });

  const handleSubmit = () => {
    if (!form.subjectId || !form.topic || !form.duration) return;
    addEntry({
      type: "self_study",
      date: form.date,
      subjectId: form.subjectId,
      paperId: form.paperId || null,
      topic: form.topic,
      notes: form.notes,
      duration: parseInt(form.duration) || 0,
      teacherName: null,
      location: null,
      accomplishment: form.accomplishment || null,
      homework: null,
    });
    setForm({
      date: format(new Date(), "yyyy-MM-dd"),
      subjectId: "",
      paperId: "",
      topic: "",
      duration: "",
      notes: "",
      accomplishment: "",
    });
    setShowForm(false);
  };

  const selectedSubject = subjects.find((s) => s.id === form.subjectId);
  const activePapers = selectedSubject?.papers.filter((p) => !p.deletedAt) || [];

  // Weekly stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const weekEntries = useMemo(
    () =>
      entries.filter((e) =>
        isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd })
      ),
    [entries, weekStart, weekEnd]
  );

  const monthEntries = useMemo(
    () =>
      entries.filter((e) =>
        isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
      ),
    [entries, monthStart, monthEnd]
  );

  const weekHours = Math.round(
    weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60 * 10
  ) / 10;

  const monthHours = Math.round(
    monthEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60 * 10
  ) / 10;

  // Weekly hours per subject (for visual bars)
  const weekBySubject = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of weekEntries) {
      map[e.subjectId] = (map[e.subjectId] || 0) + (e.duration || 0);
    }
    return Object.entries(map)
      .map(([subjectId, minutes]) => ({
        subjectId,
        subjectName: subjects.find((s) => s.id === subjectId)?.name || "?",
        minutes,
        hours: Math.round(minutes / 60 * 10) / 10,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [weekEntries, subjects]);

  const maxMinutes = Math.max(...weekBySubject.map((s) => s.minutes), 1);

  // Streak calculation
  const streak = useMemo(() => {
    const dates = new Set(entries.map((e) => e.date));
    let count = 0;
    let day = new Date();
    // Check if today has a session
    const todayStr = format(day, "yyyy-MM-dd");
    if (!dates.has(todayStr)) {
      // Check yesterday - maybe streak is still active from yesterday
      day = subDays(day, 1);
    }
    while (true) {
      const dateStr = format(day, "yyyy-MM-dd");
      if (dates.has(dateStr)) {
        count++;
        day = subDays(day, 1);
      } else {
        break;
      }
    }
    return count;
  }, [entries]);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const subjectColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-cyan-500", "bg-yellow-500",
  ];

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Track your self-study sessions</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Log Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold">{weekHours}h</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold">{monthHours}h</p>
            <p className="text-[10px] text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-bold">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary Bars */}
      {weekBySubject.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Week by Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weekBySubject.map((item, idx) => (
              <div key={item.subjectId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{item.subjectName}</span>
                  <span className="text-muted-foreground">{item.hours}h</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${subjectColors[idx % subjectColors.length]}`}
                    style={{ width: `${(item.minutes / maxMinutes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Log Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Log Study Session</CardTitle>
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
                <Label className="text-xs">Duration (min)</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="60"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {activePapers.length > 0 && (
                <div>
                  <Label className="text-xs">Paper (optional)</Label>
                  <Select
                    value={form.paperId}
                    onValueChange={(v) => setForm((f) => ({ ...f, paperId: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePapers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs">Topic</Label>
              <Input
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="What did you study?"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">What was accomplished</Label>
              <Textarea
                value={form.accomplishment}
                onChange={(e) => setForm((f) => ({ ...f, accomplishment: e.target.value }))}
                placeholder="Summary of what you achieved"
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
              <Button size="sm" onClick={handleSubmit}>Save Session</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {sortedEntries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No study sessions logged yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedEntries.slice(0, 20).map((entry) => {
            const subject = subjects.find((s) => s.id === entry.subjectId);
            return (
              <Card key={entry.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {subject?.name || "?"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {entry.duration} min
                        </span>
                      </div>
                      <p className="text-sm font-medium">{entry.topic}</p>
                      {entry.accomplishment && (
                        <p className="text-xs text-muted-foreground">{entry.accomplishment}</p>
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

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trophy } from "lucide-react";
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
import { useExamStore } from "@/stores/useExamStore";
import { useSubjectStore } from "@/stores/useSubjectStore";

export function PastExams() {
  const exams = useExamStore((s) => s.getActiveExams());
  const addExam = useExamStore((s) => s.addExam);
  const addExamSubject = useExamStore((s) => s.addExamSubject);
  const subjects = useSubjectStore((s) => s.getActiveSubjects());

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    subjectId: "",
    paperId: "",
    name: "",
    totalMarks: "",
    obtainedMarks: "",
    notes: "",
  });

  const pastExams = exams
    .filter((e) => e.type === "past")
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const handleSubmit = () => {
    if (!form.subjectId || !form.name || !form.totalMarks || !form.obtainedMarks) return;
    const total = parseInt(form.totalMarks);
    const obtained = parseInt(form.obtainedMarks);

    addExam({
      name: form.name,
      type: "past",
      startDate: form.date,
      endDate: form.date,
      routineImage: null,
    });

    // Get the newly created exam
    const newExams = useExamStore.getState().getActiveExams();
    const newExam = newExams[newExams.length - 1];
    if (newExam) {
      addExamSubject(newExam.id, {
        subjectId: form.subjectId,
        paperId: form.paperId || null,
        totalMarks: total,
        obtainedMarks: obtained,
        chapters: [],
      });
    }

    setForm({
      date: format(new Date(), "yyyy-MM-dd"),
      subjectId: "",
      paperId: "",
      name: "",
      totalMarks: "",
      obtainedMarks: "",
      notes: "",
    });
    setShowForm(false);
  };

  const selectedSubject = subjects.find((s) => s.id === form.subjectId);
  const activePapers = selectedSubject?.papers.filter((p) => !p.deletedAt) || [];

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Subject-wise averages
  const subjectAverages = subjects
    .map((subject) => {
      const subjectExams = pastExams.filter((e) =>
        e.subjects.some((es) => es.subjectId === subject.id && es.obtainedMarks !== null)
      );
      if (subjectExams.length === 0) return null;
      let totalPct = 0;
      let count = 0;
      for (const exam of subjectExams) {
        for (const es of exam.subjects) {
          if (es.subjectId === subject.id && es.obtainedMarks !== null && es.totalMarks > 0) {
            totalPct += (es.obtainedMarks / es.totalMarks) * 100;
            count++;
          }
        }
      }
      return count > 0 ? { name: subject.name, avg: Math.round(totalPct / count) } : null;
    })
    .filter(Boolean) as { name: string; avg: number }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Past exam results</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Result
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Add Exam Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Exam Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Midterm 2024"
                className="h-8 text-xs"
              />
            </div>
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
                    {subjects.map((s) => (
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Total Marks</Label>
                <Input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm((f) => ({ ...f, totalMarks: e.target.value }))}
                  placeholder="100"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Obtained Marks</Label>
                <Input
                  type="number"
                  value={form.obtainedMarks}
                  onChange={(e) => setForm((f) => ({ ...f, obtainedMarks: e.target.value }))}
                  placeholder="75"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes/Reflection</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="What went well, what to improve"
                className="text-xs min-h-[60px]"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit}>Save Result</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Averages */}
      {subjectAverages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Subject Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {subjectAverages.map((sa) => (
              <div key={sa.name} className="flex justify-between text-xs">
                <span>{sa.name}</span>
                <span className={`font-medium ${getPercentageColor(sa.avg)}`}>
                  {sa.avg}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Exams List */}
      {pastExams.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No past exam results yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pastExams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{exam.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exam.startDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {exam.subjects.map((es) => {
                  const subj = subjects.find((s) => s.id === es.subjectId);
                  const pct = es.totalMarks > 0 && es.obtainedMarks !== null
                    ? Math.round((es.obtainedMarks / es.totalMarks) * 100)
                    : null;
                  return (
                    <div key={es.id} className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {subj?.name || "?"}
                      </Badge>
                      {es.obtainedMarks !== null && (
                        <>
                          <span className="text-xs">
                            {es.obtainedMarks}/{es.totalMarks}
                          </span>
                          {pct !== null && (
                            <span className={`text-xs font-medium ${getPercentageColor(pct)}`}>
                              ({pct}%)
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

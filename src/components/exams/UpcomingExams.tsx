import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { Plus, Calendar, Trash2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExamStore } from "@/stores/useExamStore";
import { useSubjectStore } from "@/stores/useSubjectStore";

export function UpcomingExams() {
  const allExams = useExamStore((s) => s.exams);
  const exams = useMemo(() => allExams.filter((e) => e.deletedAt === null), [allExams]);
  const addExam = useExamStore((s) => s.addExam);
  const updateExam = useExamStore((s) => s.updateExam);
  const deleteExam = useExamStore((s) => s.deleteExam);
  const addExamSubject = useExamStore((s) => s.addExamSubject);
  const allSubjects = useSubjectStore((s) => s.subjects);
  const subjects = useMemo(() => allSubjects.filter((s) => s.deletedAt === null), [allSubjects]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    selectedSubjects: [] as string[],
  });

  const upcomingExams = exams
    .filter((e) => e.type === "upcoming")
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const handleSubmit = () => {
    if (!form.name || !form.startDate) return;
    addExam({
      name: form.name,
      type: "upcoming",
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      routineImage: null,
    });

    // Add selected subjects
    const allExams = useExamStore.getState().getActiveExams();
    const newExam = allExams[allExams.length - 1];
    if (newExam) {
      for (const subjectId of form.selectedSubjects) {
        addExamSubject(newExam.id, {
          subjectId,
          paperId: null,
          totalMarks: 0,
          obtainedMarks: null,
          chapters: [],
        });
      }
    }

    setForm({ name: "", startDate: "", endDate: "", selectedSubjects: [] });
    setShowForm(false);
  };

  const toggleSubject = (subjectId: string) => {
    setForm((f) => ({
      ...f,
      selectedSubjects: f.selectedSubjects.includes(subjectId)
        ? f.selectedSubjects.filter((id) => id !== subjectId)
        : [...f.selectedSubjects, subjectId],
    }));
  };

  const handleImageUpload = (examId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateExam(examId, { routineImage: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Upcoming exams and schedule</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Exam
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Add Upcoming Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Exam Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Final Exam 2024"
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Subjects Included</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {subjects.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.selectedSubjects.includes(s.id)}
                      onCheckedChange={() => toggleSubject(s.id)}
                    />
                    <span className="text-xs">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit}>Add Exam</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Exams List */}
      {upcomingExams.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming exams scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {upcomingExams.map((exam) => {
            const daysUntil = differenceInDays(new Date(exam.startDate), new Date());
            const examSubjects = exam.subjects
              .map((es) => subjects.find((s) => s.id === es.subjectId)?.name)
              .filter(Boolean);
            const isUrgent = daysUntil < 7;

            return (
              <Card key={exam.id} className={isUrgent ? "border-red-500/30" : ""}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(exam.startDate), "MMM d")}
                        {exam.endDate !== exam.startDate && (
                          <> - {format(new Date(exam.endDate), "MMM d")}</>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isUrgent ? "text-red-500" : "text-primary"}`}>
                        {daysUntil}
                      </p>
                      <p className="text-[10px] text-muted-foreground">days</p>
                    </div>
                  </div>

                  {examSubjects.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {examSubjects.map((name) => (
                        <Badge key={name} variant="secondary" className="text-[10px]">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    {/* Image upload */}
                    <Label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(exam.id, file);
                        }}
                      />
                      <Badge variant="outline" className="text-[10px] cursor-pointer">
                        <Image className="h-3 w-3 mr-1" />
                        {exam.routineImage ? "Update Routine" : "Upload Routine"}
                      </Badge>
                    </Label>

                    {exam.routineImage && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Badge variant="outline" className="text-[10px] cursor-pointer">
                            View Routine
                          </Badge>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{exam.name} - Routine</DialogTitle>
                          </DialogHeader>
                          <img
                            src={exam.routineImage}
                            alt="Exam routine"
                            className="w-full rounded-md"
                          />
                        </DialogContent>
                      </Dialog>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-destructive hover:text-destructive ml-auto"
                      onClick={() => deleteExam(exam.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExamStore } from "@/stores/useExamStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTrackerStore } from "@/stores/useTrackerStore";
import type { ExamChapter } from "@/types";

export function ExamSyllabus() {
  const exams = useExamStore((s) => s.getActiveExams());
  const updateExamSubject = useExamStore((s) => s.updateExamSubject);
  const subjects = useSubjectStore((s) => s.getActiveSubjects());
  const collegeProgress = useTrackerStore((s) => s.collegeProgress);

  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [newChapterName, setNewChapterName] = useState<Record<string, string>>({});

  const upcomingExams = exams.filter((e) => e.type === "upcoming");
  const selectedExam = upcomingExams.find((e) => e.id === selectedExamId);

  const handleAddChapter = (examSubjectId: string) => {
    if (!selectedExam) return;
    const key = examSubjectId;
    const name = newChapterName[key]?.trim();
    if (!name) return;

    const examSubject = selectedExam.subjects.find((es) => es.id === examSubjectId);
    if (!examSubject) return;

    const newChapters: ExamChapter[] = [
      ...examSubject.chapters,
      { name, completed: false },
    ];
    updateExamSubject(selectedExam.id, examSubjectId, { chapters: newChapters });
    setNewChapterName((p) => ({ ...p, [key]: "" }));
  };

  const toggleChapter = (examSubjectId: string, chapterIdx: number) => {
    if (!selectedExam) return;
    const examSubject = selectedExam.subjects.find((es) => es.id === examSubjectId);
    if (!examSubject) return;

    const newChapters = examSubject.chapters.map((ch, idx) =>
      idx === chapterIdx ? { ...ch, completed: !ch.completed } : ch
    );
    updateExamSubject(selectedExam.id, examSubjectId, { chapters: newChapters });
  };

  const getSubjectProgress = (chapters: ExamChapter[]) => {
    if (chapters.length === 0) return 0;
    const completed = chapters.filter((ch) => ch.completed).length;
    return Math.round((completed / chapters.length) * 100);
  };

  return (
    <div className="space-y-4">
      <div>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select an upcoming exam" />
          </SelectTrigger>
          <SelectContent>
            {upcomingExams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedExam && (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {upcomingExams.length === 0
                ? "Add an upcoming exam first"
                : "Select an exam to manage syllabus"}
            </p>
          </CardContent>
        </Card>
      )}

      {selectedExam && selectedExam.subjects.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No subjects added to this exam yet. Add subjects in the Upcoming Exams tab.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedExam && selectedExam.subjects.map((examSubject) => {
        const subject = subjects.find((s) => s.id === examSubject.subjectId);
        const paper = subject?.papers.find((p) => p.id === examSubject.paperId);
        const progress = getSubjectProgress(examSubject.chapters);
        const key = examSubject.id;

        // Check if college tracker has matching data
        const collegeData = collegeProgress.find(
          (cp) => cp.subjectId === examSubject.subjectId && cp.paperId === (examSubject.paperId || "")
        );

        return (
          <Card key={examSubject.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {subject?.name || "?"}
                  </Badge>
                  {paper && <span className="text-xs text-muted-foreground">{paper.name}</span>}
                </CardTitle>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {examSubject.chapters.map((chapter, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox
                    checked={chapter.completed}
                    onCheckedChange={() => toggleChapter(examSubject.id, idx)}
                  />
                  <span className={`text-xs ${chapter.completed ? "line-through text-muted-foreground" : ""}`}>
                    {chapter.name}
                  </span>
                </div>
              ))}

              {/* Add chapter */}
              <div className="flex gap-1 mt-2">
                <Input
                  placeholder="Add chapter"
                  value={newChapterName[key] || ""}
                  onChange={(e) => setNewChapterName((p) => ({ ...p, [key]: e.target.value }))}
                  className="h-7 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddChapter(examSubject.id);
                  }}
                />
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleAddChapter(examSubject.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Link to college tracker */}
              {collegeData && collegeData.chapters.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {collegeData.chapters.length} chapters tracked in College Tracker
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

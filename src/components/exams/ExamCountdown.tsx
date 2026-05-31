import { useMemo, useState, useEffect } from "react";
import { differenceInDays, differenceInHours } from "date-fns";
import { GraduationCap, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExamStore } from "@/stores/useExamStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function ExamCountdown() {
  const exams = useExamStore((s) => s.getActiveExams());
  const subjects = useSubjectStore((s) => s.subjects);
  const setExamModeActive = useSettingsStore((s) => s.setExamModeActive);
  const examModeActive = useSettingsStore((s) => s.examModeActive);
  const [, setTick] = useState(0);

  // Refresh every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const nearestExam = useMemo(() => {
    const now = new Date();
    const upcoming = exams
      .filter((e) => e.type === "upcoming" && new Date(e.startDate) > now)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    return upcoming[0] || null;
  }, [exams]);

  // Auto-activate exam mode
  useEffect(() => {
    if (nearestExam) {
      const daysUntil = differenceInDays(new Date(nearestExam.startDate), new Date());
      if (daysUntil < 7 && !examModeActive) {
        setExamModeActive(true);
      } else if (daysUntil >= 7 && examModeActive) {
        setExamModeActive(false);
      }
    } else if (examModeActive) {
      setExamModeActive(false);
    }
  }, [nearestExam, examModeActive, setExamModeActive]);

  if (!nearestExam) return null;

  const now = new Date();
  const examDate = new Date(nearestExam.startDate);
  const daysLeft = differenceInDays(examDate, now);
  const hoursLeft = differenceInHours(examDate, now) % 24;
  const isUrgent = daysLeft < 7;

  const examSubjectNames = nearestExam.subjects
    .map((es) => subjects.find((s) => s.id === es.subjectId)?.name)
    .filter(Boolean);

  return (
    <Card className={isUrgent ? "border-red-500/50 bg-red-500/5" : "border-primary/30 bg-primary/5"}>
      <CardContent className="p-4">
        {isUrgent && (
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <Badge className="bg-red-500 text-white text-[10px]">EXAM MODE</Badge>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <GraduationCap className={`h-6 w-6 ${isUrgent ? "text-red-500" : "text-primary"}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{nearestExam.name}</p>
            {examSubjectNames.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-1">
                {examSubjectNames.map((name) => (
                  <Badge key={name} variant="secondary" className="text-[10px]">
                    {name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${isUrgent ? "text-red-500" : "text-primary"}`}>
              {daysLeft}d {hoursLeft}h
            </p>
            <p className="text-xs text-muted-foreground">until exam</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { differenceInDays } from "date-fns";
import { Check, SkipForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import type { RevisionSchedule } from "@/types";

interface RevisionCardProps {
  item: RevisionSchedule;
  showActions?: boolean;
}

export function RevisionCard({ item, showActions = true }: RevisionCardProps) {
  const subjects = useSubjectStore((s) => s.subjects);
  const markReviewed = useRevisionStore((s) => s.markReviewed);
  const skipItem = useRevisionStore((s) => s.skipItem);
  const deleteSchedule = useRevisionStore((s) => s.deleteSchedule);

  const subject = subjects.find((s) => s.id === item.subjectId);
  const paper = subject?.papers.find((p) => p.id === item.paperId);
  const daysSinceFirst = differenceInDays(new Date(), new Date(item.firstStudiedAt));
  const isDue = new Date(item.nextReviewDate) <= new Date();

  const reviewLabel = item.reviewCount === 0
    ? "1st Review"
    : `${item.reviewCount + 1}${getOrdinalSuffix(item.reviewCount + 1)} Review`;

  return (
    <Card className={isDue ? "border-primary/30" : ""}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">{item.topicName}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {subject && (
                <Badge variant="secondary" className="text-[10px]">
                  {subject.name}
                </Badge>
              )}
              {paper && (
                <span className="text-[10px] text-muted-foreground">{paper.name}</span>
              )}
              <Badge variant="outline" className="text-[10px]">
                {reviewLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {daysSinceFirst} days since first study
            </p>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => markReviewed(item.id)}
            >
              <Check className="h-3 w-3 mr-1" /> Reviewed
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={() => skipItem(item.id)}
            >
              <SkipForward className="h-3 w-3 mr-1" /> Skip
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={() => deleteSchedule(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

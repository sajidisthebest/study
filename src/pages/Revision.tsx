import { useMemo } from "react";
import { Brain, CheckCircle2, Calendar, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { RevisionCard } from "@/components/revision/RevisionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { format } from "date-fns";

export function Revision() {
  const getItemsDueToday = useRevisionStore((s) => s.getItemsDueToday);
  const getItemsDueThisWeek = useRevisionStore((s) => s.getItemsDueThisWeek);
  const getCompletedToday = useRevisionStore((s) => s.getCompletedToday);
  const activeSchedules = useRevisionStore((s) => s.getActiveSchedules());

  const dueToday = useMemo(() => getItemsDueToday(), [getItemsDueToday]);
  const dueThisWeek = useMemo(() => getItemsDueThisWeek(), [getItemsDueThisWeek]);
  const completedToday = useMemo(() => getCompletedToday(), [getCompletedToday]);

  const totalInQueue = activeSchedules.filter((s) => s.status !== "mastered").length;
  const reviewedTodayCount = completedToday.length;

  // Next review date among non-mastered items
  const nextReviewDate = useMemo(() => {
    const pending = activeSchedules
      .filter((s) => s.status !== "mastered" && new Date(s.nextReviewDate) > new Date())
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
    return pending[0]?.nextReviewDate || null;
  }, [activeSchedules]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Revision</h1>
      <p className="text-sm text-muted-foreground">Spaced repetition review schedule</p>

      {activeSchedules.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Your revision queue is empty"
          description="Your revision queue is empty. Mark topics as completed in your trackers to add them here."
          actionLabel="Go to Trackers"
          actionTo="/trackers"
        />
      ) : (
      <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Brain className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <p className="text-lg font-bold">{totalInQueue}</p>
            <p className="text-[10px] text-muted-foreground">In Queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold">{reviewedTodayCount}</p>
            <p className="text-[10px] text-muted-foreground">Reviewed Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs font-bold">
              {nextReviewDate ? format(new Date(nextReviewDate), "MMM d") : "-"}
            </p>
            <p className="text-[10px] text-muted-foreground">Next Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Review */}
      {dueToday.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Today&apos;s Review ({dueToday.length})
          </h2>
          {dueToday.map((item) => (
            <RevisionCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 text-center">
            <PartyPopper className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground">No reviews due today. Great work!</p>
          </CardContent>
        </Card>
      )}

      {/* Coming Up This Week */}
      {dueThisWeek.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Coming Up This Week ({dueThisWeek.length})</h2>
          {dueThisWeek.map((item) => (
            <RevisionCard key={item.id} item={item} showActions={false} />
          ))}
        </div>
      )}

      {/* Completed Reviews Today */}
      {completedToday.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Completed Today ({completedToday.length})
          </h2>
          {completedToday.map((item) => (
            <RevisionCard key={item.id} item={item} showActions={false} />
          ))}
        </div>
      )}

      {/* All Items */}
      {activeSchedules.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">All Items ({activeSchedules.length})</h2>
          {activeSchedules.map((item) => (
            <RevisionCard key={item.id} item={item} showActions={false} />
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

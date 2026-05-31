import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DayDetail } from "@/components/calendar/DayDetail";
import { useRoutineStore } from "@/stores/useRoutineStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useExamStore } from "@/stores/useExamStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { cn } from "@/lib/utils";

type FilterType = "classes" | "tasks" | "exams" | "revisions";

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<Record<FilterType, boolean>>({
    classes: true,
    tasks: true,
    exams: true,
    revisions: true,
  });

  const routineEntries = useRoutineStore((s) => s.entries);
  const tasks = useTaskStore((s) => s.tasks);
  const exams = useExamStore((s) => s.exams);
  const schedules = useRevisionStore((s) => s.schedules);

  const toggleFilter = (filter: FilterType) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 6 }); // Saturday start
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Get indicators for a specific date
  const getIndicators = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();
    const indicators: { type: FilterType; color: string }[] = [];

    if (filters.classes && routineEntries.some((e) => e.deletedAt === null && e.dayOfWeek === dayOfWeek)) {
      indicators.push({ type: "classes", color: "bg-blue-500" });
    }

    if (filters.tasks && tasks.some((t) => t.deletedAt === null && t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === dateStr)) {
      indicators.push({ type: "tasks", color: "bg-red-500" });
    }

    if (filters.exams && exams.some((e) => {
      if (e.deletedAt !== null) return false;
      const start = format(new Date(e.startDate), "yyyy-MM-dd");
      const end = format(new Date(e.endDate), "yyyy-MM-dd");
      return dateStr >= start && dateStr <= end;
    })) {
      indicators.push({ type: "exams", color: "bg-purple-500" });
    }

    if (filters.revisions && schedules.some((s) =>
      s.deletedAt === null && s.status !== "mastered" && format(new Date(s.nextReviewDate), "yyyy-MM-dd") === dateStr
    )) {
      indicators.push({ type: "revisions", color: "bg-green-500" });
    }

    return indicators;
  };

  const dayHeaders = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-3 border rounded-md bg-muted/30">
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-classes"
            checked={filters.classes}
            onCheckedChange={() => toggleFilter("classes")}
          />
          <Label htmlFor="filter-classes" className="flex items-center gap-1.5 text-sm cursor-pointer">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Classes
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-tasks"
            checked={filters.tasks}
            onCheckedChange={() => toggleFilter("tasks")}
          />
          <Label htmlFor="filter-tasks" className="flex items-center gap-1.5 text-sm cursor-pointer">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Tasks
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-exams"
            checked={filters.exams}
            onCheckedChange={() => toggleFilter("exams")}
          />
          <Label htmlFor="filter-exams" className="flex items-center gap-1.5 text-sm cursor-pointer">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            Exams
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-revisions"
            checked={filters.revisions}
            onCheckedChange={() => toggleFilter("revisions")}
          />
          <Label htmlFor="filter-revisions" className="flex items-center gap-1.5 text-sm cursor-pointer">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Revisions
          </Label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Day headers */}
            {dayHeaders.map((day) => (
              <div key={day} className="text-center text-xs font-medium py-2 bg-muted">
                {day}
              </div>
            ))}
            {/* Calendar cells */}
            {calendarDays.map((date, idx) => {
              const indicators = getIndicators(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              return (
                <button
                  key={idx}
                  type="button"
                  className={cn(
                    "relative p-1 min-h-[60px] md:min-h-[80px] bg-card text-left transition-colors hover:bg-muted/50",
                    !isSameMonth(date, currentMonth) && "opacity-40",
                    isToday(date) && "bg-primary/5",
                    isSelected && "ring-2 ring-primary ring-inset"
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday(date) && "text-primary font-bold"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {indicators.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {indicators.map((ind, i) => (
                        <span
                          key={i}
                          className={cn("h-1.5 w-1.5 rounded-full", ind.color)}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Classes
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Tasks Due
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Exams
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Revisions
            </span>
          </div>
        </div>

        {/* Desktop Day Detail */}
        {selectedDate && (
          <div className="hidden md:block w-80">
            <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
          </div>
        )}
      </div>

      {/* Mobile Day Detail */}
      {selectedDate && (
        <div className="md:hidden">
          <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
        </div>
      )}
    </div>
  );
}

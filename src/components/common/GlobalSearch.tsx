import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  BookOpen,
  GraduationCap,
  Brain,
  Palette,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useTaskStore } from "@/stores/useTaskStore";
import { useDailyLogStore } from "@/stores/useDailyLogStore";
import { useExamStore } from "@/stores/useExamStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import { useSubjectStore } from "@/stores/useSubjectStore";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const tasks = useTaskStore((s) => s.getActiveTasks());
  const logs = useDailyLogStore((s) => s.getActiveLogs());
  const exams = useExamStore((s) => s.getActiveExams());
  const revisionItems = useRevisionStore((s) => s.getActiveSchedules());
  const subjects = useSubjectStore((s) => s.subjects);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (route: string) => {
      setOpen(false);
      navigate(route);
    },
    [navigate]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type to search across all your study data..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {tasks.slice(0, 8).map((task) => (
              <CommandItem
                key={task.id}
                value={`task-${task.topic}-${task.description}`}
                onSelect={() => handleSelect("/tasks")}
              >
                <CheckSquare className="mr-2 h-4 w-4 text-blue-500" />
                <span className="truncate">{task.topic}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {logs.length > 0 && (
          <CommandGroup heading="Daily Logs">
            {logs.slice(0, 8).map((log) => (
              <CommandItem
                key={log.id}
                value={`log-${log.whatWasTaught}-${log.homework}`}
                onSelect={() => handleSelect("/daily-log")}
              >
                <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                <span className="truncate">{log.whatWasTaught}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {exams.length > 0 && (
          <CommandGroup heading="Exams">
            {exams.slice(0, 8).map((exam) => (
              <CommandItem
                key={exam.id}
                value={`exam-${exam.name}`}
                onSelect={() => handleSelect("/exams")}
              >
                <GraduationCap className="mr-2 h-4 w-4 text-purple-500" />
                <span className="truncate">{exam.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {revisionItems.length > 0 && (
          <CommandGroup heading="Revision Items">
            {revisionItems.slice(0, 8).map((item) => (
              <CommandItem
                key={item.id}
                value={`revision-${item.topicName}`}
                onSelect={() => handleSelect("/revision")}
              >
                <Brain className="mr-2 h-4 w-4 text-orange-500" />
                <span className="truncate">{item.topicName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {subjects.filter((s) => !s.deletedAt).length > 0 && (
          <CommandGroup heading="Subjects">
            {subjects
              .filter((s) => !s.deletedAt)
              .map((subject) => (
                <CommandItem
                  key={subject.id}
                  value={`subject-${subject.name}`}
                  onSelect={() => handleSelect("/settings")}
                >
                  <Palette className="mr-2 h-4 w-4 text-teal-500" />
                  <span className="truncate">{subject.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

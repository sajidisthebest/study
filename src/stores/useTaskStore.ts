import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@/types";
import { generateId, calculateDueCategory } from "@/lib/utils";

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedAt" | "deletedAt" | "status" | "urgency">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  completeTask: (id: string) => void;
  moveTask: (id: string, columnId: string) => void;
  getActiveTasks: () => Task[];
  getTasksByColumn: (columnId: string) => Task[];
}

function calculateUrgency(dueDate: string | null): Task["urgency"] {
  const category = calculateDueCategory(dueDate);
  switch (category) {
    case "due-tonight":
      return "critical";
    case "this-week":
      return "high";
    case "upcoming":
      return "medium";
    default:
      return "low";
  }
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              status: "pending",
              urgency: calculateUrgency(task.dueDate),
              createdAt: new Date().toISOString(),
              completedAt: null,
              deletedAt: null,
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  urgency: updates.dueDate !== undefined
                    ? calculateUrgency(updates.dueDate)
                    : t.urgency,
                }
              : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
          ),
        })),
      restoreTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, deletedAt: null } : t
          ),
        })),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "completed" as const,
                  completedAt: new Date().toISOString(),
                }
              : t
          ),
        })),
      moveTask: (id, columnId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, columnId } : t
          ),
        })),
      getActiveTasks: () => get().tasks.filter((t) => t.deletedAt === null),
      getTasksByColumn: (columnId) =>
        get().tasks.filter(
          (t) => t.deletedAt === null && t.columnId === columnId
        ),
    }),
    { name: "task-storage" }
  )
);

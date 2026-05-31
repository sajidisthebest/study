import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function getUrgencyColor(dueDate: string | null): string {
  if (!dueDate) return "text-muted-foreground";
  const date = new Date(dueDate);
  if (isPast(date)) return "text-red-500";
  if (isToday(date)) return "text-orange-500";
  if (isTomorrow(date)) return "text-yellow-500";
  if (isThisWeek(date)) return "text-blue-500";
  return "text-muted-foreground";
}

export function calculateDueCategory(dueDate: string | null): string {
  if (!dueDate) return "pending";
  const date = new Date(dueDate);
  if (isPast(date) || isToday(date)) return "due-tonight";
  if (isThisWeek(date)) return "this-week";
  return "upcoming";
}

export function generateId(): string {
  return uuidv4();
}

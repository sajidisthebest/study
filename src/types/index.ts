export interface Subject {
  id: string;
  name: string;
  papers: Paper[];
  deletedAt: string | null;
}

export interface Paper {
  id: string;
  name: string;
  subjectId: string;
  deletedAt: string | null;
}

export interface Task {
  id: string;
  subjectId: string;
  paperId: string | null;
  topic: string;
  description: string;
  dueDate: string | null;
  columnId: string;
  tags: string[];
  status: "pending" | "in_progress" | "completed";
  urgency: "low" | "medium" | "high" | "critical";
  createdAt: string;
  completedAt: string | null;
  deletedAt: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  deletedAt: string | null;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  deletedAt: string | null;
}

export interface DailyLog {
  id: string;
  date: string;
  subjectId: string;
  paperId: string | null;
  whatWasTaught: string;
  homework: string;
  dueDate: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export type TrackerType = "college" | "tuition" | "self_study";

export interface TrackerEntry {
  id: string;
  type: TrackerType;
  date: string;
  subjectId: string;
  paperId: string | null;
  topic: string;
  notes: string;
  duration: number | null;
  teacherName: string | null;
  location: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface RevisionSchedule {
  id: string;
  topicName: string;
  subjectId: string;
  paperId: string | null;
  firstStudiedAt: string;
  nextReviewDate: string;
  reviewCount: number;
  intervals: number[];
  status: "pending" | "reviewed" | "mastered";
  deletedAt: string | null;
}

export interface Exam {
  id: string;
  name: string;
  type: "past" | "upcoming";
  startDate: string;
  endDate: string;
  subjects: ExamSubject[];
  routineImage: string | null;
  deletedAt: string | null;
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  paperId: string | null;
  totalMarks: number;
  obtainedMarks: number | null;
  chapters: ExamChapter[];
}

export interface ExamChapter {
  name: string;
  completed: boolean;
}

export interface RoutineEntry {
  id: string;
  subjectId: string;
  paperId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export type Theme = "dark" | "light" | "system";

export interface Settings {
  theme: Theme;
  accentColor: string;
  cardDisplayFields: string[];
  examModeActive: boolean;
}

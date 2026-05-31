import type { Subject, Column, Tag } from "@/types";
import { generateId } from "@/lib/utils";

function createSubjectWithPapers(name: string, paperNames: string[]): Subject {
  const subjectId = generateId();
  return {
    id: subjectId,
    name,
    papers: paperNames.map((paperName) => ({
      id: generateId(),
      name: paperName,
      subjectId,
      deletedAt: null,
    })),
    deletedAt: null,
  };
}

export const defaultSubjects: Subject[] = [
  createSubjectWithPapers("Bangla", ["1st Paper", "2nd Paper"]),
  createSubjectWithPapers("English", ["1st Paper", "2nd Paper"]),
  createSubjectWithPapers("ICT", []),
  createSubjectWithPapers("Finance", ["1st Paper", "2nd Paper"]),
  createSubjectWithPapers("Accounting", ["1st Paper", "2nd Paper"]),
  createSubjectWithPapers("Management", ["1st Paper", "2nd Paper"]),
  createSubjectWithPapers("Marketing", ["1st Paper", "2nd Paper"]),
];

export const defaultColumns: Column[] = [
  { id: generateId(), name: "Due Tonight", order: 0, deletedAt: null },
  { id: generateId(), name: "This Week", order: 1, deletedAt: null },
  { id: generateId(), name: "Upcoming", order: 2, deletedAt: null },
  { id: generateId(), name: "Pending", order: 3, deletedAt: null },
  { id: generateId(), name: "Done", order: 4, deletedAt: null },
];

export const defaultTags: Tag[] = [
  { id: generateId(), name: "Urgent", color: "red", deletedAt: null },
  { id: generateId(), name: "Important", color: "orange", deletedAt: null },
  { id: generateId(), name: "Easy", color: "green", deletedAt: null },
  { id: generateId(), name: "Hard", color: "purple", deletedAt: null },
  { id: generateId(), name: "Review", color: "blue", deletedAt: null },
];

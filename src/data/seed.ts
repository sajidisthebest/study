import type { Subject, Column, Tag } from "@/types";

function createSubjectWithPapers(
  subjectId: string,
  name: string,
  papers: { id: string; name: string }[]
): Subject {
  return {
    id: subjectId,
    name,
    papers: papers.map((p) => ({
      id: p.id,
      name: p.name,
      subjectId,
      deletedAt: null,
    })),
    deletedAt: null,
  };
}

export const defaultSubjects: Subject[] = [
  createSubjectWithPapers("subj-bangla", "Bangla", [
    { id: "paper-bangla-1", name: "1st Paper" },
    { id: "paper-bangla-2", name: "2nd Paper" },
  ]),
  createSubjectWithPapers("subj-english", "English", [
    { id: "paper-english-1", name: "1st Paper" },
    { id: "paper-english-2", name: "2nd Paper" },
  ]),
  createSubjectWithPapers("subj-ict", "ICT", []),
  createSubjectWithPapers("subj-finance", "Finance", [
    { id: "paper-finance-1", name: "1st Paper" },
    { id: "paper-finance-2", name: "2nd Paper" },
  ]),
  createSubjectWithPapers("subj-accounting", "Accounting", [
    { id: "paper-accounting-1", name: "1st Paper" },
    { id: "paper-accounting-2", name: "2nd Paper" },
  ]),
  createSubjectWithPapers("subj-management", "Management", [
    { id: "paper-management-1", name: "1st Paper" },
    { id: "paper-management-2", name: "2nd Paper" },
  ]),
  createSubjectWithPapers("subj-marketing", "Marketing", [
    { id: "paper-marketing-1", name: "1st Paper" },
    { id: "paper-marketing-2", name: "2nd Paper" },
  ]),
];

export const defaultColumns: Column[] = [
  { id: "col-due-tonight", name: "Due Tonight", order: 0, deletedAt: null },
  { id: "col-this-week", name: "This Week", order: 1, deletedAt: null },
  { id: "col-upcoming", name: "Upcoming", order: 2, deletedAt: null },
  { id: "col-pending", name: "Pending", order: 3, deletedAt: null },
  { id: "col-done", name: "Done", order: 4, deletedAt: null },
];

export const defaultTags: Tag[] = [
  { id: "tag-urgent", name: "Urgent", color: "red", deletedAt: null },
  { id: "tag-important", name: "Important", color: "orange", deletedAt: null },
  { id: "tag-easy", name: "Easy", color: "green", deletedAt: null },
  { id: "tag-hard", name: "Hard", color: "purple", deletedAt: null },
  { id: "tag-review", name: "Review", color: "blue", deletedAt: null },
];

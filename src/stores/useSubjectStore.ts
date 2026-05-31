import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Subject, Paper } from "@/types";
import { defaultSubjects } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface SubjectState {
  subjects: Subject[];
  addSubject: (name: string) => void;
  updateSubject: (id: string, name: string) => void;
  deleteSubject: (id: string) => void;
  restoreSubject: (id: string) => void;
  addPaper: (subjectId: string, name: string) => void;
  updatePaper: (subjectId: string, paperId: string, name: string) => void;
  deletePaper: (subjectId: string, paperId: string) => void;
  restorePaper: (subjectId: string, paperId: string) => void;
  getActiveSubjects: () => Subject[];
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set, get) => ({
      subjects: defaultSubjects,
      addSubject: (name: string) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            { id: generateId(), name, papers: [], deletedAt: null },
          ],
        })),
      updateSubject: (id: string, name: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        })),
      deleteSubject: (id: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s
          ),
        })),
      restoreSubject: (id: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, deletedAt: null } : s
          ),
        })),
      addPaper: (subjectId: string, name: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  papers: [
                    ...s.papers,
                    {
                      id: generateId(),
                      name,
                      subjectId,
                      deletedAt: null,
                    } as Paper,
                  ],
                }
              : s
          ),
        })),
      updatePaper: (subjectId: string, paperId: string, name: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  papers: s.papers.map((p) =>
                    p.id === paperId ? { ...p, name } : p
                  ),
                }
              : s
          ),
        })),
      deletePaper: (subjectId: string, paperId: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  papers: s.papers.map((p) =>
                    p.id === paperId
                      ? { ...p, deletedAt: new Date().toISOString() }
                      : p
                  ),
                }
              : s
          ),
        })),
      restorePaper: (subjectId: string, paperId: string) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  papers: s.papers.map((p) =>
                    p.id === paperId ? { ...p, deletedAt: null } : p
                  ),
                }
              : s
          ),
        })),
      getActiveSubjects: () =>
        get().subjects.filter((s) => s.deletedAt === null),
    }),
    { name: "subject-storage" }
  )
);

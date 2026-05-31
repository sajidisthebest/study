import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Exam, ExamSubject } from "@/types";
import { generateId } from "@/lib/utils";

interface ExamState {
  exams: Exam[];
  addExam: (exam: Omit<Exam, "id" | "deletedAt" | "subjects">) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  restoreExam: (id: string) => void;
  addExamSubject: (examId: string, subject: Omit<ExamSubject, "id" | "examId">) => void;
  updateExamSubject: (examId: string, subjectEntryId: string, updates: Partial<ExamSubject>) => void;
  removeExamSubject: (examId: string, subjectEntryId: string) => void;
  getActiveExams: () => Exam[];
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      exams: [],
      addExam: (exam) =>
        set((state) => ({
          exams: [
            ...state.exams,
            { ...exam, id: generateId(), subjects: [], deletedAt: null },
          ],
        })),
      updateExam: (id, updates) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteExam: (id) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e
          ),
        })),
      restoreExam: (id) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === id ? { ...e, deletedAt: null } : e
          ),
        })),
      addExamSubject: (examId, subject) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  subjects: [
                    ...e.subjects,
                    { ...subject, id: generateId(), examId },
                  ],
                }
              : e
          ),
        })),
      updateExamSubject: (examId, subjectEntryId, updates) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  subjects: e.subjects.map((s) =>
                    s.id === subjectEntryId ? { ...s, ...updates } : s
                  ),
                }
              : e
          ),
        })),
      removeExamSubject: (examId, subjectEntryId) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  subjects: e.subjects.filter((s) => s.id !== subjectEntryId),
                }
              : e
          ),
        })),
      getActiveExams: () => get().exams.filter((e) => e.deletedAt === null),
    }),
    { name: "exam-storage" }
  )
);

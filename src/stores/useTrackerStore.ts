import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackerEntry, TrackerType, CollegeProgress, TopicStatus } from "@/types";
import { generateId } from "@/lib/utils";

interface TrackerState {
  entries: TrackerEntry[];
  collegeProgress: CollegeProgress[];
  addEntry: (entry: Omit<TrackerEntry, "id" | "createdAt" | "deletedAt">) => void;
  updateEntry: (id: string, updates: Partial<TrackerEntry>) => void;
  deleteEntry: (id: string) => void;
  restoreEntry: (id: string) => void;
  getActiveEntries: () => TrackerEntry[];
  getEntriesByType: (type: TrackerType) => TrackerEntry[];
  // College progress
  addChapter: (subjectId: string, paperId: string, chapterName: string) => void;
  addTopic: (subjectId: string, paperId: string, chapterId: string, topicName: string) => void;
  setTopicStatus: (subjectId: string, paperId: string, chapterId: string, topicId: string, status: TopicStatus) => void;
  getProgressForSubjectPaper: (subjectId: string, paperId: string) => CollegeProgress | undefined;
  getOverallProgress: () => { total: number; completed: number };
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      entries: [],
      collegeProgress: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: generateId(),
              createdAt: new Date().toISOString(),
              deletedAt: null,
            },
          ],
        })),
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e
          ),
        })),
      restoreEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, deletedAt: null } : e
          ),
        })),
      getActiveEntries: () =>
        get().entries.filter((e) => e.deletedAt === null),
      getEntriesByType: (type) =>
        get().entries.filter(
          (e) => e.deletedAt === null && e.type === type
        ),
      addChapter: (subjectId, paperId, chapterName) =>
        set((state) => {
          const existing = state.collegeProgress.find(
            (p) => p.subjectId === subjectId && p.paperId === paperId
          );
          if (existing) {
            return {
              collegeProgress: state.collegeProgress.map((p) =>
                p.id === existing.id
                  ? {
                      ...p,
                      chapters: [
                        ...p.chapters,
                        { id: generateId(), name: chapterName, topics: [] },
                      ],
                    }
                  : p
              ),
            };
          }
          return {
            collegeProgress: [
              ...state.collegeProgress,
              {
                id: generateId(),
                subjectId,
                paperId,
                chapters: [{ id: generateId(), name: chapterName, topics: [] }],
              },
            ],
          };
        }),
      addTopic: (subjectId, paperId, chapterId, topicName) =>
        set((state) => ({
          collegeProgress: state.collegeProgress.map((p) =>
            p.subjectId === subjectId && p.paperId === paperId
              ? {
                  ...p,
                  chapters: p.chapters.map((ch) =>
                    ch.id === chapterId
                      ? {
                          ...ch,
                          topics: [
                            ...ch.topics,
                            { id: generateId(), name: topicName, status: "not_started" as TopicStatus },
                          ],
                        }
                      : ch
                  ),
                }
              : p
          ),
        })),
      setTopicStatus: (subjectId, paperId, chapterId, topicId, status) =>
        set((state) => ({
          collegeProgress: state.collegeProgress.map((p) =>
            p.subjectId === subjectId && p.paperId === paperId
              ? {
                  ...p,
                  chapters: p.chapters.map((ch) =>
                    ch.id === chapterId
                      ? {
                          ...ch,
                          topics: ch.topics.map((t) =>
                            t.id === topicId ? { ...t, status } : t
                          ),
                        }
                      : ch
                  ),
                }
              : p
          ),
        })),
      getProgressForSubjectPaper: (subjectId, paperId) =>
        get().collegeProgress.find(
          (p) => p.subjectId === subjectId && p.paperId === paperId
        ),
      getOverallProgress: () => {
        const all = get().collegeProgress;
        let total = 0;
        let completed = 0;
        for (const p of all) {
          for (const ch of p.chapters) {
            for (const t of ch.topics) {
              total++;
              if (t.status === "completed") completed++;
            }
          }
        }
        return { total, completed };
      },
    }),
    { name: "tracker-storage" }
  )
);

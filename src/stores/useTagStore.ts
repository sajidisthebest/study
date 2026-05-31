import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tag } from "@/types";
import { defaultTags } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface TagState {
  tags: Tag[];
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, updates: Partial<Pick<Tag, "name" | "color">>) => void;
  deleteTag: (id: string) => void;
  restoreTag: (id: string) => void;
  getActiveTags: () => Tag[];
}

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: defaultTags,
      addTag: (name, color) =>
        set((state) => ({
          tags: [
            ...state.tags,
            { id: generateId(), name, color, deletedAt: null },
          ],
        })),
      updateTag: (id, updates) =>
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTag: (id) =>
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
          ),
        })),
      restoreTag: (id) =>
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, deletedAt: null } : t
          ),
        })),
      getActiveTags: () => get().tags.filter((t) => t.deletedAt === null),
    }),
    { name: "tag-storage" }
  )
);

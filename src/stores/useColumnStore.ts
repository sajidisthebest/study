import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Column } from "@/types";
import { defaultColumns } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface ColumnState {
  columns: Column[];
  addColumn: (name: string) => void;
  updateColumn: (id: string, name: string) => void;
  deleteColumn: (id: string) => void;
  restoreColumn: (id: string) => void;
  reorderColumns: (columns: Column[]) => void;
  getActiveColumns: () => Column[];
}

export const useColumnStore = create<ColumnState>()(
  persist(
    (set, get) => ({
      columns: defaultColumns,
      addColumn: (name) =>
        set((state) => ({
          columns: [
            ...state.columns,
            {
              id: generateId(),
              name,
              order: state.columns.length,
              deletedAt: null,
            },
          ],
        })),
      updateColumn: (id, name) =>
        set((state) => ({
          columns: state.columns.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),
      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.map((c) =>
            c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c
          ),
        })),
      restoreColumn: (id) =>
        set((state) => ({
          columns: state.columns.map((c) =>
            c.id === id ? { ...c, deletedAt: null } : c
          ),
        })),
      reorderColumns: (columns) => set({ columns }),
      getActiveColumns: () =>
        get()
          .columns.filter((c) => c.deletedAt === null)
          .sort((a, b) => a.order - b.order),
    }),
    { name: "column-storage" }
  )
);

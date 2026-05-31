import { useCallback, useRef } from "react";

// Simple toast undo mechanism using a ref-based approach
// Tasks are immediately soft-deleted; undo restores them within 5 seconds

interface DeleteTimer {
  ids: string[];
  timeout: ReturnType<typeof setTimeout>;
}

let toastElement: HTMLDivElement | null = null;

function showUndoToast(count: number, onUndo: () => void) {
  // Remove existing toast if any
  if (toastElement) {
    document.body.removeChild(toastElement);
    toastElement = null;
  }

  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4";
  toast.innerHTML = `
    <span class="text-sm">${count} task${count > 1 ? "s" : ""} deleted</span>
    <button class="text-sm font-medium text-primary hover:underline undo-btn">Undo</button>
    <div class="w-16 h-1 bg-muted rounded-full overflow-hidden">
      <div class="h-full bg-primary undo-progress" style="animation: shrink 5s linear forwards;"></div>
    </div>
  `;

  // Add animation keyframes
  if (!document.getElementById("undo-toast-styles")) {
    const style = document.createElement("style");
    style.id = "undo-toast-styles";
    style.textContent = `@keyframes shrink { from { width: 100%; } to { width: 0%; } }`;
    document.head.appendChild(style);
  }

  const undoBtn = toast.querySelector(".undo-btn");
  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      onUndo();
      if (toastElement) {
        document.body.removeChild(toastElement);
        toastElement = null;
      }
    });
  }

  document.body.appendChild(toast);
  toastElement = toast;

  // Auto-remove after 5s
  setTimeout(() => {
    if (toastElement === toast) {
      document.body.removeChild(toast);
      toastElement = null;
    }
  }, 5000);
}

export function useToastUndo() {
  const timerRef = useRef<DeleteTimer | null>(null);

  const scheduleDelete = useCallback(
    (
      ids: string[],
      deleteFn: (id: string) => void,
      restoreFn: (id: string) => void
    ) => {
      // Immediately soft-delete
      ids.forEach((id) => deleteFn(id));

      // Cancel any previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current.timeout);
      }

      const onUndo = () => {
        ids.forEach((id) => restoreFn(id));
        if (timerRef.current) {
          clearTimeout(timerRef.current.timeout);
          timerRef.current = null;
        }
      };

      showUndoToast(ids.length, onUndo);

      timerRef.current = {
        ids,
        timeout: setTimeout(() => {
          timerRef.current = null;
          // Deletion is already done via soft-delete, nothing more needed
        }, 5000),
      };
    },
    []
  );

  return { scheduleDelete };
}

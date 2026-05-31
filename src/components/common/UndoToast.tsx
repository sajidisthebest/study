import { useEffect, useState } from "react";

interface UndoToastProps {
  message: string;
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ message, visible, onUndo, onDismiss }: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!visible) {
      setProgress(100);
      return;
    }
    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4">
      <span className="text-sm">{message}</span>
      <button
        onClick={onUndo}
        className="text-sm font-medium text-primary hover:underline"
      >
        Undo
      </button>
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

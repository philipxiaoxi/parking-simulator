import { create } from "zustand";

type Toast = { id: number; text: string; kind: "info" | "error" | "success" };

type UiStore = {
  toasts: Toast[];
  debugEnabled: boolean;
  pushToast: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  toggleDebug: () => void;
};

let nextId = 1;
export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  debugEnabled: false,
  pushToast: (text, kind = "info") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, text, kind }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toggleDebug: () => set((s) => ({ debugEnabled: !s.debugEnabled })),
}));

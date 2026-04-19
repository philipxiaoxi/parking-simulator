import { create } from "zustand";
import type { PlaceableType } from "../types/map";

export type EditorMode = "edit" | "drive";

type EditorStore = {
  mode: EditorMode;
  selectedId: string | null;
  pendingPlacement: PlaceableType | "spawn_point" | null;
  snapEnabled: boolean;
  isDragging: boolean;
  setMode: (mode: EditorMode) => void;
  setSelected: (id: string | null) => void;
  setPendingPlacement: (p: EditorStore["pendingPlacement"]) => void;
  toggleSnap: () => void;
  setIsDragging: (dragging: boolean) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  mode: "edit",
  selectedId: null,
  pendingPlacement: null,
  snapEnabled: true,
  isDragging: false,
  setMode: (mode) =>
    set(() => ({
      mode,
      selectedId: null,
      pendingPlacement: null,
    })),
  setSelected: (selectedId) => set(() => ({ selectedId })),
  setPendingPlacement: (pendingPlacement) =>
    set(() => ({ pendingPlacement, selectedId: null })),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setIsDragging: (isDragging) => set(() => ({ isDragging })),
}));

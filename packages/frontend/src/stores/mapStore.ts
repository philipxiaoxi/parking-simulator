import { create } from "zustand";
import type {
  Goal,
  MapData,
  SceneConfig,
  SpawnPoint,
  StaticMapObject,
} from "../types/map";

type MapStore = {
  map: MapData | null;
  dirty: boolean;
  setMap: (map: MapData) => void;
  clear: () => void;
  markSaved: () => void;
  renameMap: (name: string) => void;
  addObject: (o: StaticMapObject) => void;
  updateObject: (id: string, patch: Partial<StaticMapObject>) => void;
  removeObject: (id: string) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setSpawnPoint: (spawn: SpawnPoint) => void;
  updateCamera: (camera: SceneConfig["camera"]) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  dirty: false,
  setMap: (map) => set(() => ({ map, dirty: false })),
  clear: () => set(() => ({ map: null, dirty: false })),
  markSaved: () => set(() => ({ dirty: false })),
  renameMap: (name) =>
    set((s) => (s.map ? { map: { ...s.map, name }, dirty: true } : s)),
  addObject: (o) =>
    set((s) =>
      s.map
        ? { map: { ...s.map, objects: [...s.map.objects, o] }, dirty: true }
        : s,
    ),
  updateObject: (id, patch) =>
    set((s) =>
      s.map
        ? {
            map: {
              ...s.map,
              objects: s.map.objects.map((o) =>
                o.id === id ? ({ ...o, ...patch } as StaticMapObject) : o,
              ),
            },
            dirty: true,
          }
        : s,
    ),
  removeObject: (id) =>
    set((s) =>
      s.map
        ? {
            map: {
              ...s.map,
              objects: s.map.objects.filter((o) => o.id !== id),
            },
            dirty: true,
          }
        : s,
    ),
  addGoal: (g) =>
    set((s) =>
      s.map
        ? { map: { ...s.map, goals: [...s.map.goals, g] }, dirty: true }
        : s,
    ),
  updateGoal: (id, patch) =>
    set((s) =>
      s.map
        ? {
            map: {
              ...s.map,
              goals: s.map.goals.map((g) =>
                g.id === id ? ({ ...g, ...patch } as Goal) : g,
              ),
            },
            dirty: true,
          }
        : s,
    ),
  removeGoal: (id) =>
    set((s) =>
      s.map
        ? { map: { ...s.map, goals: s.map.goals.filter((g) => g.id !== id) }, dirty: true }
        : s,
    ),
  setSpawnPoint: (spawn) =>
    set((s) => (s.map ? { map: { ...s.map, spawnPoint: spawn }, dirty: true } : s)),
  updateCamera: (camera) =>
    set((s) =>
      s.map
        ? { map: { ...s.map, scene: { ...s.map.scene, camera } }, dirty: true }
        : s,
    ),
}));

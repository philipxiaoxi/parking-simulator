import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback } from "react";
import * as THREE from "three";
import { useEditorStore } from "../stores/editorStore";
import { useMapStore } from "../stores/mapStore";
import { snap } from "../lib/geometry";
import { GRID_SNAP } from "../lib/constants";

type DraggableKind = "object" | "goal" | "spawn";

export function useDraggable(
  kind: DraggableKind,
  id: string,
  current: { x: number; z: number },
) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const mapWidth = useMapStore((s) => s.map?.scene.size.width ?? 40);
  const mapHeight = useMapStore((s) => s.map?.scene.size.height ?? 40);

  return useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (e.button !== 0) return;
      const editor = useEditorStore.getState();
      if (editor.mode !== "edit") return;
      if (editor.pendingPlacement) return;
      e.stopPropagation();

      editor.setSelected(kind === "spawn" ? "spawn" : id);
      editor.setIsDragging(true);

      const canvas = gl.domElement;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const out = new THREE.Vector3();
      const getPoint = (cx: number, cy: number): THREE.Vector3 | null => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        return raycaster.ray.intersectPlane(plane, out) ? out.clone() : null;
      };

      const start = getPoint(e.clientX, e.clientY);
      const offset = start ? { x: current.x - start.x, z: current.z - start.z } : { x: 0, z: 0 };
      let moved = false;

      const clampBounds = (x: number, z: number) => {
        const hw = mapWidth / 2;
        const hh = mapHeight / 2;
        return {
          x: Math.max(-hw, Math.min(hw, x)),
          z: Math.max(-hh, Math.min(hh, z)),
        };
      };

      const onMove = (ev: PointerEvent) => {
        const p = getPoint(ev.clientX, ev.clientY);
        if (!p) return;
        moved = true;
        const snapOn = useEditorStore.getState().snapEnabled;
        let nx = p.x + offset.x;
        let nz = p.z + offset.z;
        if (snapOn) {
          nx = snap(nx, GRID_SNAP);
          nz = snap(nz, GRID_SNAP);
        }
        const c = clampBounds(nx, nz);
        const store = useMapStore.getState();
        if (kind === "object") {
          store.updateObject(id, { position: [c.x, 0, c.z] });
        } else if (kind === "goal") {
          store.updateGoal(id, { position: [c.x, 0, c.z] });
        } else if (kind === "spawn") {
          const sp = store.map?.spawnPoint;
          if (sp) store.setSpawnPoint({ ...sp, position: [c.x, 0, c.z] });
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        useEditorStore.getState().setIsDragging(false);
        void moved;
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [gl, camera, kind, id, current.x, current.z, mapWidth, mapHeight],
  );
}

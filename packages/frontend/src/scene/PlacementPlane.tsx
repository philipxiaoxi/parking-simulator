import type { ThreeEvent } from "@react-three/fiber";
import { useEditorStore } from "../stores/editorStore";
import { useMapStore } from "../stores/mapStore";
import { snap } from "../lib/geometry";
import { GRID_SNAP } from "../lib/constants";
import {
  createParkingGoal,
  createStaticObject,
  createTriggerGoal,
} from "../persistence/factory";

type Props = { width: number; height: number };

export function PlacementPlane({ width, height }: Props) {
  const mode = useEditorStore((s) => s.mode);
  const pending = useEditorStore((s) => s.pendingPlacement);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setPending = useEditorStore((s) => s.setPendingPlacement);
  const setSelected = useEditorStore((s) => s.setSelected);
  const { addObject, addGoal, setSpawnPoint } = useMapStore.getState();

  if (mode !== "edit") return null;

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return;
    if (!pending) {
      setSelected(null);
      return;
    }
    e.stopPropagation();
    const x = snapEnabled ? snap(e.point.x, GRID_SNAP) : e.point.x;
    const z = snapEnabled ? snap(e.point.z, GRID_SNAP) : e.point.z;

    if (pending === "spawn_point") {
      setSpawnPoint({ position: [x, 0, z], rotation: 180 });
      setSelected("spawn");
    } else if (pending === "parking_zone") {
      const g = createParkingGoal(x, z);
      addGoal(g);
      setSelected(g.id);
    } else if (pending === "trigger_line") {
      const g = createTriggerGoal(x, z);
      addGoal(g);
      setSelected(g.id);
    } else {
      const o = createStaticObject(pending, x, z, 0);
      addObject(o);
      setSelected(o.id);
    }
    setPending(null);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={onPointerDown}
      visible={false}
    >
      <planeGeometry args={[width * 2, height * 2]} />
      <meshBasicMaterial />
    </mesh>
  );
}

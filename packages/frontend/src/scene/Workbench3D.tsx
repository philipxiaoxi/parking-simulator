import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { SceneCamera, normalizeCamera } from "./Camera";
import { Ground } from "./objects/Ground";
import { Vehicle } from "./objects/Vehicle";
import { StaticObjectMesh } from "./objects/StaticObjectMesh";
import { ParkingZoneMesh } from "./objects/ParkingZoneMesh";
import { TriggerLineMesh } from "./objects/TriggerLineMesh";
import { SpawnMarker } from "./objects/SpawnMarker";
import { PlacementPlane } from "./PlacementPlane";
import { SimulationLoop } from "./SimulationLoop";
import { useMapStore } from "../stores/mapStore";
import { useEditorStore } from "../stores/editorStore";
import { useDraggable } from "./useDraggable";
import { DebugOverlay } from "./DebugOverlay";

export function Workbench3D() {
  const map = useMapStore((s) => s.map);
  const mode = useEditorStore((s) => s.mode);
  const selectedId = useEditorStore((s) => s.selectedId);
  const pending = useEditorStore((s) => s.pendingPlacement);
  const setPending = useEditorStore((s) => s.setPendingPlacement);
  const setSelected = useEditorStore((s) => s.setSelected);

  const cameraConfig = useMemo(() => {
    if (!map) return { position: [15, 20, 15] as [number, number, number] };
    return normalizeCamera(map.scene.camera as Parameters<typeof normalizeCamera>[0]);
  }, [map]);

  if (!map) return null;

  return (
    <Canvas
      shadows
      camera={{
        position: cameraConfig.position,
        fov: 45,
      }}
      onPointerMissed={() => {
        if (pending) setPending(null);
        else setSelected(null);
      }}
    >
      <color attach="background" args={["#eef2f7"]} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[15, 22, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <SceneCamera scene={map.scene} />
        <Ground width={map.scene.size.width} height={map.scene.size.height} />
        <PlacementPlane
          width={map.scene.size.width}
          height={map.scene.size.height}
        />
        {map.objects.map((o) => (
          <ObjectItem key={o.id} object={o} selected={selectedId === o.id} />
        ))}
        {map.goals.map((g) =>
          g.type === "parking_zone" ? (
            <GoalParkingItem key={g.id} goal={g} selected={selectedId === g.id} />
          ) : (
            <GoalLineItem key={g.id} goal={g} selected={selectedId === g.id} />
          ),
        )}
        <SpawnItem
          spawn={map.spawnPoint}
          selected={selectedId === "spawn"}
          visible={mode === "edit"}
        />
        <Vehicle />
        <DebugOverlay />
        <SimulationLoop />
      </Suspense>
    </Canvas>
  );
}

function ObjectItem({
  object,
  selected,
}: {
  object: import("../types/map").StaticMapObject;
  selected: boolean;
}) {
  const onDown = useDraggable("object", object.id, {
    x: object.position[0],
    z: object.position[2],
  });
  return <StaticObjectMesh object={object} selected={selected} onPointerDown={onDown} />;
}

function GoalParkingItem({
  goal,
  selected,
}: {
  goal: import("../types/map").ParkingZoneGoal;
  selected: boolean;
}) {
  const onDown = useDraggable("goal", goal.id, {
    x: goal.position[0],
    z: goal.position[2],
  });
  return <ParkingZoneMesh goal={goal} selected={selected} onPointerDown={onDown} />;
}

function GoalLineItem({
  goal,
  selected,
}: {
  goal: import("../types/map").TriggerLineGoal;
  selected: boolean;
}) {
  const onDown = useDraggable("goal", goal.id, {
    x: goal.position[0],
    z: goal.position[2],
  });
  return <TriggerLineMesh goal={goal} selected={selected} onPointerDown={onDown} />;
}

function SpawnItem({
  spawn,
  selected,
  visible,
}: {
  spawn: import("../types/map").SpawnPoint;
  selected: boolean;
  visible: boolean;
}) {
  const onDown = useDraggable("spawn", "spawn", {
    x: spawn.position[0],
    z: spawn.position[2],
  });
  if (!visible) return null;
  return <SpawnMarker spawn={spawn} selected={selected} onPointerDown={onDown} />;
}

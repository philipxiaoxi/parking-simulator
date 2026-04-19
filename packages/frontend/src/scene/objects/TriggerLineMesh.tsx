import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { TriggerLineGoal } from "../../types/map";

type Props = {
  goal: TriggerLineGoal;
  selected?: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
};

export function TriggerLineMesh({ goal, selected, onPointerDown }: Props) {
  const rotY = (goal.rotation * Math.PI) / 180;
  const color = selected ? "#22d3ee" : "#f59e0b";
  const halfLen = goal.length / 2;
  const pts = useMemo(
    () =>
      new Float32Array([-halfLen, 0.03, 0, halfLen, 0.03, 0]),
    [halfLen],
  );

  return (
    <group
      position={[goal.position[0], 0, goal.position[2]]}
      rotation={[0, rotY, 0]}
      onPointerDown={onPointerDown}
    >
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[goal.length, 0.35]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pts, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} />
      </line>
      <mesh position={[halfLen, 0.04, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[-halfLen, 0.04, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

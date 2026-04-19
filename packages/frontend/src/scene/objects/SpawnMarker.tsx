import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { SpawnPoint } from "../../types/map";

type Props = {
  spawn: SpawnPoint;
  selected?: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
};

export function SpawnMarker({ spawn, selected, onPointerDown }: Props) {
  const rotY = (spawn.rotation * Math.PI) / 180;
  const color = selected ? "#22d3ee" : "#3b82f6";

  const innerR = 1.3;
  const arrowHeight = 0.5;
  const arrowWidth = 0.35;

  const shape = new THREE.Shape();
  shape.moveTo(0, -(innerR + arrowHeight));
  shape.lineTo(-arrowWidth, -innerR);
  shape.lineTo(arrowWidth, -innerR);
  shape.closePath();

  return (
    <group
      position={[spawn.position[0], 0.03, spawn.position[2]]}
      rotation={[0, rotY, 0]}
      onPointerDown={onPointerDown}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerR, 1.55, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

import type { ThreeEvent } from "@react-three/fiber";
import type { ParkingZoneGoal } from "../../types/map";

type Props = {
  goal: ParkingZoneGoal;
  selected?: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
};

export function ParkingZoneMesh({ goal, selected, onPointerDown }: Props) {
  const [w, l] = goal.size;
  const rotY = (goal.rotation * Math.PI) / 180;
  const color = selected ? "#22d3ee" : "#10b981";
  return (
    <group
      position={[goal.position[0], 0.02, goal.position[2]]}
      rotation={[0, rotY, 0]}
      onPointerDown={onPointerDown}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, l]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
      <BorderFrame width={w} length={l} color={color} />
    </group>
  );
}

function BorderFrame({
  width,
  length,
  color,
}: {
  width: number;
  length: number;
  color: string;
}) {
  const hw = width / 2;
  const hl = length / 2;
  const pts = new Float32Array([
    -hw, 0.005, -hl,
    hw, 0.005, -hl,
    hw, 0.005, hl,
    -hw, 0.005, hl,
    -hw, 0.005, -hl,
  ]);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} />
    </line>
  );
}

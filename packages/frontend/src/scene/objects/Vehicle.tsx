import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DEFAULT_VEHICLE } from "../../lib/constants";
import { useSimulationStore } from "../../stores/simulationStore";

export function Vehicle() {
  const ref = useRef<THREE.Group>(null);
  const cfg = DEFAULT_VEHICLE;

  useFrame(() => {
    const v = useSimulationStore.getState().vehicle;
    if (!ref.current) return;
    ref.current.position.set(v.x, 0, v.z);
    ref.current.rotation.y = (v.heading * Math.PI) / 180;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[cfg.width, 0.9, cfg.length]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 1.05, -0.1]} castShadow>
        <boxGeometry args={[cfg.width - 0.2, 0.5, cfg.length * 0.55]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
      <mesh position={[0, 0.5, cfg.length / 2 - 0.02]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.4} />
      </mesh>
      <Wheel x={-cfg.width / 2} z={cfg.wheelbase / 2} />
      <Wheel x={cfg.width / 2} z={cfg.wheelbase / 2} />
      <Wheel x={-cfg.width / 2} z={-cfg.wheelbase / 2} />
      <Wheel x={cfg.width / 2} z={-cfg.wheelbase / 2} />
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.25, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.25, 0.25, 0.2, 14]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
  );
}

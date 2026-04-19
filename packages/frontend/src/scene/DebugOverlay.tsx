import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useUiStore } from "../stores/uiStore";
import { useSimulationStore } from "../stores/simulationStore";
import { DEFAULT_VEHICLE } from "../lib/constants";
import { vehicleFrontPoint, vehicleWheelPoints } from "../simulation/vehicle";

export function DebugOverlay() {
  const enabled = useUiStore((s) => s.debugEnabled);
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const headRef = useRef<THREE.Mesh>(null);

  const dots = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) wheelRefs.current[i] = m;
          }}
          position={[0, 0.08, 0]}
          visible={enabled}
        >
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      )),
    [enabled],
  );

  useFrame(() => {
    if (!enabled) return;
    const v = useSimulationStore.getState().vehicle;
    const wheels = vehicleWheelPoints(v, DEFAULT_VEHICLE);
    wheels.forEach((w, i) => {
      const m = wheelRefs.current[i];
      if (m) m.position.set(w.x, 0.08, w.z);
    });
    if (headRef.current) {
      const head = vehicleFrontPoint(v, DEFAULT_VEHICLE);
      headRef.current.position.set(head.x, 0.08, head.z);
    }
  });

  return (
    <group>
      {dots}
      <mesh ref={headRef} visible={enabled}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

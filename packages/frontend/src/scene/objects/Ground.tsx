import { useMemo } from "react";
import * as THREE from "three";

type Props = { width: number; height: number };

export function Ground({ width, height }: Props) {
  const grid = useMemo(() => new THREE.GridHelper(
    Math.max(width, height),
    Math.max(width, height),
    0xcccccc,
    0xe5e5e5,
  ), [width, height]);
  grid.position.y = 0.001;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.6;

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#f4f4f4" />
      </mesh>
      <primitive object={grid} />
      <BoundaryLines width={width} height={height} />
    </group>
  );
}

function BoundaryLines({ width, height }: { width: number; height: number }) {
  const hw = width / 2;
  const hh = height / 2;
  const points = useMemo(
    () =>
      new Float32Array([
        -hw, 0.02, -hh,
        hw, 0.02, -hh,
        hw, 0.02, hh,
        -hw, 0.02, hh,
        -hw, 0.02, -hh,
      ]),
    [hw, hh],
  );
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff6b6b" linewidth={2} />
    </line>
  );
}

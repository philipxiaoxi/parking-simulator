import type { ThreeEvent } from "@react-three/fiber";
import type { StaticMapObject } from "../../types/map";
import { STATIC_PRESETS } from "../../lib/constants";

type Props = {
  object: StaticMapObject;
  selected?: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
};

export function StaticObjectMesh({ object, selected, onPointerDown }: Props) {
  const preset = STATIC_PRESETS[object.type];
  const [w, , l] = object.collider.size;
  const h = object.collider.size[1];

  const halfH = h / 2;
  const rotY = (object.rotation * Math.PI) / 180;

  const isVehicle = object.type === "sedan_static" || object.type === "suv_static";

  return (
    <group
      position={[object.position[0], 0, object.position[2]]}
      rotation={[0, rotY, 0]}
      onPointerDown={onPointerDown}
    >
      {isVehicle ? (
        <VehicleSilhouette width={w} length={l} height={h} color={preset.color} />
      ) : object.type === "house" ? (
        <House width={w} length={l} height={h} color={preset.color} />
      ) : (
        <mesh position={[0, halfH, 0]} castShadow>
          <boxGeometry args={[w, h, l]} />
          <meshStandardMaterial color={preset.color} />
        </mesh>
      )}
      {selected && (
        <mesh position={[0, halfH, 0]}>
          <boxGeometry args={[w + 0.15, h + 0.15, l + 0.15]} />
          <meshBasicMaterial color="#22d3ee" wireframe />
        </mesh>
      )}
    </group>
  );
}

function VehicleSilhouette({
  width,
  length,
  height,
  color,
}: {
  width: number;
  length: number;
  height: number;
  color: string;
}) {
  const wheelRadius = 0.25;
  const wheelY = wheelRadius;
  const wheelPositions: [number, number, number][] = [
    [width / 2 + 0.05, wheelY, length * 0.3],
    [-width / 2 - 0.05, wheelY, length * 0.3],
    [width / 2 + 0.05, wheelY, -length * 0.3],
    [-width / 2 - 0.05, wheelY, -length * 0.3],
  ];

  const lightSize = 0.15;
  const lightY = height * 0.25;
  const frontLights: [number, number, number][] = [
    [width * 0.35, lightY, length / 2 + 0.01],
    [-width * 0.35, lightY, length / 2 + 0.01],
  ];
  const rearLights: [number, number, number][] = [
    [width * 0.35, lightY, -length / 2 - 0.01],
    [-width * 0.35, lightY, -length / 2 - 0.01],
  ];

  return (
    <group>
      <mesh position={[0, height * 0.3, 0]} castShadow>
        <boxGeometry args={[width, height * 0.55, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, height * 0.72, -length * 0.05]} castShadow>
        <boxGeometry args={[width - 0.3, height * 0.35, length * 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {wheelPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {frontLights.map((pos, i) => (
        <mesh key={`front-${i}`} position={pos}>
          <boxGeometry args={[lightSize, lightSize, 0.02]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {rearLights.map((pos, i) => (
        <mesh key={`rear-${i}`} position={pos}>
          <boxGeometry args={[lightSize, lightSize, 0.02]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function House({
  width,
  length,
  height,
  color,
}: {
  width: number;
  length: number;
  height: number;
  color: string;
}) {
  const baseSize = Math.max(width, length);
  const roofRadius = baseSize / Math.sqrt(2) * 1.05;
  const roofHeight = height * 0.5;
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, height + roofHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[roofRadius, roofHeight, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import type { SceneConfig, Vec3 } from "../types/map";
import { useEditorStore } from "../stores/editorStore";

const MOVE_SPEED = 0.15;
const keys = { w: false, a: false, s: false, d: false };

let cameraStateCache: { position: Vec3; target: Vec3 } | null = null;

export function getCameraState(): { position: Vec3; target: Vec3 } | null {
  return cameraStateCache;
}

type LegacyCamera = { target: Vec3; distance: number; yaw: number; pitch: number };
type NewCamera = { position: Vec3; target: Vec3 };

export function normalizeCamera(cam: NewCamera | LegacyCamera): NewCamera {
  if ("position" in cam) return cam;
  const { target, distance, yaw, pitch } = cam;
  const yawRad = THREE.MathUtils.degToRad(yaw);
  const pitchRad = THREE.MathUtils.degToRad(pitch);
  const x = target[0] + distance * Math.cos(pitchRad) * Math.sin(yawRad);
  const y = target[1] + distance * Math.sin(pitchRad);
  const z = target[2] + distance * Math.cos(pitchRad) * Math.cos(yawRad);
  return { position: [x, y, z], target };
}

export function SceneCamera({ scene }: { scene: SceneConfig }) {
  const ref = useRef(null);
  const isDragging = useEditorStore((s) => s.isDragging);
  const { camera } = useThree();
  const initializedRef = useRef(false);

  const normalized = useMemo(() => normalizeCamera(scene.camera as NewCamera | LegacyCamera), [scene.camera]);
  const initialCamera = useMemo(
    () => ({
      position: new THREE.Vector3(...normalized.position),
      target: new THREE.Vector3(...normalized.target),
    }),
    [normalized]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key as keyof typeof keys] = true;
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key as keyof typeof keys] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const controls = ref.current as { target: THREE.Vector3 };

    if (!initializedRef.current) {
      camera.position.copy(initialCamera.position);
      controls.target.copy(initialCamera.target);
      camera.lookAt(controls.target);
      initializedRef.current = true;
    }

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

    const delta = new THREE.Vector3();
    if (keys.w) delta.add(forward);
    if (keys.s) delta.sub(forward);
    if (keys.d) delta.add(right);
    if (keys.a) delta.sub(right);
    if (delta.lengthSq() > 0) {
      delta.normalize().multiplyScalar(MOVE_SPEED);
      controls.target.add(delta);
      camera.position.add(delta);
    }

    cameraStateCache = {
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [controls.target.x, controls.target.y, controls.target.z],
    };
  });

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enabled={!isDragging}
      enablePan
      enableRotate
      enableZoom
      minDistance={6}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={0.1}
      target={normalized.target}
    />
  );
}

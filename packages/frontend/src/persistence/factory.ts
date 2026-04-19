import type {
  Goal,
  MapData,
  ParkingZoneGoal,
  StaticMapObject,
  StaticObjectType,
  TriggerLineGoal,
} from "../types/map";
import { newId } from "../lib/id";
import {
  DEFAULT_MAP_HEIGHT,
  DEFAULT_MAP_WIDTH,
  DEFAULT_PARKING_SIZE,
  DEFAULT_TRIGGER_LENGTH,
  STATIC_PRESETS,
} from "../lib/constants";

export function createEmptyMap(name: string): MapData {
  const now = new Date().toISOString();
  return {
    id: newId("map"),
    version: 1,
    name,
    description: "",
    meta: { createdAt: now, updatedAt: now, author: "local-user", tags: [] },
    scene: {
      size: { width: DEFAULT_MAP_WIDTH, height: DEFAULT_MAP_HEIGHT },
      camera: { position: [15, 20, 15], target: [0, 0, 0] },
      boundary: { enabled: true, failOnExit: true },
      ground: { theme: "simple_gray" },
    },
    spawnPoint: { position: [0, 0, 12], rotation: 180 },
    objects: [],
    goals: [],
  };
}

export function createStaticObject(
  type: StaticObjectType,
  x: number,
  z: number,
  rotation = 0,
): StaticMapObject {
  const preset = STATIC_PRESETS[type];
  return {
    id: newId("obj"),
    type,
    position: [x, 0, z],
    rotation,
    scale: [...preset.defaultScale] as [number, number, number],
    collider: {
      shape: "box",
      size: [...preset.colliderSize] as [number, number, number],
    },
  };
}

export function createParkingGoal(x: number, z: number): ParkingZoneGoal {
  return {
    id: newId("goal"),
    type: "parking_zone",
    position: [x, 0, z],
    rotation: 0,
    enabled: true,
    size: [DEFAULT_PARKING_SIZE[0], DEFAULT_PARKING_SIZE[1]],
  };
}

export function createTriggerGoal(x: number, z: number): TriggerLineGoal {
  return {
    id: newId("goal"),
    type: "trigger_line",
    position: [x, 0, z],
    rotation: 0,
    enabled: true,
    length: DEFAULT_TRIGGER_LENGTH,
    directional: false,
  };
}

export function createDemoMap(): MapData {
  const now = new Date().toISOString();
  const objects: StaticMapObject[] = [
    createStaticObject("sedan_static", -4, -2, 0),
    createStaticObject("sedan_static", 4, -2, 0),
    createStaticObject("wall", 0, -8, 0),
    { ...createStaticObject("wall", -10, 0, 90) },
    { ...createStaticObject("wall", 10, 0, 90) },
  ];
  const goals: Goal[] = [
    { ...createParkingGoal(0, -2) },
    { ...createTriggerGoal(0, 14) },
  ];
  return {
    id: newId("map"),
    version: 1,
    name: "示例地图：侧方位 + 出线",
    description: "停入中间车位或向前驶出即可通过",
    meta: { createdAt: now, updatedAt: now, author: "local-user", tags: ["示例"] },
    scene: {
      size: { width: DEFAULT_MAP_WIDTH, height: DEFAULT_MAP_HEIGHT },
      camera: { position: [15, 20, 15], target: [0, 0, 0] },
      boundary: { enabled: true, failOnExit: true },
      ground: { theme: "simple_gray" },
    },
    spawnPoint: { position: [8, 0, 6], rotation: 180 },
    objects,
    goals,
  };
}

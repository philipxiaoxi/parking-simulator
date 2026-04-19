export type Vec3 = [number, number, number];
export type Size2D = [number, number];
export type Scale3D = [number, number, number];

export type StaticObjectType =
  | "sedan_static"
  | "suv_static"
  | "box_rect"
  | "box_square"
  | "house"
  | "wall";

export type GoalType = "parking_zone" | "trigger_line";

export type PlaceableType = StaticObjectType | GoalType;

export type StaticMapObject = {
  id: string;
  type: StaticObjectType;
  position: Vec3;
  rotation: number;
  scale: Scale3D;
  collider: { shape: "box"; size: Scale3D };
};

export type ParkingZoneGoal = {
  id: string;
  type: "parking_zone";
  position: Vec3;
  rotation: number;
  enabled: boolean;
  size: Size2D;
};

export type TriggerLineGoal = {
  id: string;
  type: "trigger_line";
  position: Vec3;
  rotation: number;
  enabled: boolean;
  length: number;
  directional?: boolean;
};

export type Goal = ParkingZoneGoal | TriggerLineGoal;

export type SpawnPoint = { position: Vec3; rotation: number };

export type SceneConfig = {
  size: { width: number; height: number };
  camera: { position: Vec3; target: Vec3 };
  boundary: { enabled: boolean; failOnExit: boolean };
  ground: { theme: string };
};

export type MapMeta = {
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
};

export type MapData = {
  id: string;
  version: number;
  name: string;
  description?: string;
  meta: MapMeta;
  scene: SceneConfig;
  spawnPoint: SpawnPoint;
  objects: StaticMapObject[];
  goals: Goal[];
};

export type MapIndexEntry = {
  id: string;
  name: string;
  updatedAt: string;
};

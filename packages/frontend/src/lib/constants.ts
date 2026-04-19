import type { VehicleConfig } from "../types/vehicle";
import type { Scale3D, StaticObjectType, Size2D } from "../types/map";

export const DEFAULT_VEHICLE: VehicleConfig = {
  length: 4.5,
  width: 1.8,
  wheelbase: 2.6,
  frontOverhang: 0.95,
  rearOverhang: 0.95,
  maxSteer: 35,
  maxSpeed: 2,
  reverseSpeed: 2,
  accel: 4,
  decel: 6,
  steerSpeed: 90,
  steerReturn: 120,
};

type PresetInfo = {
  label: string;
  defaultScale: Scale3D;
  colliderSize: Scale3D;
  color: string;
};

export const STATIC_PRESETS: Record<StaticObjectType, PresetInfo> = {
  sedan_static: {
    label: "轿车",
    defaultScale: [1, 1, 1],
    colliderSize: [1.8, 1.4, 4.5],
    color: "#4f8cff",
  },
  suv_static: {
    label: "SUV",
    defaultScale: [1, 1, 1],
    colliderSize: [1.95, 1.7, 4.8],
    color: "#2e7d32",
  },
  box_rect: {
    label: "矩形",
    defaultScale: [2, 1, 1],
    colliderSize: [2, 1, 1],
    color: "#d97706",
  },
  box_square: {
    label: "方块",
    defaultScale: [1, 1, 1],
    colliderSize: [1, 1, 1],
    color: "#a855f7",
  },
  house: {
    label: "房子",
    defaultScale: [4, 3, 4],
    colliderSize: [4, 3, 4],
    color: "#b45309",
  },
  wall: {
    label: "围墙",
    defaultScale: [6, 1, 0.4],
    colliderSize: [6, 1, 0.4],
    color: "#6b7280",
  },
};

export const DEFAULT_PARKING_SIZE: Size2D = [2.6, 5.2];
export const DEFAULT_TRIGGER_LENGTH = 4;

export const GRID_SNAP = 0.5;
export const ROTATION_STEP = 15;

export const DEFAULT_MAP_WIDTH = 40;
export const DEFAULT_MAP_HEIGHT = 40;

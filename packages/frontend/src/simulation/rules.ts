import type { MapData, ParkingZoneGoal, TriggerLineGoal } from "../types/map";
import type { TrainingResult } from "../types/rules";
import type { VehicleConfig, VehicleState } from "../types/vehicle";
import {
  lineLocal,
  pointInRect,
  rectsOverlap,
  type OrientedRect,
} from "../lib/geometry";
import {
  vehicleBodyRect,
  vehicleFrontPoint,
  vehicleWheelPoints,
} from "./vehicle";

export function obstacleRect(o: {
  position: [number, number, number];
  rotation: number;
  collider: { size: [number, number, number] };
}): OrientedRect {
  return {
    x: o.position[0],
    z: o.position[2],
    width: o.collider.size[0],
    length: o.collider.size[2],
    rotation: o.rotation,
  };
}

export function checkCollision(
  state: VehicleState,
  cfg: VehicleConfig,
  map: MapData,
): { id: string } | null {
  const body = vehicleBodyRect(state, cfg);
  for (const o of map.objects) {
    if (rectsOverlap(body, obstacleRect(o))) {
      return { id: o.id };
    }
  }
  return null;
}

export function checkOutOfBounds(
  state: VehicleState,
  cfg: VehicleConfig,
  map: MapData,
): boolean {
  if (!map.scene.boundary.enabled || !map.scene.boundary.failOnExit) return false;
  const hw = map.scene.size.width / 2;
  const hh = map.scene.size.height / 2;
  const body = vehicleBodyRect(state, cfg);
  const corners = [
    [-body.width / 2, -body.length / 2],
    [body.width / 2, -body.length / 2],
    [body.width / 2, body.length / 2],
    [-body.width / 2, body.length / 2],
  ];
  const rad = (body.rotation * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  for (const [lx, lz] of corners) {
    const wx = body.x + lx * c + lz * s;
    const wz = body.z - lx * s + lz * c;
    if (wx < -hw || wx > hw || wz < -hh || wz > hh) return true;
  }
  return false;
}

export function checkParkingSuccess(
  state: VehicleState,
  cfg: VehicleConfig,
  goal: ParkingZoneGoal,
): boolean {
  if (!goal.enabled) return false;
  const rect: OrientedRect = {
    x: goal.position[0],
    z: goal.position[2],
    width: goal.size[0],
    length: goal.size[1],
    rotation: goal.rotation,
  };
  const wheels = vehicleWheelPoints(state, cfg);
  return wheels.every((w) => pointInRect(w, rect));
}

export type TriggerLineMemory = Record<string, { signed: number; along: number }>;

export function checkTriggerLineSuccess(
  state: VehicleState,
  cfg: VehicleConfig,
  goal: TriggerLineGoal,
  memory: TriggerLineMemory,
): boolean {
  if (!goal.enabled) return false;
  const head = vehicleFrontPoint(state, cfg);
  const local = lineLocal(head, {
    x: goal.position[0],
    z: goal.position[2],
    rotation: goal.rotation,
  });
  const curSigned = local.z;
  const curAlong = local.x;
  const prev = memory[goal.id];
  memory[goal.id] = { signed: curSigned, along: curAlong };

  if (!prev) return false;
  const crossed = Math.sign(prev.signed) !== Math.sign(curSigned);
  if (!crossed) return false;
  if (prev.signed === 0 && curSigned === 0) return false;

  const denom = prev.signed - curSigned;
  if (Math.abs(denom) < 1e-9) return false;
  const t = prev.signed / denom;
  const crossAlong = prev.along + t * (curAlong - prev.along);
  return Math.abs(crossAlong) <= goal.length / 2 + 1e-6;
}

export function evaluateRules(
  state: VehicleState,
  cfg: VehicleConfig,
  map: MapData,
  memory: TriggerLineMemory,
): TrainingResult {
  const hit = checkCollision(state, cfg, map);
  if (hit) return { status: "failure", reason: "collision", objectId: hit.id };
  if (checkOutOfBounds(state, cfg, map))
    return { status: "failure", reason: "out_of_bounds" };

  for (const goal of map.goals) {
    if (goal.type === "parking_zone" && checkParkingSuccess(state, cfg, goal)) {
      return { status: "success", reason: "parking_zone", goalId: goal.id };
    }
    if (
      goal.type === "trigger_line" &&
      checkTriggerLineSuccess(state, cfg, goal, memory)
    ) {
      return { status: "success", reason: "trigger_line", goalId: goal.id };
    }
  }
  return { status: "running" };
}

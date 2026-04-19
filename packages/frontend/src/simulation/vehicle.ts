import type { VehicleConfig, VehicleInput, VehicleState } from "../types/vehicle";
import type { SpawnPoint } from "../types/map";
import { clamp, DEG2RAD } from "../lib/geometry";

export function makeInitialState(spawn: SpawnPoint): VehicleState {
  return {
    x: spawn.position[0],
    z: spawn.position[2],
    heading: spawn.rotation,
    speed: 0,
    steering: 0,
  };
}

export function stepVehicle(
  s: VehicleState,
  input: VehicleInput,
  cfg: VehicleConfig,
  dt: number,
): VehicleState {
  const targetSpeed =
    input.throttle > 0
      ? cfg.maxSpeed * input.throttle
      : input.brakeReverse > 0
        ? -cfg.reverseSpeed * input.brakeReverse
        : 0;

  const speed = targetSpeed;

  const steerTarget =
    (input.steerLeft > 0 ? cfg.maxSteer * input.steerLeft : 0) -
    (input.steerRight > 0 ? cfg.maxSteer * input.steerRight : 0);

  let steering = s.steering;
  if (input.steerLeft === 0 && input.steerRight === 0) {
    if (steering > 0) steering = Math.max(0, steering - cfg.steerReturn * dt);
    else if (steering < 0) steering = Math.min(0, steering + cfg.steerReturn * dt);
  } else {
    if (steerTarget > steering)
      steering = Math.min(steerTarget, steering + cfg.steerSpeed * dt);
    else if (steerTarget < steering)
      steering = Math.max(steerTarget, steering - cfg.steerSpeed * dt);
  }
  steering = clamp(steering, -cfg.maxSteer, cfg.maxSteer);

  const headingRad = s.heading * DEG2RAD;
  const yawRate =
    Math.abs(speed) < 1e-5
      ? 0
      : ((speed / cfg.wheelbase) * Math.tan(steering * DEG2RAD)) / DEG2RAD;

  const heading = s.heading + yawRate * dt;
  const x = s.x + speed * Math.sin(headingRad) * dt;
  const z = s.z + speed * Math.cos(headingRad) * dt;

  return { x, z, heading, speed, steering };
}

export function vehicleBodyRect(s: VehicleState, cfg: VehicleConfig) {
  return {
    x: s.x,
    z: s.z,
    width: cfg.width,
    length: cfg.length,
    rotation: s.heading,
  };
}

export function vehicleWheelPoints(s: VehicleState, cfg: VehicleConfig) {
  const hw = cfg.width / 2;
  const hl = cfg.wheelbase / 2;
  const headingRad = s.heading * DEG2RAD;
  const c = Math.cos(headingRad);
  const sin = Math.sin(headingRad);
  const locals = [
    { x: -hw, z: hl },
    { x: hw, z: hl },
    { x: -hw, z: -hl },
    { x: hw, z: -hl },
  ];
  return locals.map((p) => ({
    x: s.x + p.x * c + p.z * sin,
    z: s.z + p.z * c - p.x * sin,
  }));
}

export function vehicleFrontPoint(s: VehicleState, cfg: VehicleConfig) {
  const headingRad = s.heading * DEG2RAD;
  const front = cfg.length / 2;
  return {
    x: s.x + Math.sin(headingRad) * front,
    z: s.z + Math.cos(headingRad) * front,
  };
}

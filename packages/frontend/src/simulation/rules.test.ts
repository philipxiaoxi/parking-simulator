import { describe, expect, it } from "vitest";
import {
  checkCollision,
  checkParkingSuccess,
  checkTriggerLineSuccess,
  evaluateRules,
  type TriggerLineMemory,
} from "./rules";
import { stepVehicle } from "./vehicle";
import { DEFAULT_VEHICLE } from "../lib/constants";
import type { MapData, ParkingZoneGoal, TriggerLineGoal } from "../types/map";
import type { VehicleState } from "../types/vehicle";

const baseMap = (): MapData => ({
  id: "m",
  version: 1,
  name: "t",
  meta: { createdAt: "", updatedAt: "" },
  scene: {
    size: { width: 40, height: 40 },
    camera: { position: [15, 20, 15], target: [0, 0, 0] },
    boundary: { enabled: true, failOnExit: true },
    ground: { theme: "x" },
  },
  spawnPoint: { position: [0, 0, 0], rotation: 0 },
  objects: [],
  goals: [],
});

const stationary = (x: number, z: number, heading = 0): VehicleState => ({
  x,
  z,
  heading,
  speed: 0,
  steering: 0,
});

describe("collision", () => {
  it("detects head-on collision with wall", () => {
    const map = baseMap();
    map.objects.push({
      id: "o1",
      type: "wall",
      position: [0, 0, 3],
      rotation: 0,
      scale: [4, 1, 1],
      collider: { shape: "box", size: [4, 1, 1] },
    });
    const v = stationary(0, 2, 0);
    const hit = checkCollision(v, DEFAULT_VEHICLE, map);
    expect(hit?.id).toBe("o1");
  });

  it("ignores wall far away", () => {
    const map = baseMap();
    map.objects.push({
      id: "o1",
      type: "wall",
      position: [10, 0, 10],
      rotation: 0,
      scale: [1, 1, 1],
      collider: { shape: "box", size: [1, 1, 1] },
    });
    expect(checkCollision(stationary(0, 0, 0), DEFAULT_VEHICLE, map)).toBeNull();
  });
});

describe("parking zone", () => {
  const zone: ParkingZoneGoal = {
    id: "p1",
    type: "parking_zone",
    position: [0, 0, 0],
    rotation: 0,
    enabled: true,
    size: [2.6, 5.2],
  };
  it("succeeds when all wheels inside", () => {
    const v = stationary(0, 0, 0);
    expect(checkParkingSuccess(v, DEFAULT_VEHICLE, zone)).toBe(true);
  });
  it("fails when car is outside zone", () => {
    const v = stationary(5, 5, 0);
    expect(checkParkingSuccess(v, DEFAULT_VEHICLE, zone)).toBe(false);
  });
  it("fails when only partially inside", () => {
    const v = stationary(0, 3, 0);
    expect(checkParkingSuccess(v, DEFAULT_VEHICLE, zone)).toBe(false);
  });
  it("respects zone rotation", () => {
    const rotated: ParkingZoneGoal = { ...zone, rotation: 90 };
    const v = stationary(0, 0, 90);
    expect(checkParkingSuccess(v, DEFAULT_VEHICLE, rotated)).toBe(true);
  });
  it("respects enabled flag", () => {
    const disabled: ParkingZoneGoal = { ...zone, enabled: false };
    expect(checkParkingSuccess(stationary(0, 0, 0), DEFAULT_VEHICLE, disabled)).toBe(
      false,
    );
  });
});

describe("trigger line", () => {
  const line: TriggerLineGoal = {
    id: "l1",
    type: "trigger_line",
    position: [0, 0, 0],
    rotation: 0,
    enabled: true,
    length: 4,
  };
  it("first frame records memory without success", () => {
    const mem: TriggerLineMemory = {};
    const v = stationary(0, 2, 0);
    expect(checkTriggerLineSuccess(v, DEFAULT_VEHICLE, line, mem)).toBe(false);
    expect(mem[line.id]).toBeDefined();
  });
  it("succeeds on crossing forward", () => {
    const mem: TriggerLineMemory = {};
    // start behind line, head behind
    checkTriggerLineSuccess(stationary(0, -3, 0), DEFAULT_VEHICLE, line, mem);
    // advance so head crosses line (head is at z = 2.25 when centered at 0)
    const result = checkTriggerLineSuccess(
      stationary(0, 1, 0),
      DEFAULT_VEHICLE,
      line,
      mem,
    );
    expect(result).toBe(true);
  });
  it("ignores crossing outside line length", () => {
    const mem: TriggerLineMemory = {};
    checkTriggerLineSuccess(stationary(10, -3, 0), DEFAULT_VEHICLE, line, mem);
    const result = checkTriggerLineSuccess(
      stationary(10, 1, 0),
      DEFAULT_VEHICLE,
      line,
      mem,
    );
    expect(result).toBe(false);
  });
  it("does not trigger when spawn already past line without crossing", () => {
    const mem: TriggerLineMemory = {};
    checkTriggerLineSuccess(stationary(0, 3, 0), DEFAULT_VEHICLE, line, mem);
    expect(
      checkTriggerLineSuccess(stationary(0, 4, 0), DEFAULT_VEHICLE, line, mem),
    ).toBe(false);
  });
});

describe("evaluateRules priority", () => {
  it("collision wins over success", () => {
    const map = baseMap();
    map.objects.push({
      id: "o1",
      type: "wall",
      position: [0, 0, 0],
      rotation: 0,
      scale: [3, 1, 3],
      collider: { shape: "box", size: [3, 1, 3] },
    });
    map.goals.push({
      id: "p1",
      type: "parking_zone",
      position: [0, 0, 0],
      rotation: 0,
      enabled: true,
      size: [3, 6],
    });
    const v = stationary(0, 0, 0);
    const r = evaluateRules(v, DEFAULT_VEHICLE, map, {});
    expect(r.status).toBe("failure");
  });
  it("returns parking success when car parked cleanly", () => {
    const map = baseMap();
    map.goals.push({
      id: "p1",
      type: "parking_zone",
      position: [0, 0, 0],
      rotation: 0,
      enabled: true,
      size: [2.6, 5.2],
    });
    const r = evaluateRules(stationary(0, 0, 0), DEFAULT_VEHICLE, map, {});
    expect(r.status).toBe("success");
  });
});

describe("vehicle integration: drive and crash", () => {
  it("car moves forward with throttle", () => {
    let v: VehicleState = stationary(0, 0, 0);
    for (let i = 0; i < 30; i++) {
      v = stepVehicle(
        v,
        { throttle: 1, brakeReverse: 0, steerLeft: 0, steerRight: 0 },
        DEFAULT_VEHICLE,
        1 / 60,
      );
    }
    // heading 0 = +z direction, moving forward should increase z
    expect(v.z).toBeGreaterThan(0.5);
  });
  it("car reverses with brake/reverse", () => {
    let v: VehicleState = stationary(0, 0, 0);
    for (let i = 0; i < 30; i++) {
      v = stepVehicle(
        v,
        { throttle: 0, brakeReverse: 1, steerLeft: 0, steerRight: 0 },
        DEFAULT_VEHICLE,
        1 / 60,
      );
    }
    expect(v.z).toBeLessThan(-0.1);
  });
  it("steering changes heading while moving", () => {
    let v: VehicleState = stationary(0, 0, 0);
    for (let i = 0; i < 60; i++) {
      v = stepVehicle(
        v,
        { throttle: 1, brakeReverse: 0, steerLeft: 1, steerRight: 0 },
        DEFAULT_VEHICLE,
        1 / 60,
      );
    }
    expect(Math.abs(v.heading)).toBeGreaterThan(5);
  });
});

import { create } from "zustand";
import type { VehicleInput, VehicleState } from "../types/vehicle";
import type { TrainingResult } from "../types/rules";
import type { SpawnPoint } from "../types/map";
import { makeInitialState } from "../simulation/vehicle";
import type { TriggerLineMemory } from "../simulation/rules";

type SimStore = {
  vehicle: VehicleState;
  input: VehicleInput;
  result: TrainingResult;
  triggerMemory: TriggerLineMemory;
  setVehicle: (v: VehicleState) => void;
  setInput: (patch: Partial<VehicleInput>) => void;
  setResult: (r: TrainingResult) => void;
  resetToSpawn: (spawn: SpawnPoint) => void;
  clearTriggerMemory: () => void;
};

const ZERO_INPUT: VehicleInput = {
  throttle: 0,
  brakeReverse: 0,
  steerLeft: 0,
  steerRight: 0,
};

export const useSimulationStore = create<SimStore>((set) => ({
  vehicle: { x: 0, z: 0, heading: 0, speed: 0, steering: 0 },
  input: { ...ZERO_INPUT },
  result: { status: "idle" },
  triggerMemory: {},
  setVehicle: (vehicle) => set(() => ({ vehicle })),
  setInput: (patch) => set((s) => ({ input: { ...s.input, ...patch } })),
  setResult: (result) => set(() => ({ result })),
  resetToSpawn: (spawn) =>
    set(() => ({
      vehicle: makeInitialState(spawn),
      input: { ...ZERO_INPUT },
      result: { status: "idle" },
      triggerMemory: {},
    })),
  clearTriggerMemory: () => set(() => ({ triggerMemory: {} })),
}));

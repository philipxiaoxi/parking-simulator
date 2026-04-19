import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DEFAULT_VEHICLE } from "../lib/constants";
import { stepVehicle } from "../simulation/vehicle";
import { evaluateRules } from "../simulation/rules";
import { useSimulationStore } from "../stores/simulationStore";
import { useEditorStore } from "../stores/editorStore";
import { useMapStore } from "../stores/mapStore";

export function SimulationLoop() {
  const lastTimeRef = useRef(0);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    const prev = lastTimeRef.current || now;
    lastTimeRef.current = now;
    const rawDt = now - prev;
    if (rawDt <= 0) return;
    const dt = Math.min(rawDt, 0.05);

    const mode = useEditorStore.getState().mode;
    const map = useMapStore.getState().map;
    if (!map) return;
    const sim = useSimulationStore.getState();
    const { vehicle, input, result, triggerMemory } = sim;

    if (mode !== "drive") return;
    if (result.status === "success" || result.status === "failure") return;

    const anyInput =
      input.throttle > 0 ||
      input.brakeReverse > 0 ||
      input.steerLeft > 0 ||
      input.steerRight > 0 ||
      Math.abs(vehicle.speed) > 1e-4;

    const nextStatus = result.status === "idle" && anyInput ? "running" : result.status;
    if (nextStatus !== result.status && nextStatus === "running") {
      sim.setResult({ status: "running" });
    }

    const nextVehicle = stepVehicle(vehicle, input, DEFAULT_VEHICLE, dt);
    sim.setVehicle(nextVehicle);

    if (nextStatus === "running") {
      const verdict = evaluateRules(
        nextVehicle,
        DEFAULT_VEHICLE,
        map,
        triggerMemory,
      );
      if (verdict.status !== "running") {
        sim.setResult(verdict);
      }
    }
  });
  return null;
}

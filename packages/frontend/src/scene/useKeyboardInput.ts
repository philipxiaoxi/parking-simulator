import { useEffect } from "react";
import { useSimulationStore } from "../stores/simulationStore";
import { useEditorStore } from "../stores/editorStore";

const KEYMAP: Record<string, keyof import("../types/vehicle").VehicleInput> = {
  ArrowUp: "throttle",
  ArrowDown: "brakeReverse",
  ArrowLeft: "steerLeft",
  ArrowRight: "steerRight",
};

export function useKeyboardInput(onReset: () => void) {
  useEffect(() => {
    const isActive = () => useEditorStore.getState().mode === "drive";

    const down = (e: KeyboardEvent) => {
      if (!isActive()) return;
      if (e.repeat) return;
      if (e.code === "KeyR") {
        e.preventDefault();
        onReset();
        return;
      }
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      useSimulationStore.getState().setInput({ [action]: 1 });
    };
    const up = (e: KeyboardEvent) => {
      if (!isActive()) return;
      const action = KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      useSimulationStore.getState().setInput({ [action]: 0 });
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onReset]);
}

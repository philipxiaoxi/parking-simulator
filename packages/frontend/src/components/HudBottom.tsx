import { useEditorStore } from "../stores/editorStore";
import { useMapStore } from "../stores/mapStore";
import { useSimulationStore } from "../stores/simulationStore";
import { useUiStore } from "../stores/uiStore";

export function HudBottom({ onReset }: { onReset: () => void }) {
  const mode = useEditorStore((s) => s.mode);
  const result = useSimulationStore((s) => s.result);
  const debug = useUiStore((s) => s.debugEnabled);
  const toggleDebug = useUiStore((s) => s.toggleDebug);
  const map = useMapStore((s) => s.map);

  const statusLabel = label(result.status, result);

  return (
    <div className="hud-bottom">
      <span className={`status ${result.status}`}>{statusLabel}</span>
      {mode === "drive" ? (
        <span className="keyboard-hint">
          W/↑ 前进 · S/↓ 倒车 · A/← D/→ 转向 · R 重置
        </span>
      ) : (
        <span className="keyboard-hint">
          {map?.objects.length ?? 0} 障碍 · {map?.goals.length ?? 0} 目标
        </span>
      )}
      <div className="spacer" />
      <button onClick={toggleDebug}>{debug ? "关闭调试" : "显示调试点"}</button>
      {mode === "drive" && (
        <button onClick={onReset}>重置 (R)</button>
      )}
    </div>
  );
}

function label(
  status: "idle" | "running" | "success" | "failure",
  result: ReturnType<typeof useSimulationStore.getState>["result"],
) {
  switch (status) {
    case "idle":
      return "待开始";
    case "running":
      return "练习中";
    case "success":
      return result.status === "success" && result.reason === "parking_zone"
        ? "停车成功"
        : "通过判定线";
    case "failure":
      return result.status === "failure" && result.reason === "out_of_bounds"
        ? "驶出边界"
        : "碰撞失败";
  }
}

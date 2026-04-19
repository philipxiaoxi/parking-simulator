import { useSimulationStore } from "../stores/simulationStore";

export function ResultBanner() {
  const result = useSimulationStore((s) => s.result);
  if (result.status !== "success" && result.status !== "failure") return null;
  const text =
    result.status === "success"
      ? result.reason === "parking_zone"
        ? "四轮入框 — 停车成功"
        : "车头过线 — 驶出成功"
      : result.reason === "out_of_bounds"
        ? "驶出地图边界 — 失败"
        : "碰撞障碍物 — 失败";
  return <div className={`overlay-banner ${result.status}`}>{text}</div>;
}

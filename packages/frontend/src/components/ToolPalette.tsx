import { useEditorStore } from "../stores/editorStore";
import { STATIC_PRESETS } from "../lib/constants";
import type { StaticObjectType } from "../types/map";

const OBSTACLE_ORDER: StaticObjectType[] = [
  "sedan_static",
  "suv_static",
  "box_rect",
  "box_square",
  "house",
  "wall",
];

export function ToolPalette() {
  const pending = useEditorStore((s) => s.pendingPlacement);
  const setPending = useEditorStore((s) => s.setPendingPlacement);

  return (
    <>
      <div className="panel-section">
        <h3>障碍物</h3>
        <div className="tool-grid">
          {OBSTACLE_ORDER.map((type) => {
            const preset = STATIC_PRESETS[type];
            return (
              <button
                key={type}
                className={`tool-btn ${pending === type ? "active" : ""}`}
                onClick={() => setPending(pending === type ? null : type)}
              >
                <span className="swatch" style={{ background: preset.color }} />
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="panel-section">
        <h3>目标</h3>
        <div className="tool-grid">
          <button
            className={`tool-btn ${pending === "parking_zone" ? "active" : ""}`}
            onClick={() =>
              setPending(pending === "parking_zone" ? null : "parking_zone")
            }
          >
            <span className="swatch" style={{ background: "#10b981" }} />
            车位框
          </button>
          <button
            className={`tool-btn ${pending === "trigger_line" ? "active" : ""}`}
            onClick={() =>
              setPending(pending === "trigger_line" ? null : "trigger_line")
            }
          >
            <span className="swatch" style={{ background: "#f59e0b" }} />
            判定线
          </button>
        </div>
      </div>
      <div className="panel-section">
        <h3>控制点</h3>
        <div className="tool-grid">
          <button
            className={`tool-btn ${pending === "spawn_point" ? "active" : ""}`}
            onClick={() =>
              setPending(pending === "spawn_point" ? null : "spawn_point")
            }
          >
            <span className="swatch" style={{ background: "#3b82f6" }} />
            出生点
          </button>
        </div>
      </div>
      <div className="panel-section">
        <div className="small-muted">
          {pending
            ? `待放置：点击地面落点 · Esc 取消`
            : `点击类型开始放置，或单击场景选中对象`}
        </div>
      </div>
    </>
  );
}

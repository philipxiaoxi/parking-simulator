import { useMapStore } from "../stores/mapStore";
import { useEditorStore } from "../stores/editorStore";
import { STATIC_PRESETS, ROTATION_STEP } from "../lib/constants";
import { normalizeAngle } from "../lib/geometry";

export function PropertyPanel() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const map = useMapStore((s) => s.map);
  const { updateObject, removeObject, updateGoal, removeGoal, setSpawnPoint } =
    useMapStore.getState();
  const setSelected = useEditorStore((s) => s.setSelected);

  if (!map) return null;

  if (!selectedId) {
    return (
      <div className="panel-section">
        <h3>地图信息</h3>
        <div className="prop-row">
          <label>尺寸</label>
          <span style={{ fontSize: 12 }}>
            {map.scene.size.width} × {map.scene.size.height}
          </span>
        </div>
        <div className="prop-row">
          <label>障碍</label>
          <span style={{ fontSize: 12 }}>{map.objects.length} 个</span>
        </div>
        <div className="prop-row">
          <label>目标</label>
          <span style={{ fontSize: 12 }}>{map.goals.length} 个</span>
        </div>
        <div className="small-muted">单击场景中的对象查看和修改属性。</div>
      </div>
    );
  }

  if (selectedId === "spawn") {
    const sp = map.spawnPoint;
    const rotate = (delta: number) =>
      setSpawnPoint({
        ...sp,
        rotation: normalizeAngle(sp.rotation + delta),
      });
    return (
      <div className="panel-section">
        <h3>出生点</h3>
        <div className="prop-row">
          <label>位置</label>
          <span style={{ fontSize: 12 }}>
            x: {sp.position[0].toFixed(1)} · z: {sp.position[2].toFixed(1)}
          </span>
        </div>
        <div className="prop-row">
          <label>朝向</label>
          <span style={{ fontSize: 12 }}>{Math.round(sp.rotation)}°</span>
        </div>
        <div className="prop-row">
          <button onClick={() => rotate(-ROTATION_STEP)}>⟲ 左转 {ROTATION_STEP}°</button>
          <button onClick={() => rotate(ROTATION_STEP)}>右转 {ROTATION_STEP}° ⟳</button>
        </div>
        <div className="small-muted">出生点不可删除,可拖动改位置。</div>
      </div>
    );
  }

  const obj = map.objects.find((o) => o.id === selectedId);
  if (obj) {
    const preset = STATIC_PRESETS[obj.type];
    const rotate = (delta: number) =>
      updateObject(obj.id, { rotation: normalizeAngle(obj.rotation + delta) });
    return (
      <div className="panel-section">
        <h3>{preset.label}</h3>
        <div className="prop-row">
          <label>位置</label>
          <span style={{ fontSize: 12 }}>
            x: {obj.position[0].toFixed(1)} · z: {obj.position[2].toFixed(1)}
          </span>
        </div>
        <div className="prop-row">
          <label>朝向</label>
          <span style={{ fontSize: 12 }}>{Math.round(obj.rotation)}°</span>
        </div>
        <div className="prop-row">
          <button onClick={() => rotate(-ROTATION_STEP)}>⟲ 左转</button>
          <button onClick={() => rotate(ROTATION_STEP)}>右转 ⟳</button>
        </div>
        <div className="prop-row">
          <button
            className="danger"
            onClick={() => {
              removeObject(obj.id);
              setSelected(null);
            }}
          >
            删除
          </button>
        </div>
      </div>
    );
  }

  const goal = map.goals.find((g) => g.id === selectedId);
  if (goal) {
    const rotate = (delta: number) =>
      updateGoal(goal.id, { rotation: normalizeAngle(goal.rotation + delta) });
    return (
      <div className="panel-section">
        <h3>{goal.type === "parking_zone" ? "车位框" : "判定线"}</h3>
        <div className="prop-row">
          <label>位置</label>
          <span style={{ fontSize: 12 }}>
            x: {goal.position[0].toFixed(1)} · z: {goal.position[2].toFixed(1)}
          </span>
        </div>
        <div className="prop-row">
          <label>朝向</label>
          <span style={{ fontSize: 12 }}>{Math.round(goal.rotation)}°</span>
        </div>
        <div className="prop-row">
          <button onClick={() => rotate(-ROTATION_STEP)}>⟲ 左转</button>
          <button onClick={() => rotate(ROTATION_STEP)}>右转 ⟳</button>
        </div>
        {goal.type === "parking_zone" ? (
          <>
            <div className="prop-row">
              <label>车位宽</label>
              <input
                type="number"
                value={goal.size[0]}
                step={0.1}
                min={1.5}
                max={6}
                onChange={(e) =>
                  updateGoal(goal.id, {
                    size: [parseFloat(e.target.value) || 0, goal.size[1]],
                  })
                }
              />
            </div>
            <div className="prop-row">
              <label>车位长</label>
              <input
                type="number"
                value={goal.size[1]}
                step={0.1}
                min={3}
                max={10}
                onChange={(e) =>
                  updateGoal(goal.id, {
                    size: [goal.size[0], parseFloat(e.target.value) || 0],
                  })
                }
              />
            </div>
          </>
        ) : (
          <div className="prop-row">
            <label>线长</label>
            <input
              type="number"
              value={goal.length}
              step={0.5}
              min={1}
              max={20}
              onChange={(e) =>
                updateGoal(goal.id, { length: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        )}
        <div className="prop-row">
          <button
            className="danger"
            onClick={() => {
              removeGoal(goal.id);
              setSelected(null);
            }}
          >
            删除
          </button>
        </div>
      </div>
    );
  }

  return null;
}

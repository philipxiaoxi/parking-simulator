import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../stores/editorStore";
import { useMapStore } from "../stores/mapStore";
import { useSimulationStore } from "../stores/simulationStore";
import { useUiStore } from "../stores/uiStore";
import { saveMap } from "../persistence/db";
import { getCameraState } from "../scene/Camera";

export function Topbar() {
  const navigate = useNavigate();
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const map = useMapStore((s) => s.map);
  const dirty = useMapStore((s) => s.dirty);
  const renameMap = useMapStore((s) => s.renameMap);
  const markSaved = useMapStore((s) => s.markSaved);
  const updateCamera = useMapStore((s) => s.updateCamera);
  const resetToSpawn = useSimulationStore((s) => s.resetToSpawn);
  const pushToast = useUiStore((s) => s.pushToast);

  if (!map) return null;

  const handleModeSwitch = (next: "edit" | "drive") => {
    if (next === mode) return;
    if (next === "drive") {
      resetToSpawn(map.spawnPoint);
    }
    setMode(next);
  };

  const handleSave = async () => {
    try {
      const cameraState = getCameraState();
      if (cameraState) {
        updateCamera(cameraState);
      }
      const mapToSave = useMapStore.getState().map;
      if (mapToSave) {
        await saveMap(mapToSave);
        markSaved();
        pushToast("已保存", "success");
      }
    } catch (err) {
      console.error(err);
      pushToast("保存失败", "error");
    }
  };

  return (
    <div className="topbar">
      <span className="brand">停车训练</span>
      <button onClick={() => navigate("/")}>返回列表</button>
      <div className="map-name">
        <input
          value={map.name}
          onChange={(e) => renameMap(e.target.value)}
          placeholder="地图名称"
        />
      </div>
      <button className="primary" onClick={handleSave}>
        保存{dirty ? " •" : ""}
      </button>
      <div className="spacer" />
      <div className="mode-switch">
        <button
          className={mode === "edit" ? "active" : ""}
          onClick={() => handleModeSwitch("edit")}
        >
          编辑模式
        </button>
        <button
          className={mode === "drive" ? "active" : ""}
          onClick={() => handleModeSwitch("drive")}
        >
          驾驶模式
        </button>
      </div>
    </div>
  );
}

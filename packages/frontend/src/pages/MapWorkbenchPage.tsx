import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { loadMap } from "../persistence/db";
import { useMapStore } from "../stores/mapStore";
import { useEditorStore } from "../stores/editorStore";
import { useSimulationStore } from "../stores/simulationStore";
import { useUiStore } from "../stores/uiStore";
import { Topbar } from "../components/Topbar";
import { ToolPalette } from "../components/ToolPalette";
import { PropertyPanel } from "../components/PropertyPanel";
import { HudBottom } from "../components/HudBottom";
import { ResultBanner } from "../components/ResultBanner";
import { Toasts } from "../components/Toasts";
import { Workbench3D } from "../scene/Workbench3D";
import { useKeyboardInput } from "../scene/useKeyboardInput";

export function MapWorkbenchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setMap = useMapStore((s) => s.setMap);
  const clearMap = useMapStore((s) => s.clear);
  const map = useMapStore((s) => s.map);
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const setSelected = useEditorStore((s) => s.setSelected);
  const setPending = useEditorStore((s) => s.setPendingPlacement);
  const pendingPlacement = useEditorStore((s) => s.pendingPlacement);
  const selectedId = useEditorStore((s) => s.selectedId);
  const pushToast = useUiStore((s) => s.pushToast);
  const resetToSpawn = useSimulationStore((s) => s.resetToSpawn);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    loadMap(id).then((m) => {
      if (cancelled) return;
      if (!m) {
        pushToast("地图不存在", "error");
        navigate("/");
        return;
      }
      setMap(m);
      resetToSpawn(m.spawnPoint);
      const wantDrive = searchParams.get("mode") === "drive";
      setMode(wantDrive ? "drive" : "edit");
    });
    return () => {
      cancelled = true;
      clearMap();
    };
  }, [id, navigate, setMap, clearMap, pushToast, resetToSpawn, setMode, searchParams]);

  const handleReset = () => {
    if (!map) return;
    resetToSpawn(map.spawnPoint);
  };

  useKeyboardInput(handleReset);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        if (pendingPlacement) setPending(null);
        else if (selectedId) setSelected(null);
      }
      if (e.code === "Delete" || e.code === "Backspace") {
        if (mode !== "edit") return;
        if (!selectedId || selectedId === "spawn") return;
        const store = useMapStore.getState();
        if (store.map?.objects.some((o) => o.id === selectedId)) {
          store.removeObject(selectedId);
          setSelected(null);
        } else if (store.map?.goals.some((g) => g.id === selectedId)) {
          store.removeGoal(selectedId);
          setSelected(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingPlacement, selectedId, mode, setPending, setSelected]);

  const originalRequestedDrive = searchParams.get("mode") === "drive";
  useEffect(() => {
    if (!map || !originalRequestedDrive) return;
    if (!map.spawnPoint) {
      pushToast("请先设置出生点", "error");
      setMode("edit");
    }
  }, [map, originalRequestedDrive, pushToast, setMode]);

  const handleAttemptSwitchToDrive = () => {
    if (!map) return false;
    return true;
  };
  void handleAttemptSwitchToDrive;

  if (!map) {
    return <div style={{ padding: 32 }}>正在加载地图…</div>;
  }

  return (
    <div className="app-root">
      <Topbar />
      <div className="workspace">
        {mode === "edit" && (
          <div className="left-panel">
            <ToolPalette />
            <PropertyPanel />
          </div>
        )}
        <div className="scene-area">
          <Workbench3D />
          <Toasts />
          <ResultBanner />
          <HudBottom onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}

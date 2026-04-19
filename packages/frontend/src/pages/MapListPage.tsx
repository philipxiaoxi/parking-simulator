import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteMap,
  listMaps,
  saveMap,
  hasLocalData,
  migrateLocalToServer,
  clearLocalDb,
} from "../persistence/db";
import type { MapIndexEntry } from "../types/map";
import { createDemoMap, createEmptyMap } from "../persistence/factory";
import { useUiStore } from "../stores/uiStore";

export function MapListPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<MapIndexEntry[]>([]);
  const [hasLocal, setHasLocal] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const pushToast = useUiStore((s) => s.pushToast);

  const refresh = async () => setEntries(await listMaps());

  useEffect(() => {
    refresh();
    hasLocalData().then(setHasLocal);
  }, []);

  const handleCreate = async () => {
    const map = createEmptyMap(`新地图 ${new Date().toLocaleString("zh-CN")}`);
    await saveMap(map);
    navigate(`/workbench/${map.id}`);
  };

  const handleDemo = async () => {
    if (entries.some((e) => e.name.startsWith("示例地图"))) {
      const demo = entries.find((e) => e.name.startsWith("示例地图"));
      if (demo) navigate(`/workbench/${demo.id}`);
      return;
    }
    const map = createDemoMap();
    await saveMap(map);
    navigate(`/workbench/${map.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此地图?")) return;
    await deleteMap(id);
    pushToast("已删除", "info");
    refresh();
  };

  const handleMigrate = async () => {
    if (!confirm("将本地存储的地图迁移到服务器？")) return;
    setMigrating(true);
    try {
      const result = await migrateLocalToServer();
      if (result.errors.length > 0) {
        pushToast(`迁移完成，${result.migrated}/${result.total}，部分失败`, "error");
      } else {
        pushToast(`迁移成功 ${result.migrated} 张地图`, "success");
        await clearLocalDb();
        setHasLocal(false);
      }
      refresh();
    } catch (e) {
      pushToast(`迁移失败: ${e}`, "error");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="map-list-page">
      <div className="map-list-header">
        <h1>停车训练模拟器</h1>
        <div className="spacer" />
        {hasLocal && (
          <button
            onClick={handleMigrate}
            disabled={migrating}
            style={{ background: "#f59e0b" }}
          >
            {migrating ? "迁移中..." : "迁移本地数据"}
          </button>
        )}
        <button onClick={handleDemo}>试用示例地图</button>
        <button onClick={handleCreate}>新建地图</button>
      </div>
      {entries.length === 0 ? (
        <div className="empty-state">
          <div>还没有地图。新建一张或试用示例地图开始练习。</div>
          <button onClick={handleDemo}>试用示例地图</button>
        </div>
      ) : (
        <div className="map-grid">
          {entries.map((e) => (
            <div key={e.id} className="map-card" onClick={() => navigate(`/workbench/${e.id}`)}>
              <h4>{e.name}</h4>
              <div className="muted">
                更新于 {new Date(e.updatedAt).toLocaleString("zh-CN")}
              </div>
              <div className="actions" onClick={(ev) => ev.stopPropagation()}>
                <button
                  className="primary"
                  onClick={() => navigate(`/workbench/${e.id}?mode=drive`)}
                >
                  训练
                </button>
                <button onClick={() => navigate(`/workbench/${e.id}`)}>编辑</button>
                <button className="danger" onClick={() => handleDelete(e.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

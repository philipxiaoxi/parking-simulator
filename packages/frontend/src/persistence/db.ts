import { openDB, type IDBPDatabase } from "idb";
import { useUiStore } from "../stores/uiStore";
import type { MapData, MapIndexEntry } from "../types/map";

// 开发环境使用完整地址，生产环境使用相对路径
const API_BASE = import.meta.env.DEV
  ? "http://localhost:7001/api"
  : "/api";

// ========== 后端 API ==========

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const errorMsg = `请求失败: ${res.status} ${res.statusText}`;
      useUiStore.getState().pushToast(errorMsg, "error");
      throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      useUiStore.getState().pushToast("网络连接失败，请检查网络", "error");
    }
    throw e;
  }
}

export async function saveMap(map: MapData): Promise<void> {
  const toStore: MapData = {
    ...map,
    meta: { ...map.meta, updatedAt: new Date().toISOString() },
  };

  const existing = await request<MapIndexEntry[]>(`/maps`).then((maps) =>
    maps.find((m) => m.id === map.id)
  );

  if (existing) {
    await request(`/maps/${map.id}`, {
      method: "PUT",
      body: JSON.stringify(toStore),
    });
  } else {
    await request(`/maps`, {
      method: "POST",
      body: JSON.stringify(toStore),
    });
  }
}

export async function loadMap(id: string): Promise<MapData | undefined> {
  try {
    return await request<MapData>(`/maps/${id}`);
  } catch {
    return undefined;
  }
}

export async function deleteMap(id: string): Promise<void> {
  await request(`/maps/${id}`, { method: "DELETE" });
}

export async function listMaps(): Promise<MapIndexEntry[]> {
  const maps = await request<MapIndexEntry[]>(`/maps`);
  return maps.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ========== 迁移功能 ==========

const DB_NAME = "parking-sim";
const DB_VERSION = 1;
const STORE = "maps";
const INDEX_KEY = "parking-sim/map-index/v1";

let dbPromise: Promise<IDBPDatabase> | null = null;
function getLocalDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

async function loadAllLocalMaps(): Promise<MapData[]> {
  try {
    const db = await getLocalDb();
    return (await db.getAll(STORE)) as MapData[];
  } catch {
    return [];
  }
}

export async function migrateLocalToServer(): Promise<{
  total: number;
  migrated: number;
  errors: string[];
}> {
  const localMaps = await loadAllLocalMaps();
  const result = { total: localMaps.length, migrated: 0, errors: [] as string[] };

  for (const map of localMaps) {
    try {
      await saveMap(map);
      result.migrated++;
    } catch (e) {
      result.errors.push(`${map.name}: ${e}`);
    }
  }

  return result;
}

export async function clearLocalDb(): Promise<void> {
  const db = await getLocalDb();
  await db.clear(STORE);
  localStorage.removeItem(INDEX_KEY);
}

export async function hasLocalData(): Promise<boolean> {
  const localMaps = await loadAllLocalMaps();
  return localMaps.length > 0;
}

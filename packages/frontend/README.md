# 停车训练驾驶模拟器

基于 Web 的上帝视角停车训练模拟器。用户在 3D 场景中控制车辆练习倒车入库、侧方位停车、窄路通行等低速控车场景,支持自定义地图与成功/失败判定。

本仓库是 MVP 实现,对应 `../PRD.md`、`../Web技术架构设计草案.md` 等设计文档。

## 快速开始

```bash
npm install
npm run dev        # 启动开发服务器 http://localhost:5173
```

构建生产版本:

```bash
npm run build      # 产物在 dist/
npm run preview    # 本地预览生产构建
```

直接运行已构建产物(若 zip 内已含 `dist/`):

```bash
npx serve dist     # 或 python3 -m http.server -d dist 8080
```

跑单元测试(规则引擎):

```bash
npx vitest run
```

## 主要功能

- **地图列表**:新建、删除、试用示例地图,按更新时间排序
- **地图编辑器**:摆放 6 种障碍物(轿车、SUV、矩形、方块、房子、围墙)、车位框、判定线、出生点;拖拽移动、按钮旋转、Delete 删除
- **驾驶模式**:W/S/A/D 或方向键控制,R 键重置;底部 HUD 显示状态
- **规则判定**
  - 失败:撞到障碍物 or 驶出地图边界
  - 成功:四轮进入车位框 or 车头跨过判定线(带穿越事件检测)
  - 失败优先:同帧既撞又成功按失败处理
- **持久化**:IndexedDB 存地图详情 + localStorage 存列表索引

## 操作说明

### 编辑模式

1. 左侧面板点击要放置的对象类型(轿车、围墙、车位框…)
2. 在 3D 场景中点击地面落点
3. 单击已放置对象可选中,拖动改位置,右侧面板可旋转/删除
4. 出生点不可删除,但可拖动

快捷键:
- `Esc` 取消选中 / 取消待放置
- `Delete` / `Backspace` 删除选中对象(出生点除外)

### 驾驶模式

| 按键 | 作用 |
|---|---|
| `W` / `↑` | 前进 |
| `S` / `↓` | 倒车 |
| `A` / `←` | 左转 |
| `D` / `→` | 右转 |
| `R` | 重置到出生点 |

驶出边界、撞障碍即失败;四轮入车位框或车头越过判定线即成功。成功/失败后须手动重置进入下一轮。

## 技术栈

- Vite + React 18 + TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- Zustand(状态管理)
- idb(IndexedDB wrapper)+ localStorage(地图索引)
- react-router-dom(路由)
- Vitest(单元测试)

**未使用**物理引擎 —— 按设计文档"视觉 3D、逻辑 2.5D"思路,车辆运动用自定义低速 Ackermann 模型,碰撞用自研 SAT(分离轴定理)作用于旋转矩形,更轻量、可控、可调试。

## 架构速览

```
src/
├── types/           # 数据类型定义(MapData、VehicleState、TrainingResult…)
├── lib/             # 纯函数工具
│   ├── geometry.ts  # 旋转、SAT、点在矩形内等
│   ├── constants.ts # 车辆参数、预设障碍物尺寸/颜色
│   └── id.ts
├── simulation/      # 业务核心,无框架依赖
│   ├── vehicle.ts   # Ackermann 运动更新、车轮/车头参考点
│   ├── rules.ts     # 碰撞 + 成功失败判定 + 每帧 evaluateRules
│   └── rules.test.ts
├── persistence/     # 地图存取(IndexedDB + localStorage)
├── stores/          # 4 个 Zustand store
│   ├── mapStore.ts
│   ├── editorStore.ts
│   ├── simulationStore.ts
│   └── uiStore.ts
├── scene/           # R3F 3D 渲染
│   ├── Workbench3D.tsx
│   ├── SimulationLoop.tsx
│   ├── PlacementPlane.tsx
│   ├── useDraggable.ts
│   ├── useKeyboardInput.ts
│   └── objects/     # Ground, Vehicle, StaticObjectMesh, ParkingZoneMesh, ...
├── components/      # UI 面板(顶栏、工具栏、属性面板、HUD、提示)
├── pages/           # MapListPage, MapWorkbenchPage
└── styles/app.css
```

## 关键设计约定

1. **坐标系**:车辆仅在 `(x, z)` 平面运动,`y` 为高度。heading = 0 时车头朝 `+z`。
2. **旋转统一**:JSON 里用度数,`mesh.rotation.y = heading * DEG2RAD`。`lib/geometry.ts` 的 `rotatePoint` 与 Three.js 完全对齐。
3. **规则处理顺序**(每帧):
   1. 读输入 → 推进车辆 → 更新参考点
   2. 先查碰撞
   3. 再查出界
   4. 最后遍历 `goals[]` 查成功
   5. 触发即锁定,直到 reset
4. **判定线是跨帧事件**,不是"在哪一侧":用上帧和当前帧的符号翻转检测,再校验穿越点在线段有效长度内。Reset 会清空 `triggerMemory`。
5. **持久化**:地图详情存 IndexedDB,列表索引存 localStorage。地图 JSON 带 `version` 字段以便将来迁移。

## 地图数据结构

完整 Schema 见 `../地图JSON Schema详细设计.md`。简化示例:

```json
{
  "id": "map_xxx",
  "version": 1,
  "name": "侧方位练习",
  "meta": { "createdAt": "...", "updatedAt": "..." },
  "scene": {
    "size": { "width": 40, "height": 40 },
    "camera": { "target": [0,0,0], "distance": 28, "yaw": 45, "pitch": 55 },
    "boundary": { "enabled": true, "failOnExit": true },
    "ground": { "theme": "simple_gray" }
  },
  "spawnPoint": { "position": [0, 0, 12], "rotation": 180 },
  "objects": [
    { "id": "obj_x", "type": "wall", "position": [10, 0, 4], "rotation": 90, "scale": [1,1,6], "collider": { "shape": "box", "size": [1,1,6] } }
  ],
  "goals": [
    { "id": "goal_p", "type": "parking_zone", "position": [2,0,-6], "rotation": 0, "enabled": true, "size": [2.6, 5.2] },
    { "id": "goal_l", "type": "trigger_line", "position": [0,0,-10], "rotation": 0, "enabled": true, "length": 4 }
  ]
}
```

## 测试覆盖

`src/simulation/rules.test.ts` 包含 16 条用例,覆盖:

- 碰撞检测(命中/远离)
- 车位成功(四轮在框 / 三轮不算 / 旋转 / disabled 关闭)
- 判定线(首帧不触发 / 正向穿越成功 / 线外延长线不算 / 出生已过不算)
- 规则优先级(同帧碰撞 + 成功 → 失败)
- 车辆运动(前进、倒车、转向改变 heading)

运行:`npx vitest run`

## MVP 未包含的功能

按设计文档约定,以下明确延后:多选/框选、自由缩放、完整撤销栈、复制粘贴、图层、多车型、轨迹回放、教学辅助线、评分、社区地图、云同步、移动端触控。

## 许可

仅供内部训练与学习演示,暂未选择开源协议。

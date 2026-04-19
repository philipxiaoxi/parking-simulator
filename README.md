# 停车训练驾驶模拟器

基于 Web 的上帝视角停车训练模拟器。用户在 3D 场景中控制车辆练习倒车入库、侧方位停车、窄路通行等低速控车场景，支持自定义地图与成功/失败判定。

## 项目结构

```
parking-sim/
├── packages/
│   ├── frontend/     # React + Vite + Three.js 前端应用
│   └── server/       # Egg.js 后端服务
├── docs/             # 设计文档
│   ├── PRD.md                    # 产品需求文档
│   ├── Web技术架构设计草案.md      # 技术架构设计
│   ├── MVP开发任务拆解.md         # 开发任务拆解
│   ├── 地图JSON Schema详细设计.md # 地图数据结构设计
│   ├── 规则设计细化文档.md         # 规则判定设计
│   └── 编辑器交互设计草案.md       # 交互设计
├── package.json      # Monorepo 根配置
└── README.md
```

## 技术栈

### 前端 (`@parking-sim/frontend`)
- Vite + React 19 + TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- Zustand（状态管理）
- idb（IndexedDB 封装）
- Vitest（单元测试）

### 后端 (`@parking-sim/server`)
- Egg.js
- SQLite + Sequelize

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 仅启动前端
npm run dev

# 仅启动后端
npm run dev:server

# 同时启动前后端
npm run dev:all
```

### 构建

```bash
# 构建前端
npm run build
```

### 测试

```bash
# 运行前端单元测试
npm run test
```

## 主要功能

- **地图管理**：新建、编辑、删除地图，本地持久化存储
- **地图编辑器**：摆放障碍物（轿车、SUV、矩形、方块、房子、围墙）、车位框、判定线、出生点
- **驾驶模式**：W/S/A/D 或方向键控制车辆，R 键重置
- **规则判定**：
  - 失败：撞障碍物或驶出边界
  - 成功：四轮进入车位框 或 车头越过判定线

## 操作说明

### 编辑模式
1. 左侧面板选择对象类型
2. 在 3D 场景中点击放置
3. 单击选中对象可拖动，右侧面板可旋转/删除
4. `Esc` 取消选中，`Delete` 删除选中对象

### 驾驶模式

| 按键 | 作用 |
|---|---|
| `W` / `↑` | 前进 |
| `S` / `↓` | 倒车 |
| `A` / `←` | 左转 |
| `D` / `→` | 右转 |
| `R` | 重置到出生点 |

## 文档

详细设计文档请查看 [docs/](docs/) 目录：
- [PRD.md](docs/PRD.md) - 产品需求文档
- [Web技术架构设计草案.md](docs/Web技术架构设计草案.md) - 技术架构设计
- [地图JSON Schema详细设计.md](docs/地图JSON Schema详细设计.md) - 地图数据结构

## 许可

[MIT License](LICENSE)

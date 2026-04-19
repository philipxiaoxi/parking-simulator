# 停车训练驾驶模拟器 地图 JSON Schema 详细设计

## 1. 文档信息

- 文档名称：地图 JSON Schema 详细设计
- 关联文档：
  - `PRD.md`
  - `Web技术架构设计草案.md`
  - `MVP开发任务拆解.md`
- 文档版本：v0.1
- 文档日期：2026-04-17
- 文档目标：定义 Web MVP 阶段地图数据的结构、字段语义、约束规则与版本演进策略

## 2. 设计目标

地图 JSON 需要同时服务以下场景：

- 地图列表展示
- 地图编辑器读写
- 驾驶模式加载
- 成功失败规则判定
- 本地持久化存储
- 后续版本扩展

因此该 Schema 设计需要满足：

- 可读性强
- 结构稳定
- 便于前端直接消费
- 支持版本演进
- 支持编辑模式与驾驶模式共用

## 3. 设计原则

### 3.1 数据驱动

地图中的障碍物、目标物、出生点、相机配置等均通过 JSON 描述，不应把核心场景结构隐含在代码逻辑中。

### 3.2 规则与表现解耦

视觉显示和业务判定可以复用同一个对象，但字段设计上要明确区分：

- 渲染所需信息
- 判定所需信息

### 3.3 面向 MVP，留有扩展位

MVP 先满足：

- 障碍物
- 出生点
- 车位框
- 判定线

但 Schema 要为未来保留扩展空间，例如：

- 多车型
- 多阶段目标
- 教学辅助元素
- 地图作者信息

### 3.4 尽量显式，不做隐式推导

例如：

- 对象类型显式写入 `type`
- 地图版本显式写入 `version`
- 目标对象单独放入 `goals`

避免依赖前端逻辑根据名称或位置猜测对象用途。

## 4. 顶层结构

MVP 推荐的地图 JSON 顶层结构如下：

```json
{
  "id": "map_001",
  "version": 1,
  "name": "侧方位停车练习",
  "description": "用于练习低速侧方位停车",
  "meta": {},
  "scene": {},
  "spawnPoint": {},
  "objects": [],
  "goals": []
}
```

## 5. 顶层字段定义

## 5.1 `id`

类型：

- `string`

说明：

- 地图唯一标识
- 用于地图列表、加载、删除、持久化索引

约束建议：

- 全局唯一
- 不依赖地图名称生成
- 推荐使用前缀式 ID，例如 `map_xxx`

示例：

```json
"id": "map_20260417_001"
```

## 5.2 `version`

类型：

- `number`

说明：

- 当前地图数据结构版本
- 用于后续迁移和兼容处理

MVP 建议：

- 固定为 `1`

示例：

```json
"version": 1
```

## 5.3 `name`

类型：

- `string`

说明：

- 地图名称
- 用于地图列表展示

约束建议：

- 非空
- 长度建议 1 到 50 个字符

## 5.4 `description`

类型：

- `string`

说明：

- 地图补充说明
- 可为空字符串

用途：

- 用于帮助用户区分练习目的
- 后续可用于社区分享说明

## 5.5 `meta`

类型：

- `object`

说明：

- 地图元信息
- 不直接参与训练逻辑

MVP 建议字段：

```json
{
  "createdAt": "2026-04-17T14:00:00.000Z",
  "updatedAt": "2026-04-17T14:30:00.000Z",
  "author": "local-user",
  "tags": ["侧方位", "停车"]
}
```

字段说明：

- `createdAt`: 创建时间
- `updatedAt`: 更新时间
- `author`: 作者或本地创建者标识
- `tags`: 便于后续筛选

## 5.6 `scene`

类型：

- `object`

说明：

- 地图场景级配置
- 定义地面尺寸、相机初始参数、边界行为等

建议结构：

```json
{
  "size": {
    "width": 40,
    "height": 40
  },
  "camera": {
    "target": [0, 0, 0],
    "distance": 24,
    "yaw": 45,
    "pitch": 60
  },
  "boundary": {
    "enabled": true,
    "failOnExit": true
  },
  "ground": {
    "theme": "simple_gray"
  }
}
```

## 5.7 `spawnPoint`

类型：

- `object`

说明：

- 驾驶模式加载时车辆初始位置和朝向

建议结构：

```json
{
  "position": [0, 0, 12],
  "rotation": 180
}
```

字段说明：

- `position`: 三维位置，MVP 实际主要使用 `x/z`
- `rotation`: 车辆朝向角，单位建议统一为度

## 5.8 `objects`

类型：

- `array`

说明：

- 地图中的静态场景对象
- 主要用于障碍物和基础场景构成

MVP 范围：

- 静态轿车
- 静态 SUV
- 矩形
- 正方形
- 房子
- 围墙

## 5.9 `goals`

类型：

- `array`

说明：

- 地图中的成功目标对象

MVP 范围：

- `parking_zone`
- `trigger_line`

设计原因：

- 目标对象和普通障碍物用途不同
- 独立存储有利于判定逻辑清晰
- 后续更容易扩展课程目标

## 6. 基础数据类型约定

为了让所有对象结构一致，建议先统一几个基础值类型。

## 6.1 向量类型

### `Vec3`

```json
[0, 0, 0]
```

说明：

- 统一使用长度为 3 的数组表示三维向量
- 顺序固定为 `[x, y, z]`

MVP 说明：

- 虽然大多数业务仅在平面运行，但仍保留 `y` 维，便于 3D 场景扩展

## 6.2 尺寸类型

### `Size2D`

```json
[2.5, 5.5]
```

说明：

- 用于二维矩形区域
- 顺序固定为 `[width, length]`

### `Scale3D`

```json
[1, 1, 6]
```

说明：

- 用于三维缩放或碰撞体尺寸
- 顺序固定为 `[x, y, z]`

## 6.3 角度类型

统一约定：

- 所有旋转角使用度数
- 主要使用 `rotation` 表示绕 `y` 轴旋转

原因：

- 方便编辑器直接显示与输入
- 前端内部如需换算为弧度，可在运行时转换

## 7. `scene` 详细结构

## 7.1 `scene.size`

```json
{
  "width": 40,
  "height": 40
}
```

说明：

- 地图平面大小
- 以地面中心为原点时，可推出地图边界范围

建议约束：

- `width > 0`
- `height > 0`

## 7.2 `scene.camera`

```json
{
  "target": [0, 0, 0],
  "distance": 24,
  "yaw": 45,
  "pitch": 60
}
```

字段说明：

- `target`: 相机初始观察目标点
- `distance`: 相机距离目标点的初始距离
- `yaw`: 水平旋转角
- `pitch`: 俯仰角

建议约束：

- `distance > 0`
- `pitch` 建议限制在 20 到 85 度之间

## 7.3 `scene.boundary`

```json
{
  "enabled": true,
  "failOnExit": true
}
```

字段说明：

- `enabled`: 是否启用地图边界
- `failOnExit`: 车辆离开边界后是否判定失败

说明：

- 该字段直接服务失败规则
- 便于未来做“开放场景不判出界”的训练地图

## 7.4 `scene.ground`

```json
{
  "theme": "simple_gray"
}
```

说明：

- 地面视觉风格配置
- MVP 可先只保留一个简单字段

后续可扩展：

- 地面材质
- 网格显示
- 辅助线主题

## 8. `spawnPoint` 详细结构

建议结构：

```json
{
  "position": [0, 0, 12],
  "rotation": 180
}
```

字段说明：

- `position`: 车辆生成点
- `rotation`: 车辆生成朝向

建议约束：

- 必填
- 位置必须落在地图边界内
- 不应与障碍物直接重叠

后续可扩展：

- 多出生点
- 出生点命名
- 预置场景分组

## 9. `objects` 结构设计

## 9.1 通用对象结构

MVP 阶段建议所有静态对象遵循统一基础结构：

```json
{
  "id": "obj_wall_001",
  "type": "wall",
  "position": [10, 0, 4],
  "rotation": 90,
  "scale": [1, 1, 6],
  "collider": {
    "shape": "box",
    "size": [1, 1, 6]
  },
  "render": {
    "variant": "default"
  }
}
```

## 9.2 通用字段定义

### `id`

- 类型：`string`
- 说明：对象唯一标识

### `type`

- 类型：`string`
- 说明：对象类型

MVP 支持值：

- `sedan_static`
- `suv_static`
- `box_rect`
- `box_square`
- `house`
- `wall`

### `position`

- 类型：`Vec3`
- 说明：对象中心点位置

### `rotation`

- 类型：`number`
- 说明：绕 `y` 轴旋转角

### `scale`

- 类型：`Scale3D`
- 说明：对象显示尺寸或缩放

### `collider`

- 类型：`object`
- 说明：对象碰撞定义

### `render`

- 类型：`object`
- 说明：对象渲染配置

## 9.3 `collider` 结构

MVP 建议：

```json
{
  "shape": "box",
  "size": [1, 1, 6]
}
```

字段说明：

- `shape`: MVP 固定为 `box`
- `size`: 碰撞盒尺寸

设计理由：

- 当前障碍物完全可以统一为盒体碰撞器
- 更容易保证碰撞稳定
- 后续若增加复杂模型，再按需扩展

## 9.4 `render` 结构

MVP 建议：

```json
{
  "variant": "default"
}
```

字段说明：

- `variant`: 视觉样式变体

用途：

- 渲染层可根据该字段选择不同低模模型或颜色风格

## 10. `goals` 结构设计

## 10.1 目标对象设计原则

目标对象需要服务：

- 成功判定
- 编辑器可视化编辑
- 场景渲染提示

因此目标对象建议统一采用：

- 通用基础字段
- 按 `type` 区分具体结构

## 10.2 目标对象通用结构

```json
{
  "id": "goal_parking_001",
  "type": "parking_zone",
  "position": [2, 0, -6],
  "rotation": 0,
  "enabled": true
}
```

通用字段：

- `id`
- `type`
- `position`
- `rotation`
- `enabled`

说明：

- `enabled` 用于临时关闭某个成功目标，而不必删除

## 10.3 `parking_zone` 结构

建议结构：

```json
{
  "id": "goal_parking_001",
  "type": "parking_zone",
  "position": [2, 0, -6],
  "rotation": 0,
  "enabled": true,
  "size": [2.5, 5.5]
}
```

字段说明：

- `size`: 车位框尺寸，顺序为 `[width, length]`

规则语义：

- 车辆四个车轮都落入该矩形区域内时成功

建议约束：

- `size[0] > 0`
- `size[1] > 0`

后续可扩展：

- 朝向容差
- 停稳要求
- 压线规则
- 单边入位方向限制

## 10.4 `trigger_line` 结构

建议结构：

```json
{
  "id": "goal_line_001",
  "type": "trigger_line",
  "position": [0, 0, -10],
  "rotation": 0,
  "enabled": true,
  "length": 4,
  "directional": false
}
```

字段说明：

- `length`: 判定线长度
- `directional`: 是否仅允许单向通过触发

MVP 建议：

- 可先保留 `directional` 字段，但默认使用 `false`

规则语义：

- 车辆车头参考点穿过该线时成功

后续可扩展：

- 指定必须从某一侧穿过
- 多次经过不重复触发
- 与课程步骤绑定

## 11. 推荐 TypeScript 类型草案

以下为设计层面的类型示意，不等同于最终代码实现。

```ts
type Vec3 = [number, number, number];
type Size2D = [number, number];
type Scale3D = [number, number, number];

type MapMeta = {
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
};

type SceneConfig = {
  size: {
    width: number;
    height: number;
  };
  camera: {
    target: Vec3;
    distance: number;
    yaw: number;
    pitch: number;
  };
  boundary: {
    enabled: boolean;
    failOnExit: boolean;
  };
  ground: {
    theme: string;
  };
};

type SpawnPoint = {
  position: Vec3;
  rotation: number;
};

type StaticObjectType =
  | "sedan_static"
  | "suv_static"
  | "box_rect"
  | "box_square"
  | "house"
  | "wall";

type StaticMapObject = {
  id: string;
  type: StaticObjectType;
  position: Vec3;
  rotation: number;
  scale: Scale3D;
  collider: {
    shape: "box";
    size: Scale3D;
  };
  render?: {
    variant?: string;
  };
};

type ParkingZoneGoal = {
  id: string;
  type: "parking_zone";
  position: Vec3;
  rotation: number;
  enabled: boolean;
  size: Size2D;
};

type TriggerLineGoal = {
  id: string;
  type: "trigger_line";
  position: Vec3;
  rotation: number;
  enabled: boolean;
  length: number;
  directional?: boolean;
};

type Goal = ParkingZoneGoal | TriggerLineGoal;

type MapData = {
  id: string;
  version: number;
  name: string;
  description?: string;
  meta: MapMeta;
  scene: SceneConfig;
  spawnPoint: SpawnPoint;
  objects: StaticMapObject[];
  goals: Goal[];
};
```

## 12. JSON Schema 风格约束建议

如果后续希望做严格校验，可以在实现阶段为上述数据补一份正式 JSON Schema。

MVP 阶段至少建议校验以下内容：

- 顶层必填字段是否存在
- `version` 是否为支持版本
- `spawnPoint` 是否存在
- `objects` 和 `goals` 是否为数组
- 所有对象 `id` 是否唯一
- `type` 是否在受支持列表中
- 所有 `position`、`scale`、`size` 长度是否正确

## 13. 数据约束与校验规则

## 13.1 顶层约束

- `id` 必填
- `version` 必填
- `name` 必填
- `scene` 必填
- `spawnPoint` 必填
- `objects` 必填，可为空数组
- `goals` 必填，可为空数组

## 13.2 ID 约束

地图内以下对象 ID 应唯一：

- 地图 `id`
- 所有 `objects[].id`
- 所有 `goals[].id`

建议：

- 不同对象类型使用前缀
- 如 `obj_`、`goal_`

## 13.3 坐标约束

- 所有对象位置建议落在地图边界范围内
- 出生点不应与障碍物重叠
- 车位框和判定线允许部分靠近边界，但不建议完全超出地图

## 13.4 旋转约束

- 所有 `rotation` 均使用度数
- 建议前端写入时归一化为 `0-360`

## 13.5 目标约束

- `parking_zone` 至少一个尺寸字段
- `trigger_line` 至少一个长度字段
- 同一张地图允许多个目标对象
- 成功判定采用“任一目标达成即可成功”

## 14. 地图索引与地图详情分离建议

为了便于列表展示，建议持久化层将“地图索引”和“地图详情”拆开。

## 14.1 地图索引结构

适合放在 `localStorage`：

```json
[
  {
    "id": "map_001",
    "name": "侧方位停车练习",
    "updatedAt": "2026-04-17T14:30:00.000Z"
  }
]
```

用途：

- 快速渲染地图列表
- 不必每次都读取完整地图详情

## 14.2 地图详情结构

适合放在 `IndexedDB`：

- 即本文件定义的完整 `MapData`

好处：

- 列表页加载更快
- 地图数据结构更稳定
- 后续易于迁移到后端接口

## 15. 版本演进策略

MVP 阶段虽然仅使用 `version: 1`，但从第一版就应考虑升级策略。

## 15.1 升级原则

- 旧地图尽量可自动迁移
- 新字段优先设计为可选
- 删除字段前优先保留兼容层

## 15.2 未来可能升级的方向

### 版本 2 可能新增

- 多出生点
- 目标顺序要求
- 地图缩略图
- 教学辅助线
- 多车辆配置

### 版本 3 可能新增

- 多阶段课程目标
- 评分规则
- 回放配置
- 作者与分享权限信息

## 15.3 迁移策略建议

建议后续实现一个统一迁移流程：

```text
读取地图
  ↓
检查 version
  ↓
如果不是当前版本，则执行 migrate
  ↓
输出当前版本结构
```

## 16. 完整示例

下面给出一份 MVP 推荐的完整地图 JSON 示例。

```json
{
  "id": "map_20260417_001",
  "version": 1,
  "name": "侧方位停车与驶出练习",
  "description": "先完成侧方位停车，也可以直接驶出通过判定线完成训练",
  "meta": {
    "createdAt": "2026-04-17T14:00:00.000Z",
    "updatedAt": "2026-04-17T15:00:00.000Z",
    "author": "local-user",
    "tags": ["侧方位", "停车", "出线"]
  },
  "scene": {
    "size": {
      "width": 40,
      "height": 40
    },
    "camera": {
      "target": [0, 0, 0],
      "distance": 24,
      "yaw": 45,
      "pitch": 60
    },
    "boundary": {
      "enabled": true,
      "failOnExit": true
    },
    "ground": {
      "theme": "simple_gray"
    }
  },
  "spawnPoint": {
    "position": [0, 0, 12],
    "rotation": 180
  },
  "objects": [
    {
      "id": "obj_wall_001",
      "type": "wall",
      "position": [8, 0, 4],
      "rotation": 90,
      "scale": [1, 1, 8],
      "collider": {
        "shape": "box",
        "size": [1, 1, 8]
      },
      "render": {
        "variant": "default"
      }
    },
    {
      "id": "obj_sedan_001",
      "type": "sedan_static",
      "position": [-5, 0, -2],
      "rotation": 0,
      "scale": [1, 1, 1],
      "collider": {
        "shape": "box",
        "size": [2, 1, 4.8]
      },
      "render": {
        "variant": "silver"
      }
    }
  ],
  "goals": [
    {
      "id": "goal_parking_001",
      "type": "parking_zone",
      "position": [2, 0, -6],
      "rotation": 0,
      "enabled": true,
      "size": [2.5, 5.5]
    },
    {
      "id": "goal_line_001",
      "type": "trigger_line",
      "position": [0, 0, -10],
      "rotation": 0,
      "enabled": true,
      "length": 4,
      "directional": false
    }
  ]
}
```

## 17. 待确认问题

这份 Schema 已足够支持 MVP，但还有几个点后续值得继续定：

- 障碍物是否允许关闭碰撞，仅作为装饰
- 车位框是否需要区分“普通车位”和“侧方位车位”类型
- 判定线是否需要单向约束
- 是否要在地图里直接保存默认驾驶模式配置
- 是否需要为对象补充颜色字段

## 18. 结论

这份地图 JSON Schema 的核心思路是：

- 把地图拆成 `scene + spawnPoint + objects + goals`
- 用统一结构承载编辑器和训练模式
- 把障碍物与成功目标明确分离
- 从第一版开始保留版本号和迁移空间

如果沿着这份结构继续往下走，后续最值得补的下一份设计文档通常会是：

- 规则设计细化文档
- 编辑器交互设计草案
- 数据校验与迁移策略草案

# Magic English Buddy 落地规划节奏文档

## 目录
1. [总体规划](#1-总体规划)
2. [P0 阶段：骨架建设](#2-p0-阶段骨架建设)
3. [P1 阶段：趣味赋能](#3-p1-阶段趣味赋能)
4. [P2 阶段：激励完善](#4-p2-阶段激励完善)
5. [P3 阶段：联网扩充](#5-p3-阶段联网扩充)
6. [风险评估与应对](#6-风险评估与应对)
7. [质量保障](#7-质量保障)

---

## 1. 总体规划

### 1.1 阶段总览

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Magic English Buddy 开发路线图                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  P0 骨架建设          P1 趣味赋能          P2 激励完善          P3 联网扩充   │
│  ═══════════          ═══════════          ═══════════          ═══════════ │
│                                                                            │
│  Week 1-4             Week 5-8             Week 9-12            Week 13+   │
│  ─────────            ─────────            ──────────           ─────────  │
│                                                                            │
│  ✓ PWA环境搭建        ✓ 魔法地图           ✓ 卡牌收集系统        ✓ AI语音打分  │
│  ✓ IndexedDB存储      ✓ 进度解锁逻辑       ✓ 勋章成就体系        ✓ AI绘本生成  │
│  ✓ L1-L2故事(50)      ✓ Buddy初级形态      ✓ 守护者卷轴          ✓ 云端排名    │
│  ✓ 基础阅读器         ✓ Quiz练习系统       ✓ 二维码同步          ✓ 社区内容    │
│  ✓ TTS高亮发音        ✓ 影子跟读           ✓ 证书导出            ✓ 多端同步    │
│                                                                            │
│  ▓▓▓▓▓▓▓▓▓▓          ▓▓▓▓▓▓▓▓▓▓          ▓▓▓▓▓▓▓▓▓▓           ░░░░░░░░░░  │
│  MVP 可用              核心体验              完整闭环              扩展增强    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 人力资源估算

| 角色 | P0 | P1 | P2 | P3 |
|------|----|----|----|----|
| 前端开发 | 1人 | 1人 | 1人 | 2人 |
| UI/UX 设计 | 0.5人 | 0.5人 | 0.5人 | 0.5人 |
| 内容制作 | 0.5人 | 1人 | 1人 | 1人 |
| 测试 | 0.5人 | 0.5人 | 1人 | 1人 |

### 1.3 里程碑定义

| 里程碑 | 时间节点 | 关键交付物 | 验收标准 |
|--------|----------|------------|----------|
| M1 | Week 2 | PWA 基础框架 | 可离线访问，Service Worker 生效 |
| M2 | Week 4 | 阅读器 MVP | 完成 10 个 L1 故事的阅读流程 |
| M3 | Week 6 | 地图系统 | 完成 L1 区域 20 个节点的探索 |
| M4 | Week 8 | Quiz 系统 | 3 种题型可用，数据正确存储 |
| M5 | Week 10 | Buddy 系统 | 4 级进化完整，动画流畅 |
| M6 | Week 12 | 完整闭环 | 全流程可跑通，二维码同步可用 |

---

## 2. P0 阶段：骨架建设

**时间周期**：Week 1 - Week 4 (4周)
**核心目标**：搭建可运行的 MVP，验证离线架构可行性

### 2.1 Week 1：项目初始化与基础架构

#### Sprint 目标
建立项目骨架，完成开发环境和核心技术栈的配置。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P0-1-01 | 创建 Vite + React + TypeScript 项目 | P0 | 2h | - | 项目骨架 |
| P0-1-02 | 配置 PWA 插件和 manifest.json | P0 | 3h | P0-1-01 | PWA 配置 |
| P0-1-03 | 配置 Service Worker 基础缓存策略 | P0 | 4h | P0-1-02 | sw.ts |
| P0-1-04 | 初始化 Dexie.js 数据库结构 | P0 | 4h | P0-1-01 | db/index.ts |
| P0-1-05 | 创建数据库表结构和索引 | P0 | 4h | P0-1-04 | 数据模型 |
| P0-1-06 | 配置 ESLint + Prettier | P1 | 2h | P0-1-01 | 代码规范 |
| P0-1-07 | 创建基础目录结构 | P1 | 2h | P0-1-01 | 目录规范 |
| P0-1-08 | 配置 Zustand 状态管理 | P1 | 2h | P0-1-01 | stores/ |
| P0-1-09 | 创建基础路由配置 | P1 | 2h | P0-1-01 | router.tsx |
| P0-1-10 | 编写 README 和开发文档 | P2 | 2h | - | 文档 |

#### 技术细节

**P0-1-01: 项目初始化**
```bash
# 创建项目
pnpm create vite magic-english-buddy --template react-ts

# 安装核心依赖
pnpm add react-router-dom zustand dexie dexie-react-hooks

# 安装 PWA 依赖
pnpm add -D vite-plugin-pwa workbox-precaching workbox-routing
```

**P0-1-04: 数据库初始化**
```typescript
// db/index.ts
import Dexie from 'dexie';

export const db = new Dexie('MagicEnglishBuddy');

db.version(1).stores({
  users: 'id, name, createdAt',
  userProgress: 'id, level, magicPower',
  stories: 'id, level, regionId',
  dictionary: 'word, level',
  userVocabulary: 'id, [userId+word], masteryLevel',
  readingHistory: 'id, userId, storyId',
  quizHistory: 'id, userId, storyId',
  mapNodes: 'id, regionId, type',
  mapRegions: 'id, level'
});
```

#### 验收标准
- [ ] `pnpm dev` 可正常启动
- [ ] `pnpm build` 生成的产物可离线访问
- [ ] IndexedDB 数据表创建成功
- [ ] 基础路由跳转正常

---

### 2.2 Week 2：通用组件与数据初始化

#### Sprint 目标
完成通用 UI 组件库，实现数据初始化流程。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P0-2-01 | 设计 Design Token (颜色/字体/间距) | P0 | 4h | - | tokens.css |
| P0-2-02 | 实现 Button 组件 | P0 | 2h | P0-2-01 | Button/ |
| P0-2-03 | 实现 Modal 组件 | P0 | 3h | P0-2-01 | Modal/ |
| P0-2-04 | 实现 Loading 组件 | P0 | 2h | P0-2-01 | Loading/ |
| P0-2-05 | 实现 Toast 组件 | P1 | 3h | P0-2-01 | Toast/ |
| P0-2-06 | 实现 Icon 图标系统 | P1 | 3h | - | Icon/ |
| P0-2-07 | 编写 L1 故事数据 (10 个) | P0 | 8h | - | stories_l1.json |
| P0-2-08 | 导入基础词典数据 (1000 词) | P0 | 4h | - | dictionary.json |
| P0-2-09 | 实现数据初始化服务 | P0 | 4h | P0-2-07,08 | dataInitializer.ts |
| P0-2-10 | 创建首次启动检测逻辑 | P1 | 2h | P0-2-09 | 首次启动流程 |

#### 技术细节

**P0-2-01: Design Token**
```css
/* styles/tokens.css */
:root {
  /* 主题色 - 魔法风格 */
  --color-primary: #6B5CE7;        /* 魔法紫 */
  --color-secondary: #FF6B9D;      /* 魔力粉 */
  --color-accent: #FFE066;         /* 高亮金 */
  --color-success: #4ECDC4;        /* 成功青 */
  --color-warning: #FF8B4D;        /* 警告橙 */
  --color-error: #FF5757;          /* 错误红 */
  
  /* 背景色 */
  --bg-primary: #1A1A2E;           /* 深夜蓝 */
  --bg-secondary: #16213E;         /* 暗蓝 */
  --bg-card: #FFFFFF;              /* 卡片白 */
  
  /* 文字色 */
  --text-primary: #1A1A2E;
  --text-secondary: #6B7280;
  --text-light: #FFFFFF;
  
  /* 字体 */
  --font-display: 'Nunito', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-reading: 'Literata', serif;
  
  /* 字号 */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  
  /* 间距 */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  
  /* 圆角 */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-glow: 0 0 20px rgba(107,92,231,0.3);
}
```

**P0-2-07: 故事数据格式**
```json
// data/stories/l1/story_001.json
{
  "id": "l1_001",
  "level": 1,
  "regionId": "region_forest",
  "title": "The Magic Apple",
  "titleCn": "魔法苹果",
  "coverImage": "/images/stories/l1_001_cover.webp",
  "audioFile": "/audio/stories/l1_001.mp3",
  "content": [
    {
      "paragraphId": "p1",
      "text": "Once upon a time, there was a red apple.",
      "translation": "从前，有一个红苹果。",
      "audioStart": 0,
      "audioEnd": 3500,
      "words": [
        { "word": "Once", "start": 0, "end": 400, "index": 0 },
        { "word": "upon", "start": 400, "end": 700, "index": 1 },
        { "word": "a", "start": 700, "end": 900, "index": 2 },
        { "word": "time", "start": 900, "end": 1300, "index": 3 },
        { "word": "there", "start": 1500, "end": 1800, "index": 4 },
        { "word": "was", "start": 1800, "end": 2100, "index": 5 },
        { "word": "a", "start": 2100, "end": 2300, "index": 6 },
        { "word": "red", "start": 2300, "end": 2700, "index": 7 },
        { "word": "apple", "start": 2700, "end": 3500, "index": 8 }
      ]
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "type": "image_choice",
      "question": "What color is the apple?",
      "audioQuestion": "/audio/quiz/l1_001_q1.mp3",
      "options": [
        { "image": "/images/quiz/red.webp", "value": "red" },
        { "image": "/images/quiz/blue.webp", "value": "blue" },
        { "image": "/images/quiz/green.webp", "value": "green" }
      ],
      "correct": "red"
    }
  ],
  "rewards": {
    "magicPower": 15,
    "cards": ["word_apple", "word_red"]
  },
  "metadata": {
    "wordCount": 12,
    "estimatedTime": 2,
    "difficulty": 1
  }
}
```

#### 验收标准
- [ ] Design Token 覆盖主要视觉元素
- [ ] Button/Modal/Loading/Toast 组件可复用
- [ ] 10 个 L1 故事数据完整
- [ ] 首次启动可自动导入数据

---

### 2.3 Week 3：阅读器核心功能

#### Sprint 目标
完成阅读器的核心阅读体验，包括 TTS 和高亮同步。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P0-3-01 | 实现 TTS Service | P0 | 6h | - | ttsService.ts |
| P0-3-02 | 实现 WordHighlight 组件 | P0 | 6h | P0-3-01 | WordHighlight/ |
| P0-3-03 | 实现 StoryContent 组件 | P0 | 4h | P0-3-02 | StoryContent/ |
| P0-3-04 | 实现阅读器控制栏 | P0 | 4h | P0-3-03 | ControlBar/ |
| P0-3-05 | 实现字典查询服务 | P0 | 4h | - | dictionaryService.ts |
| P0-3-06 | 实现 DictionaryPopup 组件 | P0 | 4h | P0-3-05 | DictionaryPopup/ |
| P0-3-07 | 实现语速控制 (0.8x/1.0x/1.2x) | P1 | 2h | P0-3-01 | 语速功能 |
| P0-3-08 | 实现单词点击发音 | P1 | 2h | P0-3-01 | 单词发音 |
| P0-3-09 | 创建 ReaderPage 页面 | P0 | 4h | P0-3-01~06 | ReaderPage/ |
| P0-3-10 | 实现阅读进度保存 | P1 | 3h | P0-3-09 | 进度存储 |

#### 技术细节

**P0-3-02: WordHighlight 实现要点**
```typescript
// 核心逻辑：TTS onBoundary 事件与单词高亮同步
const handleTTSBoundary = (charIndex: number, word: string) => {
  // 根据字符索引找到对应的单词索引
  const wordIndex = findWordIndexByCharIndex(charIndex, content);
  setActiveWordIndex(wordIndex);
};

// CSS 高亮样式
.word {
  display: inline;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.word.active {
  background-color: var(--color-accent);
  transform: scale(1.05);
}

.word:not(.active) {
  opacity: 0.7;
}
```

**P0-3-06: DictionaryPopup 设计**
```
┌─────────────────────────────┐
│  🍎 apple                   │
│  /ˈæp.əl/  [🔊]             │
│  ─────────────────────────  │
│  n. 苹果                    │
│                             │
│  例句:                       │
│  I like red apples.         │
│  我喜欢红苹果。              │
└─────────────────────────────┘
```

#### 验收标准
- [ ] TTS 播放与单词高亮精确同步
- [ ] 点击单词可发音
- [ ] 长按单词弹出字典
- [ ] 支持 0.8x/1.0x/1.2x 语速切换
- [ ] 阅读进度可保存恢复

---

### 2.4 Week 4：新手引导与整合

#### Sprint 目标
完成新手引导流程，整合 P0 所有功能，准备 MVP 发布。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P0-4-01 | 实现引导页背景动画 | P0 | 4h | - | WelcomeScreen/ |
| P0-4-02 | 实现蛋壳破碎动画 | P0 | 6h | - | EggAnimation/ |
| P0-4-03 | 实现麦克风长按交互 | P0 | 4h | P0-4-02 | 语音唤醒 |
| P0-4-04 | 实现 Buddy 起名流程 | P0 | 3h | P0-4-03 | NameInput/ |
| P0-4-05 | 创建 OnboardingPage | P0 | 4h | P0-4-01~04 | OnboardingPage/ |
| P0-4-06 | 实现简易故事列表页 (临时) | P1 | 4h | - | StoryListPage/ |
| P0-4-07 | 端到端流程测试 | P0 | 4h | 全部 | 测试报告 |
| P0-4-08 | 离线功能测试 | P0 | 3h | 全部 | 测试报告 |
| P0-4-09 | 低端设备性能测试 | P1 | 3h | 全部 | 性能报告 |
| P0-4-10 | Bug 修复与优化 | P0 | 8h | P0-4-07~09 | Bug 修复 |

#### 技术细节

**P0-4-02: 蛋壳破碎动画方案**
```typescript
// 使用 Lottie 实现
// 动画阶段：idle -> crack -> hatch -> reveal

const eggAnimationStates = {
  IDLE: '/animations/egg_idle.json',      // 轻微晃动
  CRACK: '/animations/egg_crack.json',    // 裂纹出现
  HATCH: '/animations/egg_hatch.json',    // 蛋壳破碎
  REVEAL: '/animations/buddy_reveal.json' // Buddy 出现
};

// 交互流程
const handleLongPress = async () => {
  // 1. 震动反馈
  navigator.vibrate?.([100, 50, 100, 50, 200]);
  
  // 2. 播放裂纹动画
  setAnimationState('CRACK');
  await delay(1500);
  
  // 3. 播放破碎动画
  setAnimationState('HATCH');
  await delay(2000);
  
  // 4. Buddy 登场
  setAnimationState('REVEAL');
  await delay(1500);
  
  // 5. 进入起名流程
  setShowNameInput(true);
};
```

#### P0 阶段交付物清单

| 类别 | 交付物 | 说明 |
|------|--------|------|
| 代码 | PWA 应用框架 | 可离线运行 |
| 代码 | 新手引导页 | 蛋壳动画 + 起名 |
| 代码 | 阅读器页面 | TTS + 高亮 + 查词 |
| 代码 | 故事列表页 | 临时列表展示 |
| 数据 | 10 个 L1 故事 | 完整 JSON 格式 |
| 数据 | 1000 词基础词典 | 含音标、释义、emoji |
| 文档 | 测试报告 | 功能/离线/性能 |

---

## 3. P1 阶段：趣味赋能

**时间周期**：Week 5 - Week 8 (4周)
**核心目标**：构建游戏化体验，让学习变得有趣

### 3.1 Week 5：魔法地图基础

#### Sprint 目标
实现可交互的迷雾地图和节点系统。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P1-5-01 | 设计 L1 萌芽之森地图 | P0 | 6h | - | 地图设计稿 |
| P1-5-02 | 实现 MapCanvas 组件 | P0 | 8h | P1-5-01 | MapCanvas/ |
| P1-5-03 | 实现 MapNode 组件 | P0 | 4h | P1-5-02 | MapNode/ |
| P1-5-04 | 实现迷雾遮罩效果 | P0 | 4h | P1-5-02 | FogOverlay/ |
| P1-5-05 | 实现节点点击预览 | P0 | 4h | P1-5-03 | NodePreviewModal/ |
| P1-5-06 | 实现地图滑动交互 | P1 | 4h | P1-5-02 | 手势控制 |
| P1-5-07 | 创建 L1 区域 20 个节点数据 | P0 | 4h | - | mapNodes.json |
| P1-5-08 | 实现节点解锁逻辑 | P0 | 4h | P1-5-07 | 解锁系统 |
| P1-5-09 | 创建 MapPage 页面 | P0 | 4h | P1-5-01~08 | MapPage/ |
| P1-5-10 | 实现当前节点光圈动画 | P1 | 2h | P1-5-03 | 动画效果 |

#### 技术细节

**P1-5-02: 地图渲染方案**
```typescript
// 使用 Canvas 或 SVG 渲染地图
// 推荐 SVG 以获得更好的交互性

interface MapCanvasProps {
  regionId: string;
  nodes: MapNode[];
  unlockedNodes: string[];
  currentNode: string;
  onNodeClick: (nodeId: string) => void;
}

// 地图层级结构
<svg className={styles.mapCanvas}>
  {/* 1. 背景层 - 区域主题背景 */}
  <image href={backgroundImage} />
  
  {/* 2. 迷雾层 - 未解锁区域覆盖 */}
  <FogOverlay unlockedNodes={unlockedNodes} />
  
  {/* 3. 路径层 - 节点连接线 */}
  <g className="paths">
    {paths.map(path => <path key={path.id} d={path.d} />)}
  </g>
  
  {/* 4. 节点层 - 可交互节点 */}
  <g className="nodes">
    {nodes.map(node => (
      <MapNode 
        key={node.id}
        node={node}
        isUnlocked={unlockedNodes.includes(node.id)}
        isCurrent={node.id === currentNode}
        onClick={() => onNodeClick(node.id)}
      />
    ))}
  </g>
</svg>
```

**P1-5-04: 迷雾效果实现**
```css
/* 使用 CSS filter 实现迷雾 */
.fog-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.9) 0%,
    rgba(26, 26, 46, 0.7) 100%
  );
  backdrop-filter: blur(8px) grayscale(100%);
  mask-image: url('/images/fog-mask.svg');
  pointer-events: none;
  transition: opacity 0.5s ease;
}

/* 解锁区域渐变消散 */
.fog-overlay.clearing {
  animation: fogClear 1.5s ease-out forwards;
}

@keyframes fogClear {
  0% { opacity: 1; }
  50% { opacity: 0.5; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.2); }
}
```

---

### 3.2 Week 6：Quiz 练习系统

#### Sprint 目标
实现多种题型的练习系统，支持即时反馈。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P1-6-01 | 实现 QuizContainer 容器 | P0 | 4h | - | QuizContainer/ |
| P1-6-02 | 实现听音辨图题型 | P0 | 6h | P1-6-01 | ImageChoice/ |
| P1-6-03 | 实现单词拼装题型 | P0 | 6h | P1-6-01 | WordBuilder/ |
| P1-6-04 | 实现句子排序题型 | P0 | 8h | P1-6-01 | DragAndDrop/ |
| P1-6-05 | 实现进度指示器 | P0 | 3h | P1-6-01 | ProgressIndicator/ |
| P1-6-06 | 实现正确/错误反馈动画 | P0 | 4h | - | FeedbackAnimation/ |
| P1-6-07 | 实现 Quiz 结果统计 | P1 | 3h | P1-6-01 | 结果统计 |
| P1-6-08 | 实现提示功能 (-5 MP) | P1 | 2h | P1-6-01 | 提示系统 |
| P1-6-09 | 创建 QuizPage 页面 | P0 | 4h | P1-6-01~08 | QuizPage/ |
| P1-6-10 | Quiz 数据存储 | P0 | 3h | P1-6-09 | 数据持久化 |

#### 技术细节

**P1-6-02: 听音辨图题型**
```typescript
interface ImageChoiceProps {
  question: string;
  audioQuestion?: string;  // 语音题目
  options: { image: string; value: string }[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

// 交互流程
// 1. 自动播放语音题目
// 2. 显示 3 个图片选项
// 3. 点击选择，即时反馈
// 4. 正确：绿色边框 + 星星特效
// 5. 错误：红色闪烁 + 显示正确答案
```

**P1-6-04: 句子排序实现**
```typescript
// 使用 @dnd-kit 实现拖拽排序
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';

// 核心体验要点：
// 1. 拖拽时有轻微放大效果
// 2. 放置时有"吸附"感
// 3. 错误时弹回原位（橡皮筋效果）
// 4. 正确时锁定不可再移动
```

---

### 3.3 Week 7：Buddy 系统与影子跟读

#### Sprint 目标
实现 Buddy 养成系统和影子跟读功能。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P1-7-01 | 实现 BuddyService | P0 | 4h | - | buddyService.ts |
| P1-7-02 | 实现 BuddyAvatar 组件 | P0 | 4h | P1-7-01 | BuddyAvatar/ |
| P1-7-03 | 实现 Buddy 心情系统 | P0 | 3h | P1-7-01 | 心情逻辑 |
| P1-7-04 | 制作 4 阶段 Buddy 动画 | P0 | 8h | - | Lottie 动画 |
| P1-7-05 | 实现 AudioRecorderService | P0 | 6h | - | audioRecorderService.ts |
| P1-7-06 | 实现 ShadowingRecorder 组件 | P0 | 6h | P1-7-05 | ShadowingRecorder/ |
| P1-7-07 | 实现波形对比展示 | P1 | 4h | P1-7-05 | WaveformDisplay/ |
| P1-7-08 | 实现双声轨回放 | P1 | 3h | P1-7-06 | 对比播放 |
| P1-7-09 | 实现 Echo 模式 | P0 | 4h | P1-7-06 | Echo 模式 |
| P1-7-10 | 整合 Buddy 到阅读器 | P0 | 3h | P1-7-02 | 阅读器集成 |

#### 技术细节

**P1-7-04: Buddy 动画规格**
```
阶段 I - 语言之卵
├── egg_idle.json      (2s 循环, <50KB)
├── egg_wiggle.json    (1s 单次)
├── egg_crack.json     (2s 单次)
└── egg_happy.json     (1.5s 循环)

阶段 II - 萌芽幼兽
├── baby_idle.json     (3s 循环)
├── baby_jump.json     (0.8s 单次)
├── baby_dance.json    (2s 循环)
└── baby_cry.json      (2s 循环)

阶段 III - 守护精灵
├── spirit_idle.json   (4s 循环)
├── spirit_float.json  (3s 循环)
├── spirit_sparkle.json (1.5s 单次)
└── spirit_dim.json    (2s 循环)

阶段 IV - 博学贤者
├── sage_idle.json     (5s 循环)
├── sage_smile.json    (2s 单次)
├── sage_magic.json    (3s 单次)
└── sage_sleep.json    (4s 循环)
```

**P1-7-06: 影子跟读流程**
```
┌─────────────────────────────────────────┐
│                Echo Mode                 │
├─────────────────────────────────────────┤
│                                         │
│  "Once upon a time..."                  │
│  ─────────────────────                  │
│  [🔊 Listen]  ──→  [🎤 Your Turn]       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ▁▃▅▇█▇▅▃▁▃▅▇ (原声波形)        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  ▁▂▄▆█▆▄▂▁▂▄▆ (你的声音)        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [🔄 Retry]        [✓ Next Sentence]    │
│                                         │
└─────────────────────────────────────────┘
```

---

### 3.4 Week 8：状态管理与整合

#### Sprint 目标
实现完整的状态管理，整合 P1 所有功能。

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P1-8-01 | 实现 XState 主状态机 | P0 | 8h | - | appMachine.ts |
| P1-8-02 | 实现 Reading 子状态机 | P0 | 4h | P1-8-01 | 阅读状态 |
| P1-8-03 | 实现 Quiz 子状态机 | P0 | 4h | P1-8-01 | Quiz 状态 |
| P1-8-04 | 实现奖励展示页 | P0 | 4h | - | RewardModal/ |
| P1-8-05 | 实现进化仪式动画 | P1 | 6h | - | EvolutionModal/ |
| P1-8-06 | 实现地图节点解锁动画 | P1 | 4h | - | 解锁动画 |
| P1-8-07 | 补充 L1 故事至 30 个 | P0 | 8h | - | 故事数据 |
| P1-8-08 | 端到端流程测试 | P0 | 4h | 全部 | 测试报告 |
| P1-8-09 | 性能优化 | P1 | 4h | 全部 | 优化报告 |
| P1-8-10 | Bug 修复 | P0 | 6h | P1-8-08 | Bug 修复 |

#### P1 阶段交付物清单

| 类别 | 交付物 | 说明 |
|------|--------|------|
| 代码 | 魔法地图系统 | L1 区域完整可玩 |
| 代码 | Quiz 系统 | 3 种题型 |
| 代码 | Buddy 系统 | 4 阶段形态 |
| 代码 | 影子跟读 | Echo 模式 + 波形对比 |
| 代码 | XState 状态机 | 完整流程控制 |
| 数据 | 30 个 L1 故事 | 完整 Quiz |
| 动画 | Buddy 动画包 | 16 个 Lottie 文件 |

---

## 4. P2 阶段：激励完善

**时间周期**：Week 9 - Week 12 (4周)
**核心目标**：完善激励系统，实现数据同步闭环

### 4.1 Week 9：卡牌收集系统

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P2-9-01 | 设计卡牌视觉风格 | P0 | 6h | - | 设计稿 |
| P2-9-02 | 实现卡牌数据模型 | P0 | 3h | - | 数据结构 |
| P2-9-03 | 实现卡牌生成逻辑 | P0 | 4h | P2-9-02 | 生成服务 |
| P2-9-04 | 实现 WordCard 组件 | P0 | 6h | P2-9-01 | WordCard/ |
| P2-9-05 | 实现稀有度动画 | P0 | 4h | P2-9-04 | 稀有度特效 |
| P2-9-06 | 实现图鉴页面 | P0 | 6h | P2-9-04 | GrimoirePage/ |
| P2-9-07 | 实现收集进度统计 | P1 | 3h | P2-9-06 | 进度统计 |
| P2-9-08 | 实现卡牌获取动画 | P1 | 4h | - | 获取动画 |
| P2-9-09 | 整合到奖励流程 | P0 | 3h | P2-9-08 | 流程集成 |
| P2-9-10 | 数据持久化测试 | P0 | 2h | P2-9-09 | 测试 |

#### 技术细节

**卡牌稀有度设计**
```typescript
type CardRarity = 'white' | 'green' | 'blue' | 'gold';

const RARITY_CONFIG = {
  white: {
    name: '普通',
    border: '#E5E7EB',
    glow: 'none',
    animation: 'none'
  },
  green: {
    name: '稀有',
    border: '#10B981',
    glow: '0 0 10px #10B981',
    animation: 'pulse'
  },
  blue: {
    name: '史诗',
    border: '#3B82F6',
    glow: '0 0 15px #3B82F6',
    animation: 'shimmer'
  },
  gold: {
    name: '传说',
    border: '#F59E0B',
    glow: '0 0 20px #F59E0B',
    animation: 'legendary'
  }
};

// 稀有度判定规则
const determineRarity = (consecutiveCorrect: number): CardRarity => {
  if (consecutiveCorrect >= 10) return 'gold';
  if (consecutiveCorrect >= 7) return 'blue';
  if (consecutiveCorrect >= 4) return 'green';
  return 'white';
};
```

---

### 4.2 Week 10：成就与勋章系统

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P2-10-01 | 设计成就体系 | P0 | 4h | - | 成就列表 |
| P2-10-02 | 实现成就数据模型 | P0 | 3h | P2-10-01 | 数据结构 |
| P2-10-03 | 实现成就检测服务 | P0 | 6h | P2-10-02 | achievementService.ts |
| P2-10-04 | 实现勋章组件 | P0 | 4h | - | BadgeCard/ |
| P2-10-05 | 实现成就解锁通知 | P0 | 4h | P2-10-04 | 通知组件 |
| P2-10-06 | 实现成就页面 | P0 | 4h | P2-10-04 | AchievementPage/ |
| P2-10-07 | 设计勋章图标 (20个) | P1 | 6h | - | 勋章资源 |
| P2-10-08 | 实现连续学习奖励 | P1 | 3h | P2-10-03 | 连续奖励 |
| P2-10-09 | 整合到主流程 | P0 | 3h | P2-10-05 | 流程集成 |
| P2-10-10 | 测试成就触发 | P0 | 2h | P2-10-09 | 测试 |

#### 成就体系设计

```typescript
const ACHIEVEMENTS = [
  // 阅读类
  { id: 'first_story', name: '初次冒险', desc: '完成第一个故事', icon: '📖' },
  { id: 'reader_10', name: '小书虫', desc: '阅读10个故事', icon: '🐛' },
  { id: 'reader_50', name: '书籍探险家', desc: '阅读50个故事', icon: '🗺️' },
  
  // 词汇类
  { id: 'word_100', name: '词汇新星', desc: '学习100个单词', icon: '⭐' },
  { id: 'word_500', name: '词汇大师', desc: '学习500个单词', icon: '🏆' },
  
  // Quiz类
  { id: 'quiz_perfect', name: '完美答题', desc: '一次Quiz全对', icon: '💯' },
  { id: 'quiz_streak_5', name: '五连胜', desc: '连续5次Quiz满分', icon: '🔥' },
  
  // Buddy类
  { id: 'buddy_evolve_2', name: '伙伴成长', desc: 'Buddy进化到形态II', icon: '🥚' },
  { id: 'buddy_evolve_4', name: '终极伙伴', desc: 'Buddy进化到形态IV', icon: '🧙' },
  
  // 坚持类
  { id: 'streak_7', name: '一周坚持', desc: '连续学习7天', icon: '📅' },
  { id: 'streak_30', name: '月度勇士', desc: '连续学习30天', icon: '🗓️' },
  
  // 探索类
  { id: 'region_l1', name: '森林守护者', desc: '完成萌芽之森', icon: '🌲' },
  { id: 'all_cards_l1', name: '收藏家', desc: '收集L1所有卡牌', icon: '🎴' }
];
```

---

### 4.3 Week 11：守护者卷轴与二维码

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P2-11-01 | 实现 QRSyncService | P0 | 6h | - | qrSyncService.ts |
| P2-11-02 | 实现数据压缩编码 | P0 | 4h | P2-11-01 | 编码逻辑 |
| P2-11-03 | 实现 QRCodeDisplay | P0 | 4h | P2-11-01 | QRCodeDisplay/ |
| P2-11-04 | 实现 ProgressCard 组件 | P0 | 4h | - | ProgressCard/ |
| P2-11-05 | 实现证书模板设计 | P0 | 6h | - | 证书模板 |
| P2-11-06 | 实现 html2canvas 导出 | P0 | 4h | P2-11-05 | 图片导出 |
| P2-11-07 | 创建 ScrollPage 页面 | P0 | 6h | P2-11-03~06 | ScrollPage/ |
| P2-11-08 | 实现数据可视化展示 | P1 | 4h | P2-11-04 | 数据图表 |
| P2-11-09 | 测试二维码容量 | P0 | 2h | P2-11-02 | 容量测试 |
| P2-11-10 | 测试图片保存 | P0 | 2h | P2-11-06 | 保存测试 |

#### 技术细节

**二维码数据压缩方案**
```typescript
// 数据结构优化 - 最小化 JSON 键名
const compactData = {
  v: 1,                    // version
  u: 'abc12345',           // userId (8位)
  t: 1703520000,           // timestamp
  p: [3, 1250, 42, 520, 300, 7], // [level, mp, stories, words, time, streak]
  a: ['fs', 'r10', 'qp'],  // achievements (缩写)
  c: 'a1b2c3d4'            // checksum
};

// Base64 编码后约 150-200 字符
// 标准二维码 Version 6 可容纳 214 个字符
```

**证书模板设计**
```
┌───────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════╗   │
│  ║         ✨ CERTIFICATE OF ACHIEVEMENT ✨       ║   │
│  ╠═══════════════════════════════════════════════╣   │
│  ║                                               ║   │
│  ║   This certifies that                         ║   │
│  ║                                               ║   │
│  ║        🧙 [小明 & Buddy Name] 🧙              ║   │
│  ║                                               ║   │
│  ║   has achieved                                ║   │
│  ║                                               ║   │
│  ║        Level 3: 元素使者                       ║   │
│  ║                                               ║   │
│  ║   📚 Stories: 42    📝 Words: 520            ║   │
│  ║   ⏱️ Time: 5h 20m   🔥 Streak: 7 days        ║   │
│  ║                                               ║   │
│  ║   Date: 2024-01-15                           ║   │
│  ║                                               ║   │
│  ╚═══════════════════════════════════════════════╝   │
│                                                       │
│  [Buddy Avatar]                      [Magic Seal]     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

### 4.4 Week 12：L2 内容扩展与收尾

#### 任务分解

| 任务 ID | 任务描述 | 优先级 | 预估工时 | 依赖 | 产出物 |
|---------|----------|--------|----------|------|--------|
| P2-12-01 | 设计 L2 回声山谷地图 | P0 | 6h | - | 地图设计 |
| P2-12-02 | 创建 L2 区域节点数据 | P0 | 4h | P2-12-01 | 节点数据 |
| P2-12-03 | 编写 20 个 L2 故事 | P0 | 12h | - | 故事数据 |
| P2-12-04 | 实现等级解锁逻辑 | P0 | 4h | - | 解锁逻辑 |
| P2-12-05 | 实现填空题型 | P0 | 6h | - | FillBlank/ |
| P2-12-06 | 全流程端到端测试 | P0 | 6h | 全部 | 测试报告 |
| P2-12-07 | 离线完整性测试 | P0 | 4h | 全部 | 离线报告 |
| P2-12-08 | 性能优化调优 | P1 | 4h | 全部 | 优化报告 |
| P2-12-09 | Bug 修复冲刺 | P0 | 8h | P2-12-06~08 | Bug 修复 |
| P2-12-10 | 文档完善 | P1 | 4h | 全部 | 完整文档 |

#### P2 阶段交付物清单

| 类别 | 交付物 | 说明 |
|------|--------|------|
| 代码 | 卡牌收集系统 | 4 种稀有度 |
| 代码 | 成就勋章系统 | 20+ 成就 |
| 代码 | 守护者卷轴 | 二维码同步 + 证书 |
| 代码 | L2 区域地图 | 回声山谷 |
| 代码 | 填空题型 | 新增题型 |
| 数据 | 20 个 L2 故事 | 完整 Quiz |
| 文档 | 完整使用文档 | 用户手册 |

---

## 5. P3 阶段：联网扩充

**时间周期**：Week 13+ (持续迭代)
**核心目标**：接入云端能力，扩展内容生态

### 5.1 AI 语音打分 (需联网)

```typescript
// 使用 Azure Speech 或 Google Speech-to-Text
// 提供发音准确度评分

interface PronunciationResult {
  accuracy: number;        // 准确度 0-100
  fluency: number;         // 流利度 0-100
  completeness: number;    // 完整度 0-100
  pronunciation: number;   // 发音得分 0-100
  words: WordScore[];      // 逐词评分
}

// 离线降级：使用本地波形对比作为替代
```

### 5.2 AI 绘本生成

```typescript
// 使用 GPT-4 生成故事内容
// 使用 DALL-E / Stable Diffusion 生成插图

interface StoryGenerationRequest {
  level: number;
  theme: string;
  wordCount: number;
  targetVocabulary: string[];  // 必须包含的词汇
}

// 生成后缓存到本地供离线使用
```

### 5.3 云端排名系统

```typescript
// 可选功能：联网时同步排名数据
// 本地保持完整学习数据，排名仅作为社交激励

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  magicPower: number;
  region: string;  // 可选：区域排名
}
```

### 5.4 社区内容贡献

```typescript
// 基于 GitHub / 内容管理后台
// 志愿者可通过 JSON 模板贡献故事内容

// 内容审核流程
// 1. 志愿者提交 JSON
// 2. 内容审核团队校验
// 3. 合并到主内容库
// 4. 用户设备更新获取
```

---

## 6. 风险评估与应对

### 6.1 技术风险

| 风险 | 影响 | 概率 | 应对策略 |
|------|------|------|----------|
| TTS 离线不可用 | 核心功能缺失 | 中 | 预制部分高频音频，降级显示文本 |
| IndexedDB 存储限制 | 数据丢失 | 低 | 实现数据压缩，提示用户清理 |
| 低端设备性能差 | 用户体验差 | 高 | 动画降级，禁用复杂特效 |
| 浏览器兼容性 | 功能不可用 | 中 | 功能检测 + 优雅降级 |

### 6.2 内容风险

| 风险 | 影响 | 概率 | 应对策略 |
|------|------|------|----------|
| 故事内容不足 | 用户流失 | 中 | 提前储备内容，招募志愿者 |
| 难度分级不准确 | 学习效果差 | 中 | 用户反馈机制，动态调整 |
| 词典覆盖不全 | 查词失败 | 低 | 扩充词典，显示"未收录"提示 |

### 6.3 用户风险

| 风险 | 影响 | 概率 | 应对策略 |
|------|------|------|----------|
| 用户不会操作 | 无法上手 | 中 | 完善新手引导，增加提示 |
| 数据意外丢失 | 用户流失 | 低 | 定期提示备份，二维码导出 |
| 长期无新内容 | 兴趣下降 | 高 | 成就系统，复习系统 |

---

## 7. 质量保障

### 7.1 测试策略

```
┌────────────────────────────────────────────────────────┐
│                     测试金字塔                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│                    ╱╲   E2E Tests                      │
│                   ╱  ╲  (Playwright)                   │
│                  ╱────╲                                │
│                 ╱      ╲                               │
│                ╱ Integr. ╲  Integration Tests          │
│               ╱   Tests   ╲ (React Testing Library)   │
│              ╱─────────────╲                           │
│             ╱               ╲                          │
│            ╱   Unit Tests    ╲  Unit Tests             │
│           ╱    (Vitest)       ╲ (Services, Hooks)     │
│          ╱─────────────────────╲                       │
│                                                        │
│  比例建议：Unit 70% / Integration 20% / E2E 10%        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 7.2 测试检查清单

#### 功能测试
- [ ] 新手引导完整流程
- [ ] 阅读器 TTS 播放与高亮同步
- [ ] 单词点击发音
- [ ] 长按查词弹窗
- [ ] Quiz 各题型交互
- [ ] Buddy 进化流程
- [ ] 地图节点解锁
- [ ] 二维码生成与数据完整性
- [ ] 证书图片导出

#### 离线测试
- [ ] 首次离线访问
- [ ] 断网后恢复
- [ ] 离线阅读完整故事
- [ ] 离线完成 Quiz
- [ ] 离线查词
- [ ] 离线生成二维码

#### 性能测试
- [ ] 首屏加载时间 < 3s
- [ ] 页面切换响应 < 300ms
- [ ] 动画帧率 > 30fps
- [ ] 内存占用 < 200MB

#### 兼容性测试
- [ ] Chrome 80+
- [ ] Safari 14+
- [ ] Firefox 80+
- [ ] Android WebView
- [ ] 低端设备 (2GB RAM)

### 7.3 代码质量标准

```typescript
// ESLint 规则示例
{
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}

// 代码覆盖率要求
// - 总体覆盖率 > 70%
// - 核心服务覆盖率 > 80%
// - UI 组件覆盖率 > 60%
```

---

## 附录

### A. 开发环境配置

```bash
# 1. 克隆项目
git clone <repo-url>
cd magic-english-buddy

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 构建生产版本
pnpm build

# 5. 预览生产版本
pnpm preview

# 6. 运行测试
pnpm test

# 7. 运行 E2E 测试
pnpm test:e2e
```

### B. 提交规范

```
# Commit Message 格式
<type>(<scope>): <subject>

# Type 类型
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式
refactor: 重构
perf:     性能优化
test:     测试
chore:    构建/工具

# 示例
feat(reader): 实现单词高亮跟读功能
fix(quiz): 修复拖拽题目答案判断错误
docs(readme): 更新安装说明
```

### C. 分支策略

```
main          ─────●─────●─────●─────●──── (生产分支)
                   │     │     │     │
release/v1.0 ─────●─────┤     │     │
                   │     │     │     │
develop       ────●─●───●─●───●─●───●──── (开发分支)
                   │ │   │ │   │ │
feature/map  ─────●─┤   │ │   │ │
feature/quiz ───────●───┤ │   │ │
feature/buddy ────────────●───┤ │
bugfix/xxx   ──────────────────●─┤
```

### D. 每日站会模板

```markdown
## 日期: YYYY-MM-DD

### 昨日完成
- [ ] 任务1
- [ ] 任务2

### 今日计划
- [ ] 任务1
- [ ] 任务2

### 阻塞问题
- 问题描述
- 需要的支持

### 备注
- 其他信息
```

---

**文档版本**: v1.0
**最后更新**: 2024-01-15
**负责人**: 开发团队


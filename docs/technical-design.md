# Magic English Buddy 技术方案文档

## 目录
1. [技术架构总览](#1-技术架构总览)
2. [技术选型详解](#2-技术选型详解)
3. [数据库设计](#3-数据库设计)
4. [核心模块设计](#4-核心模块设计)
5. [状态管理设计](#5-状态管理设计)
6. [离线策略设计](#6-离线策略设计)
7. [UI组件架构](#7-ui组件架构)
8. [性能优化策略](#8-性能优化策略)
9. [安全与兼容性](#9-安全与兼容性)

---

## 1. 技术架构总览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Magic English Buddy                       │
├─────────────────────────────────────────────────────────────────┤
│                          展示层 (View Layer)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Onboard │ │  Map    │ │ Reader  │ │  Quiz   │ │ Scroll  │   │
│  │  Page   │ │  Page   │ │  Page   │ │  Page   │ │  Page   │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       └──────────┬┴──────────┬┴──────────┬┴──────────┬┘         │
├──────────────────┼───────────┼───────────┼───────────┼──────────┤
│                  │     状态管理层 (State Layer)      │          │
│  ┌───────────────┴───────────────────────────────────┴────────┐ │
│  │                      XState Machine                         │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │ │
│  │  │ User    │  │ Story   │  │ Quiz    │  │ Buddy   │       │ │
│  │  │ State   │  │ State   │  │ State   │  │ State   │       │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                          服务层 (Service Layer)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   TTS    │ │  Audio   │ │Dictionary│ │   QR     │           │
│  │ Service  │ │ Recorder │ │ Service  │ │ Service  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                          数据层 (Data Layer)                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Dexie.js (IndexedDB)                     ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          ││
│  │  │ Stories │ │  User   │ │  Cards  │ │  Dict   │          ││
│  │  │  Table  │ │Progress │ │  Table  │ │  Table  │          ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                          基础设施层 (Infrastructure)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Service Worker│  │   Manifest   │  │  Workbox     │          │
│  │  (Offline)   │  │   (PWA)      │  │  (Caching)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心设计原则

| 原则 | 说明 | 实现方式 |
|------|------|----------|
| **离线优先** | 所有核心功能在断网状态下可用 | Service Worker + IndexedDB |
| **轻量化** | 首屏加载 < 3s，总包体 < 15MB | 代码分割 + 资源压缩 |
| **低端设备友好** | 支持 Android 5.0+，2GB RAM | 渐进增强 + 性能降级 |
| **模块化** | 内容与引擎分离，便于扩展 | JSON 数据协议 + 插件架构 |

---

## 2. 技术选型详解

### 2.1 核心框架

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **React** | 18.x | 生态成熟，社区资源丰富，适合复杂交互 |
| **TypeScript** | 5.x | 类型安全，提高代码可维护性 |
| **Vite** | 5.x | 快速构建，原生 ESM 支持，PWA 插件完善 |

### 2.2 状态管理

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **XState** | 复杂状态流转 | 可视化状态机，适合 Reading→Quiz→Reward 流程 |
| **Zustand** | 简单全局状态 | 轻量级，API 简洁，与 React 集成好 |
| **Immer** | 不可变数据 | 简化复杂状态更新 |

### 2.3 存储方案

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Dexie.js** | IndexedDB 封装 | API 友好，支持事务，查询能力强 |
| **localForage** | 简单 KV 存储 | 多后端支持，降级处理完善 |

### 2.4 PWA 相关

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **vite-plugin-pwa** | PWA 构建 | 自动生成 manifest 和 SW |
| **Workbox** | 缓存策略 | Google 官方，策略丰富 |

### 2.5 UI/动画

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Lottie-react** | 复杂动画 | JSON 格式，体积小，清晰度高 |
| **Framer Motion** | 交互动画 | API 简洁，性能优秀 |
| **dnd-kit** | 拖拽交互 | 触摸友好，无障碍支持 |

### 2.6 其他工具

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **qrcode** | 二维码生成 | 轻量，离线可用 |
| **html2canvas** | 截图保存 | 客户端渲染，无需服务器 |
| **howler.js** | 音频管理 | 跨浏览器兼容，音频精灵支持 |

---

## 3. 数据库设计

### 3.1 数据库表结构

#### 3.1.1 用户表 (users)

```typescript
interface User {
  id: string;                    // UUID
  name: string;                  // 用户昵称
  buddyName: string;             // Buddy 名称
  createdAt: number;             // 创建时间戳
  lastActiveAt: number;          // 最后活跃时间
  settings: UserSettings;        // 用户设置
}

interface UserSettings {
  language: 'zh-CN' | 'en-US';   // 界面语言
  ttsSpeed: 0.8 | 1.0 | 1.2;     // 语速
  soundEnabled: boolean;         // 音效开关
  vibrationEnabled: boolean;     // 震动开关
}
```

#### 3.1.2 用户进度表 (userProgress)

```typescript
interface UserProgress {
  id: string;                    // 关联 userId
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // 当前等级
  magicPower: number;            // 魔力值
  buddyStage: 1 | 2 | 3 | 4;     // Buddy 形态
  totalReadingTime: number;      // 总阅读时长(分钟)
  totalStoriesRead: number;      // 已读故事数
  currentMapNode: string;        // 当前地图节点 ID
  unlockedNodes: string[];       // 已解锁节点 ID 列表
  achievements: string[];        // 成就 ID 列表
  streakDays: number;            // 连续学习天数
  lastStudyDate: string;         // 最后学习日期 YYYY-MM-DD
}
```

#### 3.1.3 故事内容表 (stories)

```typescript
interface Story {
  id: string;                    // story_001
  level: number;                 // 等级 1-7
  regionId: string;              // 所属区域
  title: string;                 // 故事标题
  titleCn: string;               // 中文标题
  coverImage: string;            // 封面图路径
  audioFile: string;             // 音频文件路径
  content: StoryContent[];       // 故事内容
  quiz: QuizItem[];              // 练习题
  rewards: {
    magicPower: number;          // 完成奖励魔力值
    cards: string[];             // 掉落卡牌 ID
  };
  metadata: {
    wordCount: number;           // 词数
    estimatedTime: number;       // 预计阅读时间(分钟)
    difficulty: number;          // 难度系数 1-10
  };
}

interface StoryContent {
  paragraphId: string;
  text: string;                  // 英文原文
  translation: string;           // 中文翻译
  audioStart: number;            // 音频开始时间(ms)
  audioEnd: number;              // 音频结束时间(ms)
  words: WordTiming[];           // 单词时间轴
}

interface WordTiming {
  word: string;
  start: number;                 // 开始时间(ms)
  end: number;                   // 结束时间(ms)
  index: number;                 // 单词索引
}
```

#### 3.1.4 词典表 (dictionary)

```typescript
interface DictionaryEntry {
  word: string;                  // 主键，单词
  phonetic: string;              // 音标
  meaningCn: string;             // 中文释义
  meaningEn: string;             // 英文释义
  partOfSpeech: string;          // 词性
  examples: string[];            // 例句
  emoji?: string;                // 关联 emoji
  imageKey?: string;             // 关联图片 key
  level: number;                 // 词汇等级
  frequency: number;             // 使用频率
}
```

#### 3.1.5 用户词汇表 (userVocabulary)

```typescript
interface UserVocabulary {
  id: string;                    // `${userId}_${word}`
  userId: string;                // 用户 ID
  word: string;                  // 单词
  firstSeen: number;             // 首次遇见时间
  lastReviewed: number;          // 最后复习时间
  correctCount: number;          // 答对次数
  wrongCount: number;            // 答错次数
  masteryLevel: 0 | 1 | 2 | 3;   // 掌握度 0-学习中 1-初步 2-熟练 3-掌握
  nextReviewDate: string;        // 下次复习日期(艾宾浩斯)
  isCard: boolean;               // 是否已转为卡牌
  cardRarity: 'white' | 'green' | 'blue' | 'gold' | null;
}
```

#### 3.1.6 阅读记录表 (readingHistory)

```typescript
interface ReadingRecord {
  id: string;                    // UUID
  userId: string;
  storyId: string;
  startTime: number;             // 开始阅读时间戳
  endTime: number;               // 结束阅读时间戳
  duration: number;              // 阅读时长(秒)
  progress: number;              // 进度 0-100
  wordsLookedUp: string[];       // 查询过的单词
  shadowingRecords: ShadowingRecord[];
  completed: boolean;            // 是否完成
}

interface ShadowingRecord {
  paragraphId: string;
  audioBlob?: Blob;              // 录音数据
  timestamp: number;
}
```

#### 3.1.7 Quiz 记录表 (quizHistory)

```typescript
interface QuizRecord {
  id: string;                    // UUID
  userId: string;
  storyId: string;
  quizType: 'story_quiz' | 'review_quiz';
  questions: QuestionResult[];
  score: number;                 // 得分百分比
  earnedMagicPower: number;
  completedAt: number;
}

interface QuestionResult {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;             // 答题耗时(秒)
}
```

#### 3.1.8 地图节点表 (mapNodes)

```typescript
interface MapNode {
  id: string;                    // node_001
  regionId: string;              // 区域 ID
  type: 'story' | 'boss' | 'treasure' | 'branch';
  storyId?: string;              // 关联故事 ID
  position: { x: number; y: number };
  prerequisites: string[];       // 前置节点 ID
  rewards: {
    magicPower: number;
    cards?: string[];
    buddyAccessory?: string;
  };
}
```

#### 3.1.9 地图区域表 (mapRegions)

```typescript
interface MapRegion {
  id: string;                    // region_l1
  level: number;                 // 对应等级
  name: string;                  // 区域名称
  nameCn: string;                // 中文名称
  theme: string;                 // 主题风格
  backgroundColor: string;       // 背景色
  backgroundImage: string;       // 背景图
  nodes: string[];               // 包含的节点 ID
  unlockCondition: {
    requiredLevel: number;
    requiredNodes: string[];     // 必须完成的前置节点
  };
}
```

### 3.2 Dexie 数据库初始化

```typescript
// db.ts
import Dexie, { Table } from 'dexie';

export class MagicEnglishDB extends Dexie {
  users!: Table<User>;
  userProgress!: Table<UserProgress>;
  stories!: Table<Story>;
  dictionary!: Table<DictionaryEntry>;
  userVocabulary!: Table<UserVocabulary>;
  readingHistory!: Table<ReadingRecord>;
  quizHistory!: Table<QuizRecord>;
  mapNodes!: Table<MapNode>;
  mapRegions!: Table<MapRegion>;

  constructor() {
    super('MagicEnglishBuddy');
    
    this.version(1).stores({
      users: 'id, name, createdAt',
      userProgress: 'id, level, magicPower',
      stories: 'id, level, regionId',
      dictionary: 'word, level, frequency',
      userVocabulary: 'id, [userId+word], masteryLevel, nextReviewDate',
      readingHistory: 'id, userId, storyId, startTime',
      quizHistory: 'id, userId, storyId, completedAt',
      mapNodes: 'id, regionId, type',
      mapRegions: 'id, level'
    });
  }
}

export const db = new MagicEnglishDB();
```

### 3.3 数据初始化策略

```typescript
// dataInitializer.ts

export const initializeAppData = async () => {
  const isFirstLaunch = await checkFirstLaunch();
  
  if (isFirstLaunch) {
    // 1. 导入内置故事内容
    await importBuiltinStories();
    
    // 2. 导入词典数据
    await importDictionary();
    
    // 3. 初始化地图数据
    await importMapData();
    
    // 4. 标记完成初始化
    await localStorage.setItem('app_initialized', 'true');
  }
};

const importBuiltinStories = async () => {
  // 从静态 JSON 文件批量导入
  const storiesData = await fetch('/data/stories.json').then(r => r.json());
  await db.stories.bulkPut(storiesData);
};

const importDictionary = async () => {
  // 导入 5000 词基础词典
  const dictData = await fetch('/data/dictionary.json').then(r => r.json());
  await db.dictionary.bulkPut(dictData);
};
```

---

## 4. 核心模块设计

### 4.1 TTS 语音服务

```typescript
// services/ttsService.ts

interface TTSOptions {
  rate: number;        // 语速 0.5-2
  pitch: number;       // 音调 0-2
  volume: number;      // 音量 0-1
  lang: string;        // 语言 en-US
}

class TTSService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onBoundaryCallback: ((index: number) => void) | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * 获取可用的英语语音
   */
  async getEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve(voices.filter(v => v.lang.startsWith('en')));
      } else {
        this.synth.onvoiceschanged = () => {
          resolve(this.synth.getVoices().filter(v => v.lang.startsWith('en')));
        };
      }
    });
  }

  /**
   * 朗读文本并返回单词边界事件
   */
  speak(
    text: string, 
    options: Partial<TTSOptions> = {},
    onBoundary?: (charIndex: number, word: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;
      utterance.lang = options.lang ?? 'en-US';

      // 单词边界事件 - 用于高亮同步
      utterance.onboundary = (event) => {
        if (event.name === 'word' && onBoundary) {
          const word = text.substring(event.charIndex, event.charIndex + event.charLength);
          onBoundary(event.charIndex, word);
        }
      };

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * 朗读单个单词
   */
  speakWord(word: string, rate: number = 0.8): Promise<void> {
    return this.speak(word, { rate });
  }

  /**
   * 停止朗读
   */
  stop(): void {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  /**
   * 暂停
   */
  pause(): void {
    this.synth.pause();
  }

  /**
   * 恢复
   */
  resume(): void {
    this.synth.resume();
  }

  /**
   * 检查 TTS 是否可用
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

export const ttsService = new TTSService();
```

### 4.2 音频录制服务 (影子跟读)

```typescript
// services/audioRecorderService.ts

interface AudioRecording {
  blob: Blob;
  duration: number;
  url: string;
}

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * 检查录音权限
   */
  async checkPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ 
        name: 'microphone' as PermissionName 
      });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * 请求录音权限并初始化
   */
  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      return true;
    } catch (error) {
      console.error('Failed to get microphone access:', error);
      return false;
    }
  }

  /**
   * 开始录音
   */
  startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('Audio stream not initialized'));
        return;
      }

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      resolve();
    });
  }

  /**
   * 停止录音并返回录音数据
   */
  stopRecording(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = this.audioChunks.length * 100; // 估算时长
        
        resolve({ blob, duration, url });
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 获取音频波形数据 (用于可视化)
   */
  async getWaveformData(audioBlob: Blob): Promise<Float32Array> {
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer.getChannelData(0);
  }

  /**
   * 释放资源
   */
  dispose(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
  }
}

export const audioRecorderService = new AudioRecorderService();
```

### 4.3 字典查询服务

```typescript
// services/dictionaryService.ts

import { db, DictionaryEntry } from '../db';

interface LookupResult {
  entry: DictionaryEntry | null;
  suggestions: string[];
}

class DictionaryService {
  private cache: Map<string, DictionaryEntry> = new Map();

  /**
   * 查询单词
   */
  async lookup(word: string): Promise<LookupResult> {
    const normalizedWord = word.toLowerCase().trim();

    // 1. 先查缓存
    if (this.cache.has(normalizedWord)) {
      return { entry: this.cache.get(normalizedWord)!, suggestions: [] };
    }

    // 2. 查数据库
    let entry = await db.dictionary.get(normalizedWord);

    // 3. 尝试词形还原
    if (!entry) {
      const baseForm = this.lemmatize(normalizedWord);
      if (baseForm !== normalizedWord) {
        entry = await db.dictionary.get(baseForm);
      }
    }

    // 4. 获取建议词
    const suggestions = entry ? [] : await this.getSuggestions(normalizedWord);

    // 5. 缓存结果
    if (entry) {
      this.cache.set(normalizedWord, entry);
    }

    return { entry, suggestions };
  }

  /**
   * 简单词形还原
   */
  private lemmatize(word: string): string {
    // 规则式词形还原
    const rules: [RegExp, string][] = [
      [/ies$/, 'y'],      // cities -> city
      [/es$/, ''],        // boxes -> box
      [/s$/, ''],         // cats -> cat
      [/ed$/, ''],        // walked -> walk
      [/ing$/, ''],       // walking -> walk
      [/er$/, ''],        // bigger -> big
      [/est$/, ''],       // biggest -> big
    ];

    for (const [pattern, replacement] of rules) {
      if (pattern.test(word)) {
        return word.replace(pattern, replacement);
      }
    }

    return word;
  }

  /**
   * 获取相似词建议
   */
  private async getSuggestions(word: string): Promise<string[]> {
    const prefix = word.substring(0, 3);
    const similar = await db.dictionary
      .where('word')
      .startsWith(prefix)
      .limit(5)
      .toArray();
    
    return similar.map(e => e.word);
  }

  /**
   * 批量查询 (用于预加载)
   */
  async bulkLookup(words: string[]): Promise<Map<string, DictionaryEntry>> {
    const results = new Map<string, DictionaryEntry>();
    const uncached = words.filter(w => !this.cache.has(w.toLowerCase()));

    if (uncached.length > 0) {
      const entries = await db.dictionary
        .where('word')
        .anyOf(uncached.map(w => w.toLowerCase()))
        .toArray();

      entries.forEach(entry => {
        this.cache.set(entry.word, entry);
        results.set(entry.word, entry);
      });
    }

    // 添加已缓存的
    words.forEach(word => {
      const cached = this.cache.get(word.toLowerCase());
      if (cached) {
        results.set(word.toLowerCase(), cached);
      }
    });

    return results;
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const dictionaryService = new DictionaryService();
```

### 4.4 二维码同步服务

```typescript
// services/qrSyncService.ts

import QRCode from 'qrcode';
import { db } from '../db';

interface SyncData {
  version: number;
  userId: string;
  timestamp: number;
  progress: {
    level: number;
    magicPower: number;
    storiesRead: number;
    wordsLearned: number;
    totalTime: number;
    streakDays: number;
  };
  achievements: string[];
  checksum: string;
}

class QRSyncService {
  /**
   * 生成同步二维码
   */
  async generateSyncQR(userId: string): Promise<string> {
    const syncData = await this.collectSyncData(userId);
    const compressed = this.compress(syncData);
    
    const qrDataUrl = await QRCode.toDataURL(compressed, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff'
      }
    });

    return qrDataUrl;
  }

  /**
   * 收集同步数据
   */
  private async collectSyncData(userId: string): Promise<SyncData> {
    const progress = await db.userProgress.get(userId);
    const vocabulary = await db.userVocabulary
      .where('userId').equals(userId)
      .and(v => v.masteryLevel >= 2)
      .count();

    if (!progress) {
      throw new Error('User progress not found');
    }

    const data: SyncData = {
      version: 1,
      userId,
      timestamp: Date.now(),
      progress: {
        level: progress.level,
        magicPower: progress.magicPower,
        storiesRead: progress.totalStoriesRead,
        wordsLearned: vocabulary,
        totalTime: progress.totalReadingTime,
        streakDays: progress.streakDays
      },
      achievements: progress.achievements,
      checksum: ''
    };

    data.checksum = this.generateChecksum(data);
    return data;
  }

  /**
   * 压缩数据 (Base64 + 简化)
   */
  private compress(data: SyncData): string {
    // 使用短键名压缩
    const compact = {
      v: data.version,
      u: data.userId.substring(0, 8), // 只取前8位
      t: data.timestamp,
      p: [
        data.progress.level,
        data.progress.magicPower,
        data.progress.storiesRead,
        data.progress.wordsLearned,
        data.progress.totalTime,
        data.progress.streakDays
      ],
      a: data.achievements.map(a => a.substring(0, 4)), // 成就简写
      c: data.checksum.substring(0, 8)
    };

    return btoa(JSON.stringify(compact));
  }

  /**
   * 生成校验和
   */
  private generateChecksum(data: Omit<SyncData, 'checksum'>): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 解析二维码数据 (教师端使用)
   */
  parseQRData(qrContent: string): SyncData | null {
    try {
      const decoded = atob(qrContent);
      const compact = JSON.parse(decoded);
      
      return {
        version: compact.v,
        userId: compact.u,
        timestamp: compact.t,
        progress: {
          level: compact.p[0],
          magicPower: compact.p[1],
          storiesRead: compact.p[2],
          wordsLearned: compact.p[3],
          totalTime: compact.p[4],
          streakDays: compact.p[5]
        },
        achievements: compact.a,
        checksum: compact.c
      };
    } catch {
      return null;
    }
  }
}

export const qrSyncService = new QRSyncService();
```

### 4.5 Buddy 养成服务

```typescript
// services/buddyService.ts

import { db, UserProgress } from '../db';

type BuddyMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'hungry';
type BuddyStage = 1 | 2 | 3 | 4;

interface BuddyState {
  stage: BuddyStage;
  mood: BuddyMood;
  accessories: string[];
  magicPowerToNextStage: number;
  canEvolve: boolean;
}

// Buddy 进化阈值
const EVOLUTION_THRESHOLDS = {
  1: 0,      // 初始
  2: 500,    // L2-L3
  3: 2000,   // L4-L5
  4: 5000    // L6-L7
};

// 魔力值奖励配置
const MAGIC_POWER_REWARDS = {
  READ_STORY: 10,
  QUIZ_CORRECT: 5,
  QUIZ_PERFECT: 20,
  REVIEW_WORD: 2,
  DAILY_LOGIN: 5,
  STREAK_BONUS: (days: number) => Math.min(days * 2, 20)
};

class BuddyService {
  /**
   * 获取 Buddy 当前状态
   */
  async getBuddyState(userId: string): Promise<BuddyState> {
    const progress = await db.userProgress.get(userId);
    
    if (!progress) {
      throw new Error('User not found');
    }

    const mood = this.calculateMood(progress);
    const nextStageThreshold = EVOLUTION_THRESHOLDS[
      Math.min(progress.buddyStage + 1, 4) as BuddyStage
    ];
    
    return {
      stage: progress.buddyStage as BuddyStage,
      mood,
      accessories: [], // TODO: 从用户数据获取
      magicPowerToNextStage: nextStageThreshold - progress.magicPower,
      canEvolve: progress.magicPower >= nextStageThreshold && progress.buddyStage < 4
    };
  }

  /**
   * 计算 Buddy 心情
   */
  private calculateMood(progress: UserProgress): BuddyMood {
    const lastStudy = new Date(progress.lastStudyDate);
    const today = new Date();
    const daysSinceLastStudy = Math.floor(
      (today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastStudy > 2) return 'hungry';
    if (daysSinceLastStudy > 1) return 'sad';
    if (progress.streakDays >= 7) return 'excited';
    if (progress.streakDays >= 3) return 'happy';
    return 'neutral';
  }

  /**
   * 增加魔力值
   */
  async addMagicPower(
    userId: string, 
    amount: number, 
    source: keyof typeof MAGIC_POWER_REWARDS
  ): Promise<{ newTotal: number; canEvolve: boolean }> {
    const progress = await db.userProgress.get(userId);
    
    if (!progress) {
      throw new Error('User not found');
    }

    const bonus = typeof MAGIC_POWER_REWARDS[source] === 'function'
      ? (MAGIC_POWER_REWARDS[source] as Function)(progress.streakDays)
      : MAGIC_POWER_REWARDS[source];

    const newTotal = progress.magicPower + amount + bonus;
    
    await db.userProgress.update(userId, {
      magicPower: newTotal
    });

    const nextThreshold = EVOLUTION_THRESHOLDS[
      Math.min(progress.buddyStage + 1, 4) as BuddyStage
    ];

    return {
      newTotal,
      canEvolve: newTotal >= nextThreshold && progress.buddyStage < 4
    };
  }

  /**
   * 执行进化
   */
  async evolve(userId: string): Promise<BuddyStage | null> {
    const progress = await db.userProgress.get(userId);
    
    if (!progress || progress.buddyStage >= 4) {
      return null;
    }

    const nextStage = (progress.buddyStage + 1) as BuddyStage;
    const threshold = EVOLUTION_THRESHOLDS[nextStage];

    if (progress.magicPower < threshold) {
      return null;
    }

    await db.userProgress.update(userId, {
      buddyStage: nextStage
    });

    return nextStage;
  }

  /**
   * 获取 Buddy 动画配置
   */
  getBuddyAnimationConfig(stage: BuddyStage, mood: BuddyMood): string {
    const animationMap: Record<BuddyStage, Record<BuddyMood, string>> = {
      1: {
        happy: '/animations/egg_wiggle.json',
        excited: '/animations/egg_shake.json',
        neutral: '/animations/egg_idle.json',
        sad: '/animations/egg_droop.json',
        hungry: '/animations/egg_crack.json'
      },
      2: {
        happy: '/animations/baby_jump.json',
        excited: '/animations/baby_dance.json',
        neutral: '/animations/baby_idle.json',
        sad: '/animations/baby_cry.json',
        hungry: '/animations/baby_hungry.json'
      },
      3: {
        happy: '/animations/spirit_float.json',
        excited: '/animations/spirit_sparkle.json',
        neutral: '/animations/spirit_idle.json',
        sad: '/animations/spirit_dim.json',
        hungry: '/animations/spirit_fade.json'
      },
      4: {
        happy: '/animations/sage_smile.json',
        excited: '/animations/sage_magic.json',
        neutral: '/animations/sage_idle.json',
        sad: '/animations/sage_think.json',
        hungry: '/animations/sage_sleep.json'
      }
    };

    return animationMap[stage][mood];
  }
}

export const buddyService = new BuddyService();
```

---

## 5. 状态管理设计

### 5.1 XState 主状态机

```typescript
// machines/appMachine.ts

import { createMachine, assign } from 'xstate';

// 定义状态类型
type AppState = 
  | 'onboarding'
  | 'map'
  | 'reading'
  | 'quiz'
  | 'reward'
  | 'scroll';

interface AppContext {
  userId: string | null;
  currentStoryId: string | null;
  currentQuizIndex: number;
  earnedRewards: {
    magicPower: number;
    cards: string[];
  };
  isOffline: boolean;
}

type AppEvent =
  | { type: 'COMPLETE_ONBOARDING'; userId: string }
  | { type: 'SELECT_STORY'; storyId: string }
  | { type: 'FINISH_READING' }
  | { type: 'ANSWER_QUESTION'; answer: string; isCorrect: boolean }
  | { type: 'FINISH_QUIZ' }
  | { type: 'COLLECT_REWARDS' }
  | { type: 'GO_TO_MAP' }
  | { type: 'OPEN_SCROLL' }
  | { type: 'NETWORK_CHANGE'; isOffline: boolean };

export const appMachine = createMachine<AppContext, AppEvent>({
  id: 'magicEnglishBuddy',
  initial: 'checkingUser',
  context: {
    userId: null,
    currentStoryId: null,
    currentQuizIndex: 0,
    earnedRewards: { magicPower: 0, cards: [] },
    isOffline: !navigator.onLine
  },
  states: {
    // 检查用户状态
    checkingUser: {
      invoke: {
        src: 'checkExistingUser',
        onDone: [
          { target: 'map', cond: 'hasUser', actions: 'setUser' },
          { target: 'onboarding' }
        ],
        onError: 'onboarding'
      }
    },

    // 新手引导
    onboarding: {
      on: {
        COMPLETE_ONBOARDING: {
          target: 'map',
          actions: assign({
            userId: (_, event) => event.userId
          })
        }
      }
    },

    // 地图界面 (主界面)
    map: {
      on: {
        SELECT_STORY: {
          target: 'reading',
          actions: assign({
            currentStoryId: (_, event) => event.storyId
          })
        },
        OPEN_SCROLL: 'scroll'
      }
    },

    // 阅读状态
    reading: {
      initial: 'playing',
      states: {
        playing: {
          on: {
            PAUSE: 'paused',
            LOOKUP_WORD: 'lookingUp'
          }
        },
        paused: {
          on: {
            RESUME: 'playing'
          }
        },
        lookingUp: {
          on: {
            CLOSE_LOOKUP: 'playing'
          }
        },
        shadowing: {
          on: {
            FINISH_SHADOWING: 'playing'
          }
        }
      },
      on: {
        FINISH_READING: {
          target: 'quiz',
          actions: 'recordReadingComplete'
        },
        GO_TO_MAP: 'map'
      }
    },

    // 答题状态
    quiz: {
      initial: 'answering',
      states: {
        answering: {
          on: {
            ANSWER_QUESTION: [
              {
                target: 'feedback',
                actions: 'processAnswer'
              }
            ]
          }
        },
        feedback: {
          after: {
            1500: [
              { target: 'answering', cond: 'hasMoreQuestions' },
              { target: 'complete' }
            ]
          }
        },
        complete: {
          type: 'final'
        }
      },
      onDone: 'reward'
    },

    // 奖励展示
    reward: {
      entry: 'calculateRewards',
      on: {
        COLLECT_REWARDS: {
          target: 'map',
          actions: 'applyRewards'
        }
      }
    },

    // 守护者卷轴
    scroll: {
      on: {
        GO_TO_MAP: 'map'
      }
    }
  },

  // 全局事件
  on: {
    NETWORK_CHANGE: {
      actions: assign({
        isOffline: (_, event) => event.isOffline
      })
    }
  }
}, {
  guards: {
    hasUser: (context) => !!context.userId,
    hasMoreQuestions: (context) => context.currentQuizIndex < 4 // 假设5道题
  },
  actions: {
    setUser: assign({
      userId: (_, event: any) => event.data.userId
    }),
    processAnswer: assign({
      currentQuizIndex: (context) => context.currentQuizIndex + 1,
      earnedRewards: (context, event: any) => ({
        ...context.earnedRewards,
        magicPower: context.earnedRewards.magicPower + (event.isCorrect ? 5 : 0)
      })
    }),
    calculateRewards: assign({
      earnedRewards: (context) => ({
        magicPower: context.earnedRewards.magicPower + 10, // 完成奖励
        cards: [] // TODO: 根据故事配置
      })
    }),
    recordReadingComplete: () => {
      // 记录阅读完成
    },
    applyRewards: () => {
      // 应用奖励到数据库
    }
  },
  services: {
    checkExistingUser: async () => {
      // 检查本地是否有用户数据
      const user = await db.users.toCollection().first();
      if (user) {
        return { userId: user.id };
      }
      throw new Error('No user found');
    }
  }
});
```

### 5.2 Zustand 全局状态

```typescript
// stores/useAppStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppSettings {
  ttsSpeed: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoPlayTTS: boolean;
  showTranslation: boolean;
}

interface AppStore {
  // 设置
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // UI 状态
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 当前用户
  currentUserId: string | null;
  setCurrentUser: (userId: string) => void;
  
  // 网络状态
  isOffline: boolean;
  setOffline: (offline: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      settings: {
        ttsSpeed: 1.0,
        soundEnabled: true,
        vibrationEnabled: true,
        autoPlayTTS: true,
        showTranslation: false
      },
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      currentUserId: null,
      setCurrentUser: (userId) => set({ currentUserId: userId }),
      
      isOffline: !navigator.onLine,
      setOffline: (offline) => set({ isOffline: offline })
    }),
    {
      name: 'magic-english-storage',
      partialize: (state) => ({
        settings: state.settings,
        currentUserId: state.currentUserId
      })
    }
  )
);
```

---

## 6. 离线策略设计

### 6.1 Service Worker 配置

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'animations/*.json',
        'sounds/*.mp3',
        'images/*.webp'
      ],
      manifest: {
        name: 'Magic English Buddy',
        short_name: 'MagicBuddy',
        description: '你的魔法英语伙伴',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // 预缓存
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,json}'
        ],
        // 运行时缓存策略
        runtimeCaching: [
          {
            // 故事 JSON 数据
            urlPattern: /\/data\/stories\/.+\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'stories-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
              }
            }
          },
          {
            // 音频文件
            urlPattern: /\/audio\/.+\.(mp3|ogg|wav)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Lottie 动画
            urlPattern: /\/animations\/.+\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'animations-cache',
              expiration: {
                maxEntries: 50
              }
            }
          },
          {
            // 图片资源
            urlPattern: /\.(png|jpg|jpeg|webp|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ]
});
```

### 6.2 离线数据同步策略

```typescript
// services/offlineSyncService.ts

interface PendingAction {
  id: string;
  type: 'quiz_complete' | 'story_read' | 'word_learned';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineSyncService {
  private pendingActions: PendingAction[] = [];
  private storageKey = 'pending_sync_actions';

  constructor() {
    this.loadPendingActions();
    this.setupNetworkListener();
  }

  /**
   * 加载待同步操作
   */
  private loadPendingActions(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.pendingActions = JSON.parse(saved);
    }
  }

  /**
   * 保存待同步操作
   */
  private savePendingActions(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.pendingActions));
  }

  /**
   * 设置网络监听
   */
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      this.syncPendingActions();
    });
  }

  /**
   * 添加待同步操作
   */
  addPendingAction(type: PendingAction['type'], data: any): void {
    const action: PendingAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    this.pendingActions.push(action);
    this.savePendingActions();

    // 如果在线，立即尝试同步
    if (navigator.onLine) {
      this.syncPendingActions();
    }
  }

  /**
   * 同步待处理操作
   */
  async syncPendingActions(): Promise<void> {
    const unsyncedActions = this.pendingActions.filter(a => !a.synced);
    
    for (const action of unsyncedActions) {
      try {
        // 这里可以调用云端 API（P3 阶段）
        // await api.syncAction(action);
        
        action.synced = true;
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }

    // 清理已同步的操作
    this.pendingActions = this.pendingActions.filter(a => !a.synced);
    this.savePendingActions();
  }

  /**
   * 获取待同步数量
   */
  getPendingCount(): number {
    return this.pendingActions.filter(a => !a.synced).length;
  }
}

export const offlineSyncService = new OfflineSyncService();
```

### 6.3 资源预加载管理

```typescript
// services/resourcePreloader.ts

interface PreloadTask {
  url: string;
  type: 'json' | 'audio' | 'image' | 'animation';
  priority: 'high' | 'medium' | 'low';
}

class ResourcePreloader {
  private loadedResources: Set<string> = new Set();
  private loadingQueue: PreloadTask[] = [];
  private isLoading = false;

  /**
   * 预加载当前节点前后的资源
   */
  async preloadAroundNode(currentNodeId: string): Promise<void> {
    const adjacentNodes = await this.getAdjacentNodes(currentNodeId, 2);
    
    for (const node of adjacentNodes) {
      if (node.storyId) {
        this.addToQueue({
          url: `/data/stories/${node.storyId}.json`,
          type: 'json',
          priority: 'high'
        });
        
        // 预加载故事音频
        const story = await db.stories.get(node.storyId);
        if (story?.audioFile) {
          this.addToQueue({
            url: story.audioFile,
            type: 'audio',
            priority: 'medium'
          });
        }
        
        // 预加载故事插图
        if (story?.coverImage) {
          this.addToQueue({
            url: story.coverImage,
            type: 'image',
            priority: 'low'
          });
        }
      }
    }

    this.processQueue();
  }

  /**
   * 获取相邻节点
   */
  private async getAdjacentNodes(
    nodeId: string, 
    range: number
  ): Promise<MapNode[]> {
    // 实现获取相邻节点逻辑
    return [];
  }

  /**
   * 添加到队列
   */
  private addToQueue(task: PreloadTask): void {
    if (!this.loadedResources.has(task.url)) {
      this.loadingQueue.push(task);
      // 按优先级排序
      this.loadingQueue.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      });
    }
  }

  /**
   * 处理加载队列
   */
  private async processQueue(): Promise<void> {
    if (this.isLoading || this.loadingQueue.length === 0) return;

    this.isLoading = true;

    while (this.loadingQueue.length > 0) {
      const task = this.loadingQueue.shift()!;
      
      try {
        await this.loadResource(task);
        this.loadedResources.add(task.url);
      } catch (error) {
        console.warn(`Failed to preload: ${task.url}`, error);
      }
    }

    this.isLoading = false;
  }

  /**
   * 加载单个资源
   */
  private async loadResource(task: PreloadTask): Promise<void> {
    switch (task.type) {
      case 'json':
        await fetch(task.url);
        break;
      case 'audio':
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = task.url;
        break;
      case 'image':
        const img = new Image();
        img.src = task.url;
        break;
      case 'animation':
        await fetch(task.url);
        break;
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.loadedResources.clear();
    this.loadingQueue = [];
  }
}

export const resourcePreloader = new ResourcePreloader();
```

---

## 7. UI组件架构

### 7.1 组件目录结构

```
src/
├── components/
│   ├── common/                    # 通用组件
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   ├── Toast/
│   │   └── Icon/
│   ├── buddy/                     # Buddy 相关组件
│   │   ├── BuddyAvatar/
│   │   ├── BuddyAnimation/
│   │   ├── EvolutionModal/
│   │   └── MoodIndicator/
│   ├── map/                       # 地图相关组件
│   │   ├── MapCanvas/
│   │   ├── MapNode/
│   │   ├── FogOverlay/
│   │   ├── RegionBackground/
│   │   └── NodePreviewModal/
│   ├── reader/                    # 阅读器组件
│   │   ├── StoryContent/
│   │   ├── WordHighlight/
│   │   ├── ControlBar/
│   │   ├── DictionaryPopup/
│   │   ├── ShadowingRecorder/
│   │   └── WaveformDisplay/
│   ├── quiz/                      # Quiz 组件
│   │   ├── QuizContainer/
│   │   ├── MultipleChoice/
│   │   ├── DragAndDrop/
│   │   ├── WordBuilder/
│   │   ├── ProgressIndicator/
│   │   └── FeedbackAnimation/
│   ├── scroll/                    # 守护者卷轴组件
│   │   ├── ScrollContainer/
│   │   ├── ProgressCard/
│   │   ├── QRCodeDisplay/
│   │   └── CertificateExport/
│   └── onboarding/                # 引导组件
│       ├── WelcomeScreen/
│       ├── EggAnimation/
│       ├── NameInput/
│       └── TutorialOverlay/
├── pages/
│   ├── OnboardingPage/
│   ├── MapPage/
│   ├── ReaderPage/
│   ├── QuizPage/
│   └── ScrollPage/
├── hooks/
│   ├── useTTS.ts
│   ├── useAudioRecorder.ts
│   ├── useDictionary.ts
│   ├── useBuddy.ts
│   ├── useOfflineStatus.ts
│   └── useMapProgress.ts
├── services/
│   ├── ttsService.ts
│   ├── audioRecorderService.ts
│   ├── dictionaryService.ts
│   ├── qrSyncService.ts
│   ├── buddyService.ts
│   └── offlineSyncService.ts
├── machines/
│   └── appMachine.ts
├── stores/
│   └── useAppStore.ts
├── db/
│   └── index.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── validators.ts
└── types/
    └── index.ts
```

### 7.2 核心组件实现示例

#### 7.2.1 WordHighlight 组件

```typescript
// components/reader/WordHighlight/WordHighlight.tsx

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './WordHighlight.module.css';

interface WordHighlightProps {
  text: string;
  activeWordIndex: number | null;
  onWordClick: (word: string, index: number) => void;
  onWordLongPress: (word: string, index: number) => void;
}

export const WordHighlight: React.FC<WordHighlightProps> = ({
  text,
  activeWordIndex,
  onWordClick,
  onWordLongPress
}) => {
  const words = text.split(/(\s+)/);
  let wordIndex = 0;
  
  const handleLongPress = useCallback((
    word: string, 
    index: number, 
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    onWordLongPress(word, index);
  }, [onWordLongPress]);

  return (
    <p className={styles.paragraph}>
      {words.map((segment, i) => {
        // 空白符直接渲染
        if (/^\s+$/.test(segment)) {
          return <span key={i}>{segment}</span>;
        }

        const currentIndex = wordIndex++;
        const isActive = currentIndex === activeWordIndex;
        
        // 清理标点
        const cleanWord = segment.replace(/[.,!?;:'"]/g, '');
        const punctuation = segment.replace(cleanWord, '');

        return (
          <React.Fragment key={i}>
            <motion.span
              className={`${styles.word} ${isActive ? styles.active : ''}`}
              onClick={() => onWordClick(cleanWord, currentIndex)}
              onContextMenu={(e) => handleLongPress(cleanWord, currentIndex, e)}
              animate={{
                backgroundColor: isActive ? '#FFE066' : 'transparent',
                scale: isActive ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.95 }}
            >
              {cleanWord}
            </motion.span>
            {punctuation && <span>{punctuation}</span>}
          </React.Fragment>
        );
      })}
    </p>
  );
};
```

#### 7.2.2 DragAndDrop Quiz 组件

```typescript
// components/quiz/DragAndDrop/DragAndDrop.tsx

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { DraggableWord } from './DraggableWord';
import { DropZone } from './DropZone';
import styles from './DragAndDrop.module.css';

interface DragAndDropProps {
  shuffledWords: string[];
  correctOrder: string[];
  onComplete: (isCorrect: boolean) => void;
}

export const DragAndDrop: React.FC<DragAndDropProps> = ({
  shuffledWords,
  correctOrder,
  onComplete
}) => {
  const [availableWords, setAvailableWords] = useState(shuffledWords);
  const [placedWords, setPlacedWords] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // 5px 移动后才开始拖拽
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // 从可用区拖到放置区
    if (over.id === 'drop-zone' && availableWords.includes(active.id as string)) {
      setAvailableWords(prev => prev.filter(w => w !== active.id));
      setPlacedWords(prev => [...prev, active.id as string]);
    }

    // 在放置区内重排
    if (over.id !== 'drop-zone' && placedWords.includes(active.id as string)) {
      const oldIndex = placedWords.indexOf(active.id as string);
      const newIndex = placedWords.indexOf(over.id as string);
      
      if (oldIndex !== newIndex) {
        setPlacedWords(arrayMove(placedWords, oldIndex, newIndex));
      }
    }
  };

  const checkAnswer = () => {
    const isCorrect = JSON.stringify(placedWords) === JSON.stringify(correctOrder);
    onComplete(isCorrect);
  };

  const removeWord = (word: string) => {
    setPlacedWords(prev => prev.filter(w => w !== word));
    setAvailableWords(prev => [...prev, word]);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.container}>
        {/* 放置区域 */}
        <DropZone
          id="drop-zone"
          words={placedWords}
          onRemoveWord={removeWord}
        />

        {/* 可选单词区域 */}
        <div className={styles.wordBank}>
          <SortableContext
            items={availableWords}
            strategy={horizontalListSortingStrategy}
          >
            {availableWords.map(word => (
              <DraggableWord key={word} word={word} />
            ))}
          </SortableContext>
        </div>

        {/* 检查按钮 */}
        {placedWords.length === correctOrder.length && (
          <button 
            className={styles.checkButton}
            onClick={checkAnswer}
          >
            Check Answer ✨
          </button>
        )}
      </div>
    </DndContext>
  );
};
```

---

## 8. 性能优化策略

### 8.1 首屏加载优化

```typescript
// 1. 路由懒加载
const MapPage = lazy(() => import('./pages/MapPage'));
const ReaderPage = lazy(() => import('./pages/ReaderPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));

// 2. 组件懒加载
const BuddyAnimation = lazy(() => import('./components/buddy/BuddyAnimation'));

// 3. 代码分割配置 (vite.config.ts)
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-animation': ['framer-motion', 'lottie-react'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
          'vendor-storage': ['dexie', 'zustand']
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
});
```

### 8.2 渲染性能优化

```typescript
// 1. 使用 React.memo 避免不必要重渲染
export const MapNode = React.memo<MapNodeProps>(({ node, isUnlocked }) => {
  // ...
});

// 2. 使用 useMemo 缓存计算结果
const sortedWords = useMemo(() => {
  return words.sort((a, b) => a.index - b.index);
}, [words]);

// 3. 使用 useCallback 缓存回调函数
const handleWordClick = useCallback((word: string, index: number) => {
  setActiveWord({ word, index });
}, []);

// 4. 虚拟列表 (长列表场景)
import { FixedSizeList } from 'react-window';

const VocabularyList: React.FC<{ words: string[] }> = ({ words }) => (
  <FixedSizeList
    height={400}
    width="100%"
    itemCount={words.length}
    itemSize={60}
  >
    {({ index, style }) => (
      <div style={style}>
        <WordCard word={words[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

### 8.3 动画性能优化

```typescript
// 1. 使用 CSS 变量控制动画
:root {
  --animation-duration: 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-duration: 0s;
  }
}

// 2. 使用 will-change 提示浏览器
.animated-element {
  will-change: transform, opacity;
}

// 3. 使用 transform 代替 top/left
.moving-element {
  transform: translateX(100px);  /* 好 */
  /* left: 100px; */            /* 避免 */
}

// 4. 低端设备降级
const useLowEndDevice = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    // 检测设备性能
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    if ((memory && memory < 4) || (cores && cores < 4)) {
      setIsLowEnd(true);
    }
  }, []);
  
  return isLowEnd;
};

// 5. 条件禁用复杂动画
const BuddyAnimation: React.FC = () => {
  const isLowEnd = useLowEndDevice();
  
  if (isLowEnd) {
    return <BuddyStaticImage />;
  }
  
  return <LottieAnimation />;
};
```

### 8.4 存储优化

```typescript
// 1. IndexedDB 批量操作
await db.userVocabulary.bulkPut(wordsToUpdate);

// 2. 分页查询
const getStoriesByPage = async (page: number, pageSize = 20) => {
  return await db.stories
    .orderBy('level')
    .offset(page * pageSize)
    .limit(pageSize)
    .toArray();
};

// 3. 索引优化
this.version(2).stores({
  userVocabulary: 'id, [userId+masteryLevel], nextReviewDate'
});

// 4. 定期清理
const cleanupOldRecords = async () => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  await db.readingHistory
    .where('startTime')
    .below(thirtyDaysAgo)
    .delete();
};
```

---

## 9. 安全与兼容性

### 9.1 安全措施

```typescript
// 1. 内容安全策略 (CSP)
// index.html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  media-src 'self' blob:;
  font-src 'self';
">

// 2. 用户输入验证
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 100);
};

// 3. 本地存储加密 (敏感数据)
import CryptoJS from 'crypto-js';

const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encrypted: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 9.2 浏览器兼容性

| 特性 | 最低版本 | 降级方案 |
|------|----------|----------|
| IndexedDB | Chrome 24+, Safari 10+ | 降级到 localStorage |
| Service Worker | Chrome 45+, Safari 11.1+ | 无离线支持，提示用户 |
| Web Speech API | Chrome 33+, Safari 14.1+ | 禁用 TTS，仅显示文本 |
| MediaRecorder | Chrome 47+, Safari 14.1+ | 禁用录音功能 |
| Vibration API | Chrome 32+, Safari ❌ | 静默失败 |

### 9.3 功能检测与降级

```typescript
// utils/featureDetection.ts

export const features = {
  indexedDB: 'indexedDB' in window,
  serviceWorker: 'serviceWorker' in navigator,
  speechSynthesis: 'speechSynthesis' in window,
  mediaRecorder: 'MediaRecorder' in window,
  vibration: 'vibrate' in navigator,
  webAudio: 'AudioContext' in window || 'webkitAudioContext' in window
};

export const checkCriticalFeatures = (): string[] => {
  const missing: string[] = [];
  
  if (!features.indexedDB) {
    missing.push('IndexedDB (数据存储)');
  }
  
  return missing;
};

// 应用启动时检查
const App: React.FC = () => {
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<string[]>([]);
  
  useEffect(() => {
    const missing = checkCriticalFeatures();
    if (missing.length > 0) {
      setUnsupportedFeatures(missing);
    }
  }, []);
  
  if (unsupportedFeatures.length > 0) {
    return <UnsupportedBrowserPage features={unsupportedFeatures} />;
  }
  
  return <MainApp />;
};
```

---

## 附录

### A. 依赖清单

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "xstate": "^5.0.0",
    "@xstate/react": "^4.0.0",
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "dexie": "^3.2.0",
    "dexie-react-hooks": "^1.1.0",
    "framer-motion": "^10.16.0",
    "lottie-react": "^2.4.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.0",
    "howler": "^2.2.0",
    "qrcode": "^1.5.0",
    "html2canvas": "^1.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite-plugin-pwa": "^0.17.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-strategies": "^7.0.0"
  }
}
```

### B. 环境变量

```bash
# .env.development
VITE_APP_NAME=Magic English Buddy
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true

# .env.production
VITE_APP_NAME=Magic English Buddy
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
```

### C. 参考资源

- [PWA 最佳实践](https://web.dev/progressive-web-apps/)
- [Workbox 文档](https://developer.chrome.com/docs/workbox/)
- [XState 文档](https://xstate.js.org/docs/)
- [Dexie.js 文档](https://dexie.org/docs/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)


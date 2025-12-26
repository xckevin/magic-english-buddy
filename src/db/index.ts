/**
 * Magic English Buddy - 数据库配置
 * 使用 Dexie.js 封装 IndexedDB
 */

import Dexie, { type Table } from 'dexie';

// ============ 类型定义 ============

/** 用户设置 */
export interface UserSettings {
  language: 'zh-CN' | 'en-US';
  ttsSpeed: 0.8 | 1.0 | 1.2;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoPlayTTS: boolean;
  showTranslation: boolean;
}

/** 用户信息 */
export interface User {
  id: string;
  name: string;
  buddyName: string;
  createdAt: number;
  lastActiveAt: number;
  settings: UserSettings;
}

/** 用户进度 */
export interface UserProgress {
  id: string; // 关联 userId
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  magicPower: number;
  buddyStage: 1 | 2 | 3 | 4;
  totalReadingTime: number; // 分钟
  totalStoriesRead: number;
  currentMapNode: string;
  unlockedNodes: string[];
  achievements: string[];
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
}

/** 单词时间轴 */
export interface WordTiming {
  word: string;
  start: number; // ms
  end: number; // ms
  index: number;
}

/** 故事段落内容 */
export interface StoryContent {
  paragraphId: string;
  text: string;
  translation: string;
  audioStart: number; // ms
  audioEnd: number; // ms
  words: WordTiming[];
}

/** Quiz 选项 */
export interface QuizOption {
  image?: string;
  text?: string;
  value: string;
}

/** Quiz 题目 */
export interface QuizItem {
  id: string;
  type: 'image_choice' | 'word_builder' | 'sentence_order' | 'fill_blank';
  question: string;
  audioQuestion?: string;
  options?: QuizOption[];
  shuffledWords?: string[];
  correctOrder?: string[];
  correctAnswer?: string;
  blank?: string;
}

/** 故事 */
export interface Story {
  id: string;
  level: number;
  regionId: string;
  title: string;
  titleCn: string;
  coverImage: string;
  audioFile: string;
  content: StoryContent[];
  quiz: QuizItem[];
  rewards: {
    magicPower: number;
    cards: string[];
  };
  metadata: {
    wordCount: number;
    estimatedTime: number;
    difficulty: number;
  };
}

/** 词典条目 */
export interface DictionaryEntry {
  word: string; // 主键
  phonetic: string;
  meaningCn: string;
  meaningEn: string;
  partOfSpeech: string;
  examples: string[];
  emoji?: string;
  imageKey?: string;
  level: number;
  frequency: number;
}

/** 用户词汇 */
export interface UserVocabulary {
  id: string; // `${userId}_${word}`
  userId: string;
  word: string;
  firstSeen: number;
  lastReviewed: number;
  correctCount: number;
  wrongCount: number;
  masteryLevel: 0 | 1 | 2 | 3; // 0-学习中 1-初步 2-熟练 3-掌握
  nextReviewDate: string;
  isCard: boolean;
  cardRarity: 'white' | 'green' | 'blue' | 'gold' | null;
}

/** 影子跟读记录 */
export interface ShadowingRecord {
  paragraphId: string;
  audioBlob?: Blob;
  timestamp: number;
}

/** 阅读记录 */
export interface ReadingRecord {
  id: string;
  userId: string;
  storyId: string;
  startTime: number;
  endTime: number;
  duration: number; // 秒
  progress: number; // 0-100
  wordsLookedUp: string[];
  shadowingRecords: ShadowingRecord[];
  completed: boolean;
}

/** 答题结果 */
export interface QuestionResult {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // 秒
}

/** Quiz 记录 */
export interface QuizRecord {
  id: string;
  userId: string;
  storyId: string;
  quizType: 'story_quiz' | 'review_quiz';
  questions: QuestionResult[];
  score: number; // 百分比
  earnedMagicPower: number;
  completedAt: number;
}

/** 地图节点 */
export interface MapNode {
  id: string;
  regionId: string;
  type: 'story' | 'boss' | 'treasure' | 'branch';
  storyId?: string;
  position: { x: number; y: number };
  prerequisites: string[];
  rewards: {
    magicPower: number;
    cards?: string[];
    buddyAccessory?: string;
  };
}

/** 地图区域 */
export interface MapRegion {
  id: string;
  level: number;
  name: string;
  nameCn: string;
  theme: string;
  backgroundColor: string;
  backgroundImage: string;
  nodes: string[];
  unlockCondition: {
    requiredLevel: number;
    requiredNodes: string[];
  };
}

/** 成就 */
export interface Achievement {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  category: 'reading' | 'vocabulary' | 'quiz' | 'buddy' | 'streak' | 'explore';
  condition: {
    type: string;
    value: number;
  };
  reward: {
    magicPower: number;
    badge?: string;
  };
}

// ============ 数据库类 ============

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
  achievements!: Table<Achievement>;

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
      mapRegions: 'id, level',
      achievements: 'id, category',
    });
  }
}

// 创建数据库实例
export const db = new MagicEnglishDB();

// ============ 辅助函数 ============

/**
 * 生成 UUID
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/**
 * 获取当前日期字符串 (YYYY-MM-DD)
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 创建默认用户设置
 */
export const createDefaultSettings = (): UserSettings => ({
  language: 'zh-CN',
  ttsSpeed: 1.0,
  soundEnabled: true,
  vibrationEnabled: true,
  autoPlayTTS: true,
  showTranslation: false,
});

/**
 * 创建新用户
 */
export const createUser = async (name: string, buddyName: string): Promise<User> => {
  const userId = generateId();
  const now = Date.now();

  const user: User = {
    id: userId,
    name,
    buddyName,
    createdAt: now,
    lastActiveAt: now,
    settings: createDefaultSettings(),
  };

  const progress: UserProgress = {
    id: userId,
    level: 1,
    magicPower: 0,
    buddyStage: 1,
    totalReadingTime: 0,
    totalStoriesRead: 0,
    currentMapNode: 'node_l1_001',
    unlockedNodes: ['node_l1_001'],
    achievements: [],
    streakDays: 0,
    lastStudyDate: getTodayString(),
  };

  await db.transaction('rw', [db.users, db.userProgress], async () => {
    await db.users.add(user);
    await db.userProgress.add(progress);
  });

  return user;
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async (): Promise<User | undefined> => {
  return await db.users.toCollection().first();
};

/**
 * 获取用户进度
 */
export const getUserProgress = async (userId: string): Promise<UserProgress | undefined> => {
  return await db.userProgress.get(userId);
};

/**
 * 更新用户活跃时间
 */
export const updateUserActivity = async (userId: string): Promise<void> => {
  const today = getTodayString();
  const progress = await db.userProgress.get(userId);

  if (progress) {
    const lastDate = progress.lastStudyDate;
    const isConsecutive = isConsecutiveDay(lastDate, today);

    await db.userProgress.update(userId, {
      lastStudyDate: today,
      streakDays: isConsecutive ? progress.streakDays + 1 : 1,
    });
  }

  await db.users.update(userId, {
    lastActiveAt: Date.now(),
  });
};

/**
 * 检查是否连续天数
 */
const isConsecutiveDay = (lastDate: string, today: string): boolean => {
  const last = new Date(lastDate);
  const current = new Date(today);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export default db;


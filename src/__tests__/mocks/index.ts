/**
 * Mock 数据和工具
 */

import { vi } from 'vitest';

// ============================================
// Mock 用户数据
// ============================================

export const mockUser = {
  id: 'test-user-001',
  name: 'TestUser',
  buddyName: 'Spark',
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 天前
  lastActiveAt: Date.now(),
  settings: {
    language: 'zh-CN' as const,
    ttsSpeed: 1.0 as const,
    soundEnabled: true,
    vibrationEnabled: true,
    autoPlayTTS: true,
    showTranslation: false,
  }
};

export const mockUserProgress = {
  id: 'test-user-001',
  level: 2 as const,
  magicPower: 850,
  buddyStage: 2 as const,
  totalReadingTime: 120, // 分钟
  totalStoriesRead: 15,
  currentMapNode: 'l1_010',
  unlockedNodes: [
    'l1_001', 'l1_002', 'l1_003', 'l1_004', 'l1_005',
    'l1_006', 'l1_007', 'l1_008', 'l1_009', 'l1_010'
  ],
  achievements: ['first_story', 'reader_10'],
  streakDays: 5,
  lastStudyDate: new Date().toISOString().split('T')[0]
};

// ============================================
// Mock 故事数据
// ============================================

export const mockStory = {
  id: 'l1_001',
  level: 1,
  regionId: 'region_forest',
  title: 'The Magic Apple',
  titleCn: '魔法苹果',
  coverImage: '/images/stories/l1_001_cover.webp',
  audioFile: '/audio/stories/l1_001.mp3',
  content: [
    {
      paragraphId: 'p1',
      text: 'Once upon a time, there was a red apple.',
      translation: '从前，有一个红苹果。',
      audioStart: 0,
      audioEnd: 3500,
      words: [
        { word: 'Once', start: 0, end: 400, index: 0 },
        { word: 'upon', start: 400, end: 700, index: 1 },
        { word: 'a', start: 700, end: 900, index: 2 },
        { word: 'time', start: 900, end: 1300, index: 3 },
        { word: 'there', start: 1500, end: 1800, index: 4 },
        { word: 'was', start: 1800, end: 2100, index: 5 },
        { word: 'a', start: 2100, end: 2300, index: 6 },
        { word: 'red', start: 2300, end: 2700, index: 7 },
        { word: 'apple', start: 2700, end: 3500, index: 8 }
      ]
    },
    {
      paragraphId: 'p2',
      text: 'The apple lived in a big tree.',
      translation: '苹果住在一棵大树上。',
      audioStart: 3500,
      audioEnd: 6000,
      words: [
        { word: 'The', start: 3500, end: 3700, index: 0 },
        { word: 'apple', start: 3700, end: 4200, index: 1 },
        { word: 'lived', start: 4200, end: 4600, index: 2 },
        { word: 'in', start: 4600, end: 4800, index: 3 },
        { word: 'a', start: 4800, end: 5000, index: 4 },
        { word: 'big', start: 5000, end: 5400, index: 5 },
        { word: 'tree', start: 5400, end: 6000, index: 6 }
      ]
    }
  ],
  quiz: [
    {
      id: 'q1',
      type: 'image_choice',
      question: 'What color is the apple?',
      options: [
        { image: '/images/quiz/red.webp', value: 'red' },
        { image: '/images/quiz/blue.webp', value: 'blue' },
        { image: '/images/quiz/green.webp', value: 'green' }
      ],
      correct: 'red'
    },
    {
      id: 'q2',
      type: 'word_builder',
      question: 'Spell the word',
      targetWord: 'apple',
      hint: '🍎'
    },
    {
      id: 'q3',
      type: 'sentence_order',
      question: 'Put the words in order',
      words: ['The', 'apple', 'is', 'red'],
      correctOrder: ['The', 'apple', 'is', 'red']
    }
  ],
  rewards: {
    magicPower: 15,
    cards: ['word_apple', 'word_red']
  },
  metadata: {
    wordCount: 18,
    estimatedTime: 2,
    difficulty: 1
  }
};

export const mockStories = [
  mockStory,
  {
    ...mockStory,
    id: 'l1_002',
    title: 'Hello Friend',
    titleCn: '你好朋友'
  },
  {
    ...mockStory,
    id: 'l1_003',
    title: 'Colors Around Me',
    titleCn: '我周围的颜色'
  }
];

// ============================================
// Mock 词典数据
// ============================================

export const mockDictionaryEntry = {
  word: 'apple',
  phonetic: '/ˈæp.əl/',
  meaningCn: '苹果',
  meaningEn: 'A round fruit with red or green skin',
  partOfSpeech: 'n.',
  examples: ['I like red apples.', 'The apple is on the table.'],
  emoji: '🍎',
  imageKey: 'apple',
  level: 1,
  frequency: 95
};

export const mockDictionary = [
  mockDictionaryEntry,
  {
    word: 'red',
    phonetic: '/red/',
    meaningCn: '红色的',
    meaningEn: 'The color of blood',
    partOfSpeech: 'adj.',
    examples: ['The apple is red.'],
    emoji: '🔴',
    level: 1,
    frequency: 98
  },
  {
    word: 'tree',
    phonetic: '/triː/',
    meaningCn: '树',
    meaningEn: 'A tall plant with a wooden trunk',
    partOfSpeech: 'n.',
    examples: ['The bird is in the tree.'],
    emoji: '🌳',
    level: 1,
    frequency: 92
  }
];

// ============================================
// Mock 地图数据
// ============================================

export const mockMapNode = {
  id: 'l1_001',
  regionId: 'region_forest',
  type: 'story' as const,
  storyId: 'l1_001',
  title: 'The Magic Apple',
  titleCn: '魔法苹果',
  emoji: '📖',
  position: { x: 50, y: 100 },
  prerequisites: [],
  unlocked: true,
  completed: false,
  rewards: {
    magicPower: 15,
    cards: ['word_apple']
  }
};

export const mockMapNodes = Array.from({ length: 20 }, (_, i) => ({
  ...mockMapNode,
  id: `l1_${String(i + 1).padStart(3, '0')}`,
  storyId: `l1_${String(i + 1).padStart(3, '0')}`,
  position: { x: 50 + (i % 4) * 60, y: 100 + Math.floor(i / 4) * 120 },
  prerequisites: i === 0 ? [] : [`l1_${String(i).padStart(3, '0')}`]
}));

export const mockMapRegion = {
  id: 'region_forest',
  level: 1,
  name: 'Budding Forest',
  nameCn: '萌芽之森',
  theme: 'forest',
  backgroundColor: '#1a472a',
  backgroundImage: '/images/maps/forest_bg.webp',
  nodes: mockMapNodes.map(n => n.id),
  unlockCondition: {
    requiredLevel: 1,
    requiredNodes: []
  }
};

// ============================================
// Mock 成就数据
// ============================================

export const mockAchievements = [
  { id: 'first_story', name: '初次冒险', desc: '完成第一个故事', icon: '📖', unlocked: true },
  { id: 'reader_10', name: '小书虫', desc: '阅读10个故事', icon: '🐛', unlocked: true },
  { id: 'quiz_perfect', name: '完美答题', desc: '一次Quiz全对', icon: '💯', unlocked: false },
  { id: 'streak_7', name: '一周坚持', desc: '连续学习7天', icon: '📅', unlocked: false }
];

// ============================================
// Mock 卡牌数据
// ============================================

export const mockCards = [
  { id: 'word_apple', word: 'apple', rarity: 'green' as const, obtainedAt: Date.now() },
  { id: 'word_red', word: 'red', rarity: 'white' as const, obtainedAt: Date.now() },
  { id: 'word_tree', word: 'tree', rarity: 'blue' as const, obtainedAt: Date.now() }
];

// ============================================
// Mock 服务
// ============================================

export const createMockTTSService = () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  speakWord: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  isSupported: vi.fn(() => true),
  getEnglishVoices: vi.fn().mockResolvedValue([
    { lang: 'en-US', name: 'Google US English' }
  ])
});

export const createMockDictionaryService = () => ({
  lookup: vi.fn().mockResolvedValue({
    entry: mockDictionaryEntry,
    suggestions: []
  }),
  bulkLookup: vi.fn().mockResolvedValue(new Map([
    ['apple', mockDictionaryEntry]
  ])),
  clearCache: vi.fn()
});

export const createMockAudioRecorderService = () => ({
  checkPermission: vi.fn().mockResolvedValue(true),
  initialize: vi.fn().mockResolvedValue(true),
  startRecording: vi.fn().mockResolvedValue(undefined),
  stopRecording: vi.fn().mockResolvedValue({
    blob: new Blob(['mock'], { type: 'audio/webm' }),
    duration: 3000,
    url: 'blob:mock-url'
  }),
  getWaveformData: vi.fn().mockResolvedValue(new Float32Array(1024)),
  dispose: vi.fn()
});

export const createMockBuddyService = () => ({
  getBuddyState: vi.fn().mockResolvedValue({
    stage: 2,
    mood: 'happy',
    accessories: [],
    magicPowerToNextStage: 1150,
    canEvolve: false
  }),
  addMagicPower: vi.fn().mockResolvedValue({ newTotal: 865, canEvolve: false }),
  evolve: vi.fn().mockResolvedValue(3),
  getBuddyAnimationConfig: vi.fn(() => '/animations/baby_idle.json')
});

export const createMockQRSyncService = () => ({
  generateSyncQR: vi.fn().mockResolvedValue('data:image/png;base64,mockqrcode'),
  parseQRData: vi.fn().mockReturnValue({
    version: 1,
    userId: 'test-user',
    timestamp: Date.now(),
    progress: {
      level: 2,
      magicPower: 850,
      storiesRead: 15,
      wordsLearned: 100,
      totalTime: 120,
      streakDays: 5
    },
    achievements: ['first_story', 'reader_10'],
    checksum: 'abc123'
  })
});

// ============================================
// 测试数据库工具
// ============================================

export const createTestDatabase = async () => {
  const { db } = await import('@/db');
  
  // 清空所有表
  await db.users.clear();
  await db.userProgress.clear();
  await db.stories.clear();
  await db.dictionary.clear();
  await db.userVocabulary.clear();
  await db.readingHistory.clear();
  await db.quizHistory.clear();
  await db.mapNodes.clear();
  await db.mapRegions.clear();
  await db.achievements.clear();
  
  return db;
};

export const seedTestDatabase = async () => {
  const db = await createTestDatabase();
  
  // 填充测试数据
  await db.users.add(mockUser);
  await db.userProgress.add(mockUserProgress);
  await db.stories.bulkAdd(mockStories);
  await db.dictionary.bulkAdd(mockDictionary);
  await db.mapNodes.bulkAdd(mockMapNodes);
  await db.mapRegions.add(mockMapRegion);
  
  return db;
};

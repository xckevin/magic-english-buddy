/**
 * 数据索引文件
 * 统一管理所有级别的地图、故事、词典数据
 */

import type { MapNode, MapRegion, Story, DictionaryEntry } from '@/db';

// ============ 地图数据导入 ============
import { l1RegionConfig, generateL1MapNodes } from './maps/l1-forest';
import { l2ValleyMapRegion, l2ValleyMapNodes } from './maps/l2-valley';
import { l3RegionConfig, generateL3MapNodes } from './maps/l3-ocean';
import { l4RegionConfig, generateL4MapNodes } from './maps/l4-cloud';
import { l5RegionConfig, generateL5MapNodes } from './maps/l5-stars';
import { l6RegionConfig, generateL6MapNodes } from './maps/l6-time';
import { l7RegionConfig, generateL7MapNodes } from './maps/l7-core';

// ============ 故事数据导入 ============
import { l1Stories } from './stories/l1';
import { l2Stories } from './stories/l2';
import { l3Stories } from './stories/l3';
import { l4Stories } from './stories/l4';
import { l5Stories } from './stories/l5';
import { l6Stories } from './stories/l6';
import { l7Stories } from './stories/l7';

// ============ 词典数据导入 ============
import { l1Dictionary } from './dictionary/l1-words';
import { l2Dictionary } from './dictionary/l2-words';
import { l3Dictionary } from './dictionary/l3-words';
import { l4Dictionary } from './dictionary/l4-words';
import { l5Dictionary } from './dictionary/l5-words';
import { l6Dictionary } from './dictionary/l6-words';
import { l7Dictionary } from './dictionary/l7-words';

// ============ 类型定义 ============

export type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface LevelData {
  level: LevelNumber;
  regionConfig: MapRegion;
  getMapNodes: () => MapNode[];
  stories: Story[];
  dictionary: DictionaryEntry[];
}

// ============ 级别数据映射 ============

/**
 * 按级别组织的所有数据
 */
export const levelDataMap: Record<LevelNumber, LevelData> = {
  1: {
    level: 1,
    regionConfig: l1RegionConfig,
    getMapNodes: generateL1MapNodes,
    stories: l1Stories,
    dictionary: l1Dictionary,
  },
  2: {
    level: 2,
    regionConfig: l2ValleyMapRegion,
    getMapNodes: () => l2ValleyMapNodes,
    stories: l2Stories,
    dictionary: l2Dictionary,
  },
  3: {
    level: 3,
    regionConfig: l3RegionConfig,
    getMapNodes: generateL3MapNodes,
    stories: l3Stories,
    dictionary: l3Dictionary,
  },
  4: {
    level: 4,
    regionConfig: l4RegionConfig,
    getMapNodes: generateL4MapNodes,
    stories: l4Stories,
    dictionary: l4Dictionary,
  },
  5: {
    level: 5,
    regionConfig: l5RegionConfig,
    getMapNodes: generateL5MapNodes,
    stories: l5Stories,
    dictionary: l5Dictionary,
  },
  6: {
    level: 6,
    regionConfig: l6RegionConfig,
    getMapNodes: generateL6MapNodes,
    stories: l6Stories,
    dictionary: l6Dictionary,
  },
  7: {
    level: 7,
    regionConfig: l7RegionConfig,
    getMapNodes: generateL7MapNodes,
    stories: l7Stories,
    dictionary: l7Dictionary,
  },
};

// ============ 便捷访问函数 ============

/**
 * 获取指定级别的数据
 */
export const getLevelData = (level: LevelNumber): LevelData => {
  return levelDataMap[level];
};

/**
 * 获取指定级别的区域配置
 */
export const getRegionConfig = (level: LevelNumber): MapRegion => {
  return levelDataMap[level].regionConfig;
};

/**
 * 获取指定级别的地图节点
 */
export const getMapNodes = (level: LevelNumber): MapNode[] => {
  return levelDataMap[level].getMapNodes();
};

/**
 * 获取指定级别的所有故事
 */
export const getStories = (level: LevelNumber): Story[] => {
  return levelDataMap[level].stories;
};

/**
 * 获取指定级别的词典
 */
export const getDictionary = (level: LevelNumber): DictionaryEntry[] => {
  return levelDataMap[level].dictionary;
};

// ============ 跨级别查询函数 ============

/**
 * 所有故事的扁平数组
 */
export const allStories: Story[] = [
  ...l1Stories,
  ...l2Stories,
  ...l3Stories,
  ...l4Stories,
  ...l5Stories,
  ...l6Stories,
  ...l7Stories,
];

/**
 * 所有词典条目
 */
export const allDictionary: DictionaryEntry[] = [
  ...l1Dictionary,
  ...l2Dictionary,
  ...l3Dictionary,
  ...l4Dictionary,
  ...l5Dictionary,
  ...l6Dictionary,
  ...l7Dictionary,
];

/**
 * 根据 storyId 获取故事
 */
export const getStoryById = (storyId: string): Story | undefined => {
  return allStories.find((story) => story.id === storyId);
};

/**
 * 根据 regionId 获取故事列表
 */
export const getStoriesByRegion = (regionId: string): Story[] => {
  return allStories.filter((story) => story.regionId === regionId);
};

/**
 * 根据单词查找词典条目
 */
export const getWordDefinition = (word: string): DictionaryEntry | undefined => {
  const lowerWord = word.toLowerCase();
  return allDictionary.find(
    (entry) => entry.word.toLowerCase() === lowerWord
  );
};

/**
 * 根据级别获取区域 ID
 */
export const getRegionIdByLevel = (level: LevelNumber): string => {
  return `region_l${level}`;
};

/**
 * 从区域 ID 解析级别
 */
export const getLevelFromRegionId = (regionId: string): LevelNumber | null => {
  const match = regionId.match(/region_l(\d)/);
  if (match) {
    const level = parseInt(match[1], 10) as LevelNumber;
    if (level >= 1 && level <= 7) {
      return level;
    }
  }
  return null;
};

/**
 * 所有区域配置列表
 */
export const allRegions: MapRegion[] = [
  l1RegionConfig,
  l2ValleyMapRegion,
  l3RegionConfig,
  l4RegionConfig,
  l5RegionConfig,
  l6RegionConfig,
  l7RegionConfig,
];

/**
 * 获取下一个级别
 */
export const getNextLevel = (currentLevel: LevelNumber): LevelNumber | null => {
  if (currentLevel < 7) {
    return (currentLevel + 1) as LevelNumber;
  }
  return null;
};

/**
 * 获取上一个级别
 */
export const getPrevLevel = (currentLevel: LevelNumber): LevelNumber | null => {
  if (currentLevel > 1) {
    return (currentLevel - 1) as LevelNumber;
  }
  return null;
};

export default {
  levelDataMap,
  getLevelData,
  getRegionConfig,
  getMapNodes,
  getStories,
  getDictionary,
  allStories,
  allDictionary,
  getStoryById,
  getStoriesByRegion,
  getWordDefinition,
  getRegionIdByLevel,
  getLevelFromRegionId,
  allRegions,
  getNextLevel,
  getPrevLevel,
};


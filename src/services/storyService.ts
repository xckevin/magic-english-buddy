/**
 * 故事数据服务
 * 提供故事、词典的查询功能
 */

import type { Story, DictionaryEntry, MapNode } from '@/db';
import {
  allStories,
  allDictionary,
  getStoryById,
  getStoriesByRegion,
  getWordDefinition,
  getLevelData,
  type LevelNumber,
} from '@/data';

// ============ 故事查询 ============

/**
 * 根据故事ID获取故事详情
 */
export const findStoryById = (storyId: string): Story | undefined => {
  return getStoryById(storyId);
};

/**
 * 根据区域ID获取该区域的所有故事
 */
export const findStoriesByRegion = (regionId: string): Story[] => {
  return getStoriesByRegion(regionId);
};

/**
 * 根据级别获取所有故事
 */
export const findStoriesByLevel = (level: LevelNumber): Story[] => {
  return getLevelData(level).stories;
};

/**
 * 获取故事的Quiz数据
 */
export const getStoryQuiz = (storyId: string) => {
  const story = getStoryById(storyId);
  return story?.quiz || [];
};

/**
 * 获取故事的内容段落
 */
export const getStoryContent = (storyId: string) => {
  const story = getStoryById(storyId);
  return story?.content || [];
};

/**
 * 获取故事的元数据
 */
export const getStoryMetadata = (storyId: string) => {
  const story = getStoryById(storyId);
  return story?.metadata || null;
};

// ============ 词典查询 ============

/**
 * 查找单词释义
 */
export const findWordDefinition = (word: string): DictionaryEntry | undefined => {
  return getWordDefinition(word);
};

/**
 * 批量查找单词释义
 */
export const findWordDefinitions = (words: string[]): Map<string, DictionaryEntry> => {
  const result = new Map<string, DictionaryEntry>();
  
  for (const word of words) {
    const definition = getWordDefinition(word);
    if (definition) {
      result.set(word.toLowerCase(), definition);
    }
  }
  
  return result;
};

/**
 * 获取指定级别的所有词汇
 */
export const findDictionaryByLevel = (level: LevelNumber): DictionaryEntry[] => {
  return getLevelData(level).dictionary;
};

/**
 * 搜索词典（模糊匹配）
 */
export const searchDictionary = (query: string, limit = 20): DictionaryEntry[] => {
  const lowerQuery = query.toLowerCase();
  
  return allDictionary
    .filter(
      (entry) =>
        entry.word.toLowerCase().includes(lowerQuery) ||
        entry.meaningCn.includes(query)
    )
    .slice(0, limit);
};

// ============ 地图节点与故事关联 ============

/**
 * 根据地图节点获取对应的故事
 */
export const getStoryByNode = (node: MapNode): Story | undefined => {
  if (!node.storyId) return undefined;
  return getStoryById(node.storyId);
};

/**
 * 获取节点的故事预览信息
 */
export const getNodeStoryPreview = (node: MapNode) => {
  const story = getStoryByNode(node);
  
  if (!story) {
    return {
      title: node.title || '未知关卡',
      titleCn: node.titleCn || '未知关卡',
      emoji: node.emoji || '❓',
      wordCount: 0,
      estimatedTime: 0,
      difficulty: 0,
    };
  }
  
  return {
    title: story.title,
    titleCn: story.titleCn,
    emoji: node.emoji || '📖',
    wordCount: story.metadata.wordCount,
    estimatedTime: story.metadata.estimatedTime,
    difficulty: story.metadata.difficulty,
    coverImage: story.coverImage,
  };
};

/**
 * 获取故事中的所有词汇及其释义
 */
export const getStoryVocabulary = (storyId: string): Map<string, DictionaryEntry> => {
  const story = getStoryById(storyId);
  if (!story) return new Map();
  
  // 提取故事中所有唯一的单词
  const words = new Set<string>();
  for (const paragraph of story.content) {
    for (const wordTiming of paragraph.words) {
      // 清理标点符号
      const cleanWord = wordTiming.word.replace(/[.,!?;:'"]/g, '').toLowerCase();
      if (cleanWord) {
        words.add(cleanWord);
      }
    }
  }
  
  return findWordDefinitions(Array.from(words));
};

// ============ 统计信息 ============

/**
 * 获取级别统计信息
 */
export const getLevelStats = (level: LevelNumber) => {
  const data = getLevelData(level);
  
  return {
    storyCount: data.stories.length,
    wordCount: data.dictionary.length,
    regionName: data.regionConfig.name,
    regionNameCn: data.regionConfig.nameCn,
    theme: data.regionConfig.theme,
  };
};

/**
 * 获取所有级别的概要统计
 */
export const getAllLevelStats = () => {
  const stats = [];
  for (let level = 1; level <= 7; level++) {
    stats.push({
      level: level as LevelNumber,
      ...getLevelStats(level as LevelNumber),
    });
  }
  return stats;
};

export default {
  // 故事
  findStoryById,
  findStoriesByRegion,
  findStoriesByLevel,
  getStoryQuiz,
  getStoryContent,
  getStoryMetadata,
  getStoryByNode,
  getNodeStoryPreview,
  getStoryVocabulary,
  // 词典
  findWordDefinition,
  findWordDefinitions,
  findDictionaryByLevel,
  searchDictionary,
  // 统计
  getLevelStats,
  getAllLevelStats,
};


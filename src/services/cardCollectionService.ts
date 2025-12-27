/**
 * CardCollectionService - 卡牌收集系统服务
 * 管理词汇卡牌的获取、升级、展示
 */

import { db, type UserVocabulary } from '@/db';

// 卡牌稀有度
export type CardRarity = 'white' | 'green' | 'blue' | 'gold';

// 卡牌数据
export interface CardData {
  id: string;
  word: string;
  meaningCn: string;
  emoji: string;
  rarity: CardRarity;
  masteryLevel: 0 | 1 | 2 | 3;
  obtainedAt: number;
  isNew?: boolean;
}

// 稀有度配置
export const RARITY_CONFIG: Record<CardRarity, {
  name: string;
  nameCn: string;
  color: string;
  gradient: string;
  dropRate: number;
  masteryBonus: number;
}> = {
  white: {
    name: 'Common',
    nameCn: '普通',
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
    dropRate: 0.6,
    masteryBonus: 1,
  },
  green: {
    name: 'Uncommon',
    nameCn: '精良',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    dropRate: 0.25,
    masteryBonus: 1.5,
  },
  blue: {
    name: 'Rare',
    nameCn: '稀有',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    dropRate: 0.12,
    masteryBonus: 2,
  },
  gold: {
    name: 'Legendary',
    nameCn: '传说',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    dropRate: 0.03,
    masteryBonus: 3,
  },
};

/**
 * 根据概率随机生成稀有度
 */
export const rollRarity = (): CardRarity => {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
    cumulative += config.dropRate;
    if (roll < cumulative) {
      return rarity as CardRarity;
    }
  }
  
  return 'white';
};

/**
 * 获取用户所有卡牌
 */
export const getUserCards = async (userId: string): Promise<CardData[]> => {
  const vocabulary = await db.userVocabulary
    .where('userId')
    .equals(userId)
    .filter(v => v.isCard)
    .toArray();

  return vocabulary.map(v => ({
    id: v.id,
    word: v.word,
    meaningCn: '', // 需要从字典获取
    emoji: '📝',
    rarity: v.cardRarity || 'white',
    masteryLevel: v.masteryLevel,
    obtainedAt: v.firstSeen,
  }));
};

/**
 * 将单词转换为卡牌
 */
export const convertToCard = async (
  userId: string,
  word: string,
  meaningCn: string,
  emoji: string
): Promise<CardData | null> => {
  const vocabId = `${userId}_${word}`;
  const existing = await db.userVocabulary.get(vocabId);
  
  if (existing?.isCard) {
    // 已经是卡牌，升级掌握度
    const newMastery = Math.min(3, existing.masteryLevel + 1) as 0 | 1 | 2 | 3;
    await db.userVocabulary.update(vocabId, {
      masteryLevel: newMastery,
      correctCount: existing.correctCount + 1,
      lastReviewed: Date.now(),
    });
    
    return {
      id: vocabId,
      word,
      meaningCn,
      emoji,
      rarity: existing.cardRarity || 'white',
      masteryLevel: newMastery,
      obtainedAt: existing.firstSeen,
    };
  }
  
  // 新卡牌
  const rarity = rollRarity();
  const now = Date.now();
  
  const newVocab: UserVocabulary = {
    id: vocabId,
    userId,
    word,
    firstSeen: now,
    lastReviewed: now,
    correctCount: 1,
    wrongCount: 0,
    masteryLevel: 1,
    nextReviewDate: new Date(now + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isCard: true,
    cardRarity: rarity,
  };
  
  await db.userVocabulary.add(newVocab);
  
  return {
    id: vocabId,
    word,
    meaningCn,
    emoji,
    rarity,
    masteryLevel: 1,
    obtainedAt: now,
    isNew: true,
  };
};

/**
 * 获取卡牌统计
 */
export const getCardStats = async (userId: string): Promise<{
  total: number;
  byRarity: Record<CardRarity, number>;
  mastered: number;
}> => {
  const cards = await getUserCards(userId);
  
  const byRarity: Record<CardRarity, number> = {
    white: 0,
    green: 0,
    blue: 0,
    gold: 0,
  };
  
  let mastered = 0;
  
  for (const card of cards) {
    byRarity[card.rarity]++;
    if (card.masteryLevel >= 3) {
      mastered++;
    }
  }
  
  return {
    total: cards.length,
    byRarity,
    mastered,
  };
};

/**
 * 获取卡牌收集进度
 */
export const getCollectionProgress = async (userId: string, level: number): Promise<{
  collected: number;
  total: number;
  percentage: number;
}> => {
  // 假设每个等级有特定数量的单词
  const totalWordsPerLevel: Record<number, number> = {
    1: 60,
    2: 80,
    3: 100,
    4: 120,
    5: 150,
    6: 180,
    7: 200,
  };
  
  const total = totalWordsPerLevel[level] || 60;
  const collected = (await getUserCards(userId)).length;
  
  return {
    collected,
    total,
    percentage: Math.round((collected / total) * 100),
  };
};

export default {
  rollRarity,
  getUserCards,
  convertToCard,
  getCardStats,
  getCollectionProgress,
  RARITY_CONFIG,
};


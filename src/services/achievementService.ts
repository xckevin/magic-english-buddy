/**
 * AchievementService - 成就系统服务
 */

import { db, type Achievement } from '@/db';

// 成就定义
export interface AchievementDefinition {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  category: 'learning' | 'reading' | 'streak' | 'collection' | 'special';
  condition: {
    type: string;
    target: number;
  };
  reward: {
    magicPower: number;
    badge?: string;
  };
  hidden?: boolean;
}

// 预定义成就列表
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // 学习类
  {
    id: 'first_story',
    name: 'First Adventure',
    nameCn: '初次冒险',
    description: '完成第一个故事',
    icon: '📖',
    category: 'learning',
    condition: { type: 'stories_completed', target: 1 },
    reward: { magicPower: 10 },
  },
  {
    id: 'story_collector_10',
    name: 'Story Collector',
    nameCn: '故事收藏家',
    description: '完成 10 个故事',
    icon: '📚',
    category: 'learning',
    condition: { type: 'stories_completed', target: 10 },
    reward: { magicPower: 50 },
  },
  {
    id: 'story_master_30',
    name: 'Story Master',
    nameCn: '故事大师',
    description: '完成 30 个故事',
    icon: '🎓',
    category: 'learning',
    condition: { type: 'stories_completed', target: 30 },
    reward: { magicPower: 150 },
  },
  
  // 阅读类
  {
    id: 'first_word',
    name: 'Word Learner',
    nameCn: '单词学徒',
    description: '学习第一个单词',
    icon: '📝',
    category: 'reading',
    condition: { type: 'words_learned', target: 1 },
    reward: { magicPower: 5 },
  },
  {
    id: 'word_collector_50',
    name: 'Vocabulary Builder',
    nameCn: '词汇小达人',
    description: '学习 50 个单词',
    icon: '🔤',
    category: 'reading',
    condition: { type: 'words_learned', target: 50 },
    reward: { magicPower: 30 },
  },
  {
    id: 'word_master_200',
    name: 'Word Master',
    nameCn: '词汇大师',
    description: '学习 200 个单词',
    icon: '📖',
    category: 'reading',
    condition: { type: 'words_learned', target: 200 },
    reward: { magicPower: 100 },
  },
  
  // 连续学习类
  {
    id: 'streak_3',
    name: 'Getting Started',
    nameCn: '小试牛刀',
    description: '连续学习 3 天',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak_days', target: 3 },
    reward: { magicPower: 15 },
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    nameCn: '七日勇士',
    description: '连续学习 7 天',
    icon: '⚔️',
    category: 'streak',
    condition: { type: 'streak_days', target: 7 },
    reward: { magicPower: 50 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Champion',
    nameCn: '月度冠军',
    description: '连续学习 30 天',
    icon: '🏆',
    category: 'streak',
    condition: { type: 'streak_days', target: 30 },
    reward: { magicPower: 200 },
  },
  
  // 收集类
  {
    id: 'first_gold_card',
    name: 'Lucky Draw',
    nameCn: '幸运之星',
    description: '获得第一张传说卡牌',
    icon: '⭐',
    category: 'collection',
    condition: { type: 'gold_cards', target: 1 },
    reward: { magicPower: 30 },
  },
  {
    id: 'card_collector_20',
    name: 'Card Collector',
    nameCn: '卡牌收藏家',
    description: '收集 20 张卡牌',
    icon: '🃏',
    category: 'collection',
    condition: { type: 'total_cards', target: 20 },
    reward: { magicPower: 40 },
  },
  
  // 特殊成就
  {
    id: 'first_evolution',
    name: 'Evolution',
    nameCn: '进化之路',
    description: '完成 Buddy 首次进化',
    icon: '🌟',
    category: 'special',
    condition: { type: 'buddy_stage', target: 2 },
    reward: { magicPower: 100 },
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    nameCn: 'Boss 征服者',
    description: '击败第一个 Boss',
    icon: '👑',
    category: 'special',
    condition: { type: 'bosses_defeated', target: 1 },
    reward: { magicPower: 80 },
  },
  {
    id: 'perfect_quiz',
    name: 'Perfect Score',
    nameCn: '完美答题',
    description: '在 Quiz 中获得满分',
    icon: '💯',
    category: 'special',
    condition: { type: 'perfect_quizzes', target: 1 },
    reward: { magicPower: 25 },
  },
];

/**
 * 获取用户所有成就
 */
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  return await db.achievements.where('userId').equals(userId).toArray();
};

/**
 * 检查并解锁成就
 */
export const checkAndUnlockAchievements = async (
  userId: string,
  stats: {
    storiesCompleted?: number;
    wordsLearned?: number;
    streakDays?: number;
    totalCards?: number;
    goldCards?: number;
    buddyStage?: number;
    bossesDefeated?: number;
    perfectQuizzes?: number;
  }
): Promise<Achievement[]> => {
  const unlockedAchievements = await getUserAchievements(userId);
  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const def of ACHIEVEMENTS) {
    if (unlockedIds.has(def.id)) continue;

    let achieved = false;
    
    switch (def.condition.type) {
      case 'stories_completed':
        achieved = (stats.storiesCompleted || 0) >= def.condition.target;
        break;
      case 'words_learned':
        achieved = (stats.wordsLearned || 0) >= def.condition.target;
        break;
      case 'streak_days':
        achieved = (stats.streakDays || 0) >= def.condition.target;
        break;
      case 'total_cards':
        achieved = (stats.totalCards || 0) >= def.condition.target;
        break;
      case 'gold_cards':
        achieved = (stats.goldCards || 0) >= def.condition.target;
        break;
      case 'buddy_stage':
        achieved = (stats.buddyStage || 1) >= def.condition.target;
        break;
      case 'bosses_defeated':
        achieved = (stats.bossesDefeated || 0) >= def.condition.target;
        break;
      case 'perfect_quizzes':
        achieved = (stats.perfectQuizzes || 0) >= def.condition.target;
        break;
    }

    if (achieved) {
      const achievement: Achievement = {
        id: `${userId}_${def.id}`,
        achievementId: def.id,
        userId,
        unlockedAt: Date.now(),
        claimed: false,
      };
      
      await db.achievements.add(achievement);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
};

/**
 * 领取成就奖励
 */
export const claimAchievementReward = async (
  achievementId: string
): Promise<number> => {
  const achievement = await db.achievements.get(achievementId);
  if (!achievement || achievement.claimed) return 0;

  const def = ACHIEVEMENTS.find(a => a.id === achievement.achievementId);
  if (!def) return 0;

  await db.achievements.update(achievementId, { claimed: true });
  
  // 增加魔力值
  const progress = await db.userProgress.get(achievement.userId);
  if (progress) {
    await db.userProgress.update(achievement.userId, {
      magicPower: progress.magicPower + def.reward.magicPower,
    });
  }

  return def.reward.magicPower;
};

/**
 * 获取成就定义
 */
export const getAchievementDefinition = (achievementId: string): AchievementDefinition | undefined => {
  return ACHIEVEMENTS.find(a => a.id === achievementId);
};

export default {
  ACHIEVEMENTS,
  getUserAchievements,
  checkAndUnlockAchievements,
  claimAchievementReward,
  getAchievementDefinition,
};


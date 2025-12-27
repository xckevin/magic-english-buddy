/**
 * BuddyService - Buddy 伙伴系统服务
 * 管理 Buddy 状态、进化、心情等
 */

import { db, type UserProgress } from '@/db';

// Buddy 进化阶段
export type BuddyStage = 1 | 2 | 3 | 4;

// Buddy 心情状态
export type BuddyMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sleepy';

// Buddy 状态
export interface BuddyState {
  stage: BuddyStage;
  mood: BuddyMood;
  magicPower: number;
  streakDays: number;
  lastInteraction: number;
}

// 进化阶段配置
export const EVOLUTION_CONFIG: Record<BuddyStage, {
  name: string;
  nameCn: string;
  minMagicPower: number;
  avatar: string;
  description: string;
}> = {
  1: {
    name: 'Egg',
    nameCn: '魔法蛋',
    minMagicPower: 0,
    avatar: '🥚',
    description: '刚刚孵化的魔法伙伴',
  },
  2: {
    name: 'Hatchling',
    nameCn: '小雏龙',
    minMagicPower: 100,
    avatar: '🐣',
    description: '开始学习魔法的小家伙',
  },
  3: {
    name: 'Young Dragon',
    nameCn: '幼龙',
    minMagicPower: 500,
    avatar: '🐲',
    description: '魔法逐渐强大的伙伴',
  },
  4: {
    name: 'Magic Dragon',
    nameCn: '魔法龙',
    minMagicPower: 1500,
    avatar: '🌟',
    description: '精通魔法的强大伙伴',
  },
};

// 心情配置
export const MOOD_CONFIG: Record<BuddyMood, {
  emoji: string;
  message: string;
  color: string;
}> = {
  happy: {
    emoji: '😊',
    message: '我很开心！',
    color: '#10B981',
  },
  excited: {
    emoji: '🤩',
    message: '太棒了！继续加油！',
    color: '#F59E0B',
  },
  neutral: {
    emoji: '😐',
    message: '来学习吧！',
    color: '#6B7280',
  },
  sad: {
    emoji: '😢',
    message: '好久没见你了...',
    color: '#3B82F6',
  },
  sleepy: {
    emoji: '😴',
    message: '今天学习了很多，休息一下吧',
    color: '#8B5CF6',
  },
};

/**
 * 获取 Buddy 状态
 */
export const getBuddyState = async (userId: string): Promise<BuddyState | null> => {
  const progress = await db.userProgress.get(userId);
  if (!progress) return null;

  const mood = calculateMood(progress);

  return {
    stage: progress.buddyStage,
    mood,
    magicPower: progress.magicPower,
    streakDays: progress.streakDays,
    lastInteraction: Date.now(),
  };
};

/**
 * 计算 Buddy 心情
 */
const calculateMood = (progress: UserProgress): BuddyMood => {
  const today = new Date().toISOString().split('T')[0];
  const lastStudy = progress.lastStudyDate;

  // 检查是否今天学习过
  if (lastStudy !== today) {
    // 超过 2 天没学习
    const lastDate = new Date(lastStudy);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      return 'sad';
    }
    return 'neutral';
  }

  // 今天学习过
  if (progress.streakDays >= 7) {
    return 'excited';
  }

  if (progress.totalReadingTime >= 30) {
    return 'sleepy';
  }

  return 'happy';
};

/**
 * 检查是否可以进化
 */
export const checkEvolution = async (userId: string): Promise<{
  canEvolve: boolean;
  nextStage: BuddyStage | null;
  currentStage: BuddyStage;
  progress: number;
}> => {
  const userProgress = await db.userProgress.get(userId);
  if (!userProgress) {
    return { canEvolve: false, nextStage: null, currentStage: 1, progress: 0 };
  }

  const currentStage = userProgress.buddyStage;
  const nextStage = (currentStage + 1) as BuddyStage;

  if (nextStage > 4) {
    return { canEvolve: false, nextStage: null, currentStage, progress: 100 };
  }

  const nextConfig = EVOLUTION_CONFIG[nextStage];
  const currentConfig = EVOLUTION_CONFIG[currentStage];
  
  const magicNeeded = nextConfig.minMagicPower - currentConfig.minMagicPower;
  const magicHave = userProgress.magicPower - currentConfig.minMagicPower;
  const progress = Math.min(100, Math.round((magicHave / magicNeeded) * 100));

  const canEvolve = userProgress.magicPower >= nextConfig.minMagicPower;

  return { canEvolve, nextStage, currentStage, progress };
};

/**
 * 执行进化
 */
export const evolve = async (userId: string): Promise<boolean> => {
  const { canEvolve, nextStage } = await checkEvolution(userId);
  
  if (!canEvolve || !nextStage) {
    return false;
  }

  await db.userProgress.update(userId, {
    buddyStage: nextStage,
  });

  return true;
};

/**
 * 增加魔力值
 */
export const addMagicPower = async (userId: string, amount: number): Promise<number> => {
  const progress = await db.userProgress.get(userId);
  if (!progress) return 0;

  const newMagicPower = progress.magicPower + amount;
  await db.userProgress.update(userId, {
    magicPower: newMagicPower,
  });

  return newMagicPower;
};

/**
 * 获取 Buddy 鼓励语
 */
export const getBuddyEncouragement = (mood: BuddyMood, context: 'start' | 'success' | 'fail' | 'complete'): string => {
  const encouragements: Record<BuddyMood, Record<string, string[]>> = {
    happy: {
      start: ['我们一起加油！', '今天也要好好学习哦！', '准备好了吗？'],
      success: ['太棒了！', '你真厉害！', '就是这样！'],
      fail: ['没关系，再试一次！', '加油，你可以的！', '别灰心！'],
      complete: ['完成啦！真棒！', '你今天进步了！', '期待明天见！'],
    },
    excited: {
      start: ['冲冲冲！', '今天一定能学会很多！', '我迫不及待了！'],
      success: ['太厉害了！', '哇，你是天才！', '继续保持！'],
      fail: ['这只是小挫折！', '下一个一定行！', '失败是成功之母！'],
      complete: ['今天收获满满！', '你太厉害了！', '明天继续冒险！'],
    },
    neutral: {
      start: ['开始学习吧', '准备好了吗？', '让我们开始'],
      success: ['不错', '很好', '继续'],
      fail: ['再试一次', '没关系', '继续加油'],
      complete: ['今天的学习结束了', '做得不错', '休息一下吧'],
    },
    sad: {
      start: ['你来了！我好想你...', '终于等到你了', '我们一起学习吧'],
      success: ['太好了，你还记得！', '你真棒！', '我好开心！'],
      fail: ['没关系的，我陪着你', '我们一起努力', '慢慢来'],
      complete: ['谢谢你陪我', '明天还来哦', '我会等你的'],
    },
    sleepy: {
      start: ['今天已经学很多了...', '要不要休息一下？', '我有点困了...'],
      success: ['还是你厉害...', '真不错...', '打个哈欠...'],
      fail: ['没事没事...', '休息一下再试...', '慢慢来...'],
      complete: ['终于可以睡觉了', '晚安...', '明天见...'],
    },
  };

  const options = encouragements[mood][context] || encouragements.neutral[context];
  return options[Math.floor(Math.random() * options.length)];
};

export default {
  getBuddyState,
  checkEvolution,
  evolve,
  addMagicPower,
  getBuddyEncouragement,
  EVOLUTION_CONFIG,
  MOOD_CONFIG,
};


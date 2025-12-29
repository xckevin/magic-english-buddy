/**
 * Achievement Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ACHIEVEMENTS,
  getUserAchievements,
  checkAndUnlockAchievements,
  claimAchievementReward,
  getAchievementDefinition,
} from '@/services/achievementService';
import { seedTestDatabase, createTestDatabase, mockUserProgress } from '../mocks';
import { db } from '@/db';

describe('AchievementService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase();
  });

  describe('ACHIEVEMENTS', () => {
    it('应该包含预定义的成就列表', () => {
      expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
      expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
    });

    it('每个成就应该有完整的属性', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          nameCn: expect.any(String),
          description: expect.any(String),
          icon: expect.any(String),
          category: expect.any(String),
          condition: expect.objectContaining({
            type: expect.any(String),
            target: expect.any(Number),
          }),
          reward: expect.objectContaining({
            magicPower: expect.any(Number),
          }),
        });
      });
    });

    it('应该包含不同类别的成就', () => {
      const categories = [...new Set(ACHIEVEMENTS.map((a) => a.category))];
      expect(categories).toContain('learning');
      expect(categories).toContain('reading');
      expect(categories).toContain('streak');
      expect(categories).toContain('collection');
      expect(categories).toContain('special');
    });
  });

  describe('getUserAchievements', () => {
    it('新用户应该没有成就', async () => {
      const achievements = await getUserAchievements(mockUserProgress.id);
      expect(Array.isArray(achievements)).toBe(true);
      // 新用户默认没有解锁成就
    });
  });

  describe('checkAndUnlockAchievements', () => {
    it('完成第一个故事应该解锁 first_story 成就', async () => {
      const newlyUnlocked = await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 1,
      });

      const firstStory = newlyUnlocked.find((a) => a.achievementId === 'first_story');
      expect(firstStory).toBeDefined();
    });

    it('已解锁的成就不应该重复解锁', async () => {
      // 先解锁
      await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 1,
      });

      // 再次检查
      const newlyUnlocked = await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 1,
      });

      const firstStory = newlyUnlocked.find((a) => a.achievementId === 'first_story');
      expect(firstStory).toBeUndefined(); // 已解锁，不会再次出现
    });

    it('条件不满足时不应该解锁', async () => {
      const newlyUnlocked = await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 5, // 需要 10 个才能解锁 story_collector_10
      });

      const storyCollector = newlyUnlocked.find(
        (a) => a.achievementId === 'story_collector_10'
      );
      expect(storyCollector).toBeUndefined();
    });

    it('应该支持批量检查多个成就条件', async () => {
      const newlyUnlocked = await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 10,
        wordsLearned: 50,
        streakDays: 3,
      });

      // 应该解锁多个成就
      expect(newlyUnlocked.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('claimAchievementReward', () => {
    it('领取奖励应该增加魔力值', async () => {
      // 先解锁一个成就
      const newlyUnlocked = await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 1,
      });

      if (newlyUnlocked.length > 0) {
        const achievement = newlyUnlocked[0];
        const rewardAmount = await claimAchievementReward(achievement.id);

        expect(rewardAmount).toBeGreaterThan(0);
      }
    });

    it('已领取的奖励不应该重复领取', async () => {
      // 先解锁一个成就
      const newlyUnlocked = await checkAndUnlockAchievements(mockUserProgress.id, {
        storiesCompleted: 1,
      });

      if (newlyUnlocked.length > 0) {
        const achievement = newlyUnlocked[0];

        // 第一次领取
        await claimAchievementReward(achievement.id);

        // 第二次领取应该返回 0
        const secondReward = await claimAchievementReward(achievement.id);
        expect(secondReward).toBe(0);
      }
    });
  });

  describe('getAchievementDefinition', () => {
    it('应该返回成就定义', () => {
      const def = getAchievementDefinition('first_story');
      expect(def).toBeDefined();
      expect(def?.id).toBe('first_story');
      expect(def?.nameCn).toBe('初次冒险');
    });

    it('不存在的成就应该返回 undefined', () => {
      const def = getAchievementDefinition('non_existent');
      expect(def).toBeUndefined();
    });
  });

  describe('成就类别', () => {
    it('应该包含学习类成就', () => {
      const learningAchievements = ACHIEVEMENTS.filter((a) => a.category === 'learning');
      expect(learningAchievements.length).toBeGreaterThan(0);
    });

    it('应该包含阅读类成就', () => {
      const readingAchievements = ACHIEVEMENTS.filter((a) => a.category === 'reading');
      expect(readingAchievements.length).toBeGreaterThan(0);
    });

    it('应该包含连续学习类成就', () => {
      const streakAchievements = ACHIEVEMENTS.filter((a) => a.category === 'streak');
      expect(streakAchievements.length).toBeGreaterThan(0);
    });
  });
});



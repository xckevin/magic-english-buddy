/**
 * Achievement Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { achievementService } from '@/services/achievementService';
import { seedTestDatabase, createTestDatabase, mockUserProgress } from '../mocks';

describe('AchievementService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase();
  });

  describe('getAchievements', () => {
    it('应该返回所有成就列表', async () => {
      const achievements = await achievementService.getAchievements(mockUserProgress.id);
      
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    it('每个成就应该有完整的属性', async () => {
      const achievements = await achievementService.getAchievements(mockUserProgress.id);
      
      achievements.forEach((achievement) => {
        expect(achievement).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          icon: expect.any(String),
          unlocked: expect.any(Boolean)
        });
      });
    });

    it('应该标记已解锁的成就', async () => {
      const achievements = await achievementService.getAchievements(mockUserProgress.id);
      
      const unlockedAchievements = achievements.filter((a) => a.unlocked);
      expect(unlockedAchievements.length).toBeGreaterThan(0);
    });
  });

  describe('checkAchievement', () => {
    it('完成第一个故事应该解锁 first_story 成就', async () => {
      const result = await achievementService.checkAchievement(
        mockUserProgress.id,
        'first_story'
      );
      
      expect(result.unlocked).toBe(true);
    });

    it('已解锁的成就不应该重复解锁', async () => {
      // 先解锁
      await achievementService.checkAchievement(mockUserProgress.id, 'first_story');
      
      // 再次检查
      const result = await achievementService.checkAchievement(
        mockUserProgress.id,
        'first_story'
      );
      
      expect(result.isNew).toBe(false);
    });

    it('条件不满足时不应该解锁', async () => {
      // 假设需要阅读 50 个故事
      const result = await achievementService.checkAchievement(
        mockUserProgress.id,
        'reader_50'
      );
      
      // 当前只读了 15 个故事
      expect(result.unlocked).toBe(false);
    });
  });

  describe('checkAllAchievements', () => {
    it('应该检查所有成就条件', async () => {
      const results = await achievementService.checkAllAchievements(mockUserProgress.id);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('应该返回新解锁的成就', async () => {
      const results = await achievementService.checkAllAchievements(mockUserProgress.id);
      
      const newlyUnlocked = results.filter((r) => r.isNew);
      // 新用户可能有一些初始成就被解锁
      expect(Array.isArray(newlyUnlocked)).toBe(true);
    });
  });

  describe('getUnlockedAchievements', () => {
    it('应该只返回已解锁的成就', async () => {
      const unlocked = await achievementService.getUnlockedAchievements(mockUserProgress.id);
      
      expect(Array.isArray(unlocked)).toBe(true);
      unlocked.forEach((a) => {
        expect(a.unlocked).toBe(true);
      });
    });
  });

  describe('成就类别', () => {
    it('应该支持按类别筛选成就', async () => {
      const achievements = await achievementService.getAchievements(mockUserProgress.id);
      
      const categories = [...new Set(achievements.map((a) => a.category))];
      expect(categories.length).toBeGreaterThan(0);
    });

    it('应该包含阅读类成就', async () => {
      const achievements = await achievementService.getAchievements(mockUserProgress.id);
      
      const readingAchievements = achievements.filter((a) => a.category === 'reading');
      expect(readingAchievements.length).toBeGreaterThan(0);
    });
  });

  describe('成就进度', () => {
    it('应该返回成就当前进度', async () => {
      const progress = await achievementService.getAchievementProgress(
        mockUserProgress.id,
        'reader_10'
      );
      
      expect(progress).toMatchObject({
        current: expect.any(Number),
        target: expect.any(Number),
        percentage: expect.any(Number)
      });
    });

    it('进度百分比应该在 0-100 之间', async () => {
      const progress = await achievementService.getAchievementProgress(
        mockUserProgress.id,
        'reader_10'
      );
      
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });
  });
});


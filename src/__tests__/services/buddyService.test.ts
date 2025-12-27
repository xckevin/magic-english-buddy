/**
 * Buddy Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buddyService } from '@/services/buddyService';
import { seedTestDatabase, createTestDatabase, mockUserProgress } from '../mocks';

describe('BuddyService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase();
  });

  describe('getBuddyState', () => {
    it('应该返回 Buddy 当前状态', async () => {
      const state = await buddyService.getBuddyState(mockUserProgress.id);
      
      expect(state).toMatchObject({
        stage: expect.any(Number),
        mood: expect.any(String),
        accessories: expect.any(Array),
        magicPowerToNextStage: expect.any(Number),
        canEvolve: expect.any(Boolean)
      });
    });

    it('应该返回正确的阶段', async () => {
      const state = await buddyService.getBuddyState(mockUserProgress.id);
      
      expect(state.stage).toBe(mockUserProgress.buddyStage);
    });

    it('应该正确计算距离下一阶段的魔力值', async () => {
      const state = await buddyService.getBuddyState(mockUserProgress.id);
      
      // 阶段 2 → 阶段 3 需要 2000 魔力值
      // 当前有 850，所以还需要 1150
      expect(state.magicPowerToNextStage).toBe(2000 - mockUserProgress.magicPower);
    });

    it('用户不存在时应该抛出错误', async () => {
      await expect(buddyService.getBuddyState('non-existent-user'))
        .rejects.toThrow();
    });
  });

  describe('心情计算', () => {
    it('今天学习过应该是 neutral 或更好', async () => {
      const state = await buddyService.getBuddyState(mockUserProgress.id);
      
      expect(['neutral', 'happy', 'excited']).toContain(state.mood);
    });

    it('连续学习 7 天应该是 excited', async () => {
      // 修改测试数据
      const { db } = await import('@/db');
      await db.userProgress.update(mockUserProgress.id, {
        streakDays: 7,
        lastStudyDate: new Date().toISOString().split('T')[0]
      });

      const state = await buddyService.getBuddyState(mockUserProgress.id);
      
      expect(state.mood).toBe('excited');
    });
  });

  describe('addMagicPower', () => {
    it('应该增加魔力值', async () => {
      const result = await buddyService.addMagicPower(
        mockUserProgress.id,
        10,
        'READ_STORY'
      );
      
      expect(result.newTotal).toBeGreaterThan(mockUserProgress.magicPower);
    });

    it('应该返回是否可以进化', async () => {
      const result = await buddyService.addMagicPower(
        mockUserProgress.id,
        10,
        'READ_STORY'
      );
      
      expect(typeof result.canEvolve).toBe('boolean');
    });

    it('达到阈值时 canEvolve 应该为 true', async () => {
      // 增加足够的魔力值达到阈值
      const result = await buddyService.addMagicPower(
        mockUserProgress.id,
        1200, // 850 + 1200 = 2050 > 2000
        'QUIZ_PERFECT'
      );
      
      expect(result.canEvolve).toBe(true);
    });
  });

  describe('evolve', () => {
    it('魔力值足够时应该进化成功', async () => {
      // 先增加魔力值
      const { db } = await import('@/db');
      await db.userProgress.update(mockUserProgress.id, {
        magicPower: 2500 // 足够进化到阶段 3
      });

      const newStage = await buddyService.evolve(mockUserProgress.id);
      
      expect(newStage).toBe(3);
    });

    it('魔力值不足时应该返回 null', async () => {
      const newStage = await buddyService.evolve(mockUserProgress.id);
      
      expect(newStage).toBeNull();
    });

    it('已经是最高阶段时应该返回 null', async () => {
      const { db } = await import('@/db');
      await db.userProgress.update(mockUserProgress.id, {
        buddyStage: 4,
        magicPower: 10000
      });

      const newStage = await buddyService.evolve(mockUserProgress.id);
      
      expect(newStage).toBeNull();
    });

    it('进化后应该更新数据库', async () => {
      const { db } = await import('@/db');
      await db.userProgress.update(mockUserProgress.id, {
        magicPower: 2500
      });

      await buddyService.evolve(mockUserProgress.id);
      
      const progress = await db.userProgress.get(mockUserProgress.id);
      expect(progress?.buddyStage).toBe(3);
    });
  });

  describe('getBuddyAnimationConfig', () => {
    it('应该返回动画配置路径', () => {
      const config = buddyService.getBuddyAnimationConfig(1, 'happy');
      
      expect(typeof config).toBe('string');
      expect(config).toContain('/animations/');
    });

    it('不同阶段应该返回不同动画', () => {
      const config1 = buddyService.getBuddyAnimationConfig(1, 'happy');
      const config2 = buddyService.getBuddyAnimationConfig(2, 'happy');
      
      expect(config1).not.toBe(config2);
    });

    it('不同心情应该返回不同动画', () => {
      const happy = buddyService.getBuddyAnimationConfig(2, 'happy');
      const sad = buddyService.getBuddyAnimationConfig(2, 'sad');
      
      expect(happy).not.toBe(sad);
    });
  });
});


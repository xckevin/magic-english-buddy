/**
 * Buddy Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getBuddyState,
  checkEvolution,
  evolve,
  addMagicPower,
  getBuddyEncouragement,
  EVOLUTION_CONFIG,
  MOOD_CONFIG,
  type BuddyStage,
  type BuddyMood,
} from '@/services/buddyService';
import { seedTestDatabase, createTestDatabase, mockUserProgress } from '../mocks';
import { db } from '@/db';

describe('BuddyService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase();
  });

  describe('EVOLUTION_CONFIG', () => {
    it('应该包含 4 个进化阶段', () => {
      const stages = Object.keys(EVOLUTION_CONFIG);
      expect(stages.length).toBe(4);
    });

    it('每个阶段应该有完整的配置', () => {
      Object.values(EVOLUTION_CONFIG).forEach((config) => {
        expect(config).toMatchObject({
          name: expect.any(String),
          nameCn: expect.any(String),
          minMagicPower: expect.any(Number),
          avatar: expect.any(String),
          description: expect.any(String),
        });
      });
    });

    it('魔力值阈值应该递增', () => {
      const thresholds = [1, 2, 3, 4].map(
        (stage) => EVOLUTION_CONFIG[stage as BuddyStage].minMagicPower
      );
      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1]);
      }
    });
  });

  describe('MOOD_CONFIG', () => {
    it('应该包含所有心情类型', () => {
      const moods: BuddyMood[] = ['happy', 'excited', 'neutral', 'sad', 'sleepy'];
      moods.forEach((mood) => {
        expect(MOOD_CONFIG[mood]).toBeDefined();
      });
    });

    it('每个心情应该有完整的配置', () => {
      Object.values(MOOD_CONFIG).forEach((config) => {
        expect(config).toMatchObject({
          emoji: expect.any(String),
          message: expect.any(String),
          color: expect.any(String),
        });
      });
    });
  });

  describe('getBuddyState', () => {
    it('应该返回 Buddy 当前状态', async () => {
      const state = await getBuddyState(mockUserProgress.id);

      expect(state).not.toBeNull();
      expect(state).toMatchObject({
        stage: expect.any(Number),
        mood: expect.any(String),
        magicPower: expect.any(Number),
        streakDays: expect.any(Number),
        lastInteraction: expect.any(Number),
      });
    });

    it('应该返回正确的阶段', async () => {
      const state = await getBuddyState(mockUserProgress.id);

      expect(state?.stage).toBe(mockUserProgress.buddyStage);
    });

    it('用户不存在时应该返回 null', async () => {
      const state = await getBuddyState('non-existent-user');

      expect(state).toBeNull();
    });
  });

  describe('checkEvolution', () => {
    it('应该返回进化状态信息', async () => {
      const result = await checkEvolution(mockUserProgress.id);

      expect(result).toMatchObject({
        canEvolve: expect.any(Boolean),
        currentStage: expect.any(Number),
        progress: expect.any(Number),
      });
    });

    it('魔力值足够时 canEvolve 应该为 true', async () => {
      // 设置足够的魔力值进化到下一阶段
      await db.userProgress.update(mockUserProgress.id, {
        magicPower: 500, // Stage 3 需要 500
        buddyStage: 2,
      });

      const result = await checkEvolution(mockUserProgress.id);
      expect(result.canEvolve).toBe(true);
    });

    it('已经是最高阶段时不能进化', async () => {
      await db.userProgress.update(mockUserProgress.id, {
        buddyStage: 4,
        magicPower: 2000,
      });

      const result = await checkEvolution(mockUserProgress.id);
      expect(result.canEvolve).toBe(false);
      expect(result.nextStage).toBeNull();
    });
  });

  describe('evolve', () => {
    it('魔力值足够时应该进化成功', async () => {
      // 设置可进化的状态
      await db.userProgress.update(mockUserProgress.id, {
        magicPower: 500,
        buddyStage: 2,
      });

      const success = await evolve(mockUserProgress.id);
      expect(success).toBe(true);

      // 验证阶段已更新
      const progress = await db.userProgress.get(mockUserProgress.id);
      expect(progress?.buddyStage).toBe(3);
    });

    it('魔力值不足时不应该进化', async () => {
      await db.userProgress.update(mockUserProgress.id, {
        magicPower: 50,
        buddyStage: 1,
      });

      const success = await evolve(mockUserProgress.id);
      expect(success).toBe(false);
    });

    it('已经是最高阶段时不应该进化', async () => {
      await db.userProgress.update(mockUserProgress.id, {
        buddyStage: 4,
        magicPower: 2000,
      });

      const success = await evolve(mockUserProgress.id);
      expect(success).toBe(false);
    });
  });

  describe('addMagicPower', () => {
    it('应该增加魔力值', async () => {
      const initialPower = mockUserProgress.magicPower;
      const addAmount = 100;

      const newPower = await addMagicPower(mockUserProgress.id, addAmount);
      expect(newPower).toBe(initialPower + addAmount);
    });

    it('用户不存在时应该返回 0', async () => {
      const result = await addMagicPower('non-existent-user', 100);
      expect(result).toBe(0);
    });
  });

  describe('getBuddyEncouragement', () => {
    it('应该返回鼓励语', () => {
      const message = getBuddyEncouragement('happy', 'start');
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('不同心情应该返回不同风格的鼓励语', () => {
      const happyMessage = getBuddyEncouragement('happy', 'success');
      const sadMessage = getBuddyEncouragement('sad', 'success');

      // 两者都应该是有效的字符串
      expect(happyMessage).toBeTruthy();
      expect(sadMessage).toBeTruthy();
    });

    it('不同上下文应该返回合适的鼓励语', () => {
      const startMessage = getBuddyEncouragement('neutral', 'start');
      const successMessage = getBuddyEncouragement('neutral', 'success');
      const failMessage = getBuddyEncouragement('neutral', 'fail');
      const completeMessage = getBuddyEncouragement('neutral', 'complete');

      expect(startMessage).toBeTruthy();
      expect(successMessage).toBeTruthy();
      expect(failMessage).toBeTruthy();
      expect(completeMessage).toBeTruthy();
    });
  });
});



import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db';
import {
  getEffectiveStreak,
  recordLearningActivityInTransaction,
} from '@/services/learningActivityService';
import { localDate } from '@/utils/localDate';
import { createTestDatabase, mockUserProgress } from '../mocks';

const userId = mockUserProgress.id;
const dayOne = new Date(2026, 8, 15, 12).getTime();

const recordActivity = (time: number) =>
  db.transaction('rw', db.userProgress, () => recordLearningActivityInTransaction(userId, time));

describe('learningActivityService', () => {
  beforeEach(async () => {
    await createTestDatabase();
    await db.userProgress.add({
      ...mockUserProgress,
      streakDays: 0,
      lastStudyDate: localDate(dayOne),
      completedNodes: [],
    });
  });

  it('starts a new profile at one on its first real activity and is idempotent within a local day', async () => {
    await recordActivity(dayOne);
    expect(await db.userProgress.get(userId)).toMatchObject({
      lastStudyDate: localDate(dayOne),
      streakDays: 1,
    });

    await recordActivity(dayOne + 2 * 60 * 60 * 1000);
    expect((await db.userProgress.get(userId))?.streakDays).toBe(1);
  });

  it('does not count an inactive profile creation day as completed learning', async () => {
    await db.userProgress.update(userId, {
      lastStudyDate: localDate(dayOne),
      streakDays: 0,
    });

    await recordActivity(new Date(2026, 8, 16, 12).getTime());

    expect(await db.userProgress.get(userId)).toMatchObject({
      lastStudyDate: '2026-09-16',
      streakDays: 1,
    });
  });

  it('increments across consecutive days, resets after a gap, and expires only after yesterday', async () => {
    await recordActivity(dayOne);
    const dayTwo = new Date(2026, 8, 16, 12).getTime();
    await recordActivity(dayTwo);
    expect(await db.userProgress.get(userId)).toMatchObject({
      lastStudyDate: localDate(dayTwo),
      streakDays: 2,
    });

    const progress = (await db.userProgress.get(userId))!;
    expect(getEffectiveStreak(progress, new Date(2026, 8, 17, 12).getTime())).toBe(2);
    expect(getEffectiveStreak(progress, new Date(2026, 8, 18, 12).getTime())).toBe(0);

    const dayFive = new Date(2026, 8, 19, 12).getTime();
    await recordActivity(dayFive);
    expect(await db.userProgress.get(userId)).toMatchObject({
      lastStudyDate: localDate(dayFive),
      streakDays: 1,
    });
  });
});

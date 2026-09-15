import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/db';
import { readingProgressService } from '@/services/readingProgressService';
import { createTestDatabase, mockUserProgress } from '../mocks';

const userId = mockUserProgress.id;

describe('readingProgressService', () => {
  beforeEach(async () => {
    await createTestDatabase();
    await db.userProgress.add({
      ...mockUserProgress,
      totalStoriesRead: 0,
      totalReadingTime: 0,
      streakDays: 0,
      lastStudyDate: '2020-01-01',
    });
    readingProgressService.cancelSession();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 15, 12, 0, 0));
  });

  afterEach(async () => {
    readingProgressService.cancelSession();
    vi.useRealTimers();
    await createTestDatabase();
  });

  it('未完成阅读会保存历史和时长，但不会增加已读故事或学习连续天数', async () => {
    readingProgressService.startSession('story-in-progress', 2);
    vi.advanceTimersByTime(61_000);
    await readingProgressService.endSession(userId, false);

    const progress = await db.userProgress.get(userId);
    expect(progress).toMatchObject({
      totalStoriesRead: 0,
      totalReadingTime: 1,
      streakDays: 0,
      lastStudyDate: '2020-01-01',
    });
    expect(await db.readingHistory.where('userId').equals(userId).count()).toBe(1);
  });

  it('重复完成同一故事只计一次已读，并在首次完成当天开始连续学习', async () => {
    readingProgressService.startSession('story-repeat');
    vi.advanceTimersByTime(61_000);
    await readingProgressService.endSession(userId, true);

    readingProgressService.startSession('story-repeat');
    vi.advanceTimersByTime(61_000);
    await readingProgressService.endSession(userId, true);

    const progress = await db.userProgress.get(userId);
    expect(progress).toMatchObject({
      totalStoriesRead: 1,
      totalReadingTime: 2,
      streakDays: 1,
      lastStudyDate: '2026-09-15',
    });
  });

  it('并发结束同一会话会复用保存结果，避免写入重复历史', async () => {
    readingProgressService.startSession('story-concurrent');
    vi.advanceTimersByTime(61_000);

    const [first, second] = await Promise.all([
      readingProgressService.endSession(userId, true),
      readingProgressService.endSession(userId, true),
    ]);

    expect(first?.id).toBe(second?.id);
    expect(await db.readingHistory.where('userId').equals(userId).count()).toBe(1);
  });

  it('事务失败会回滚历史与统计，并保留会话供重试', async () => {
    readingProgressService.startSession('story-retry');
    vi.advanceTimersByTime(61_000);
    const updateSpy = vi
      .spyOn(db.userProgress, 'update')
      .mockRejectedValueOnce(new Error('write failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(readingProgressService.endSession(userId, true)).resolves.toBeNull();
    consoleSpy.mockRestore();
    expect(await db.readingHistory.where('userId').equals(userId).count()).toBe(0);
    expect(readingProgressService.getCurrentSession()).not.toBeNull();

    updateSpy.mockRestore();
    await expect(readingProgressService.endSession(userId, true)).resolves.toMatchObject({
      storyId: 'story-retry',
      completed: true,
    });
    expect(await db.readingHistory.where('userId').equals(userId).count()).toBe(1);
    expect(readingProgressService.getCurrentSession()).toBeNull();
  });

  it('没有用户进度记录时会回滚历史，避免留下孤立阅读记录', async () => {
    readingProgressService.startSession('story-without-progress');
    vi.advanceTimersByTime(61_000);
    await db.userProgress.delete(userId);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(readingProgressService.endSession(userId, true)).resolves.toBeNull();
    consoleSpy.mockRestore();

    expect(await db.readingHistory.where('userId').equals(userId).count()).toBe(0);
    expect(readingProgressService.getCurrentSession()).not.toBeNull();
  });

  it('地图节点更新失败时不会留下部分完成或解锁状态', async () => {
    await db.mapNodes.bulkAdd([
      {
        id: 'story-node',
        regionId: 'r1',
        type: 'story',
        storyId: 'story-map',
        position: { x: 0, y: 0 },
        prerequisites: [],
        rewards: {},
        completed: false,
        unlocked: true,
      },
      {
        id: 'dependent-node',
        regionId: 'r1',
        type: 'story',
        storyId: 'story-next',
        position: { x: 1, y: 0 },
        prerequisites: ['story-node'],
        rewards: {},
        completed: false,
        unlocked: false,
      },
    ]);
    const originalUpdate = db.mapNodes.update.bind(db.mapNodes);
    const updateSpy = vi.spyOn(db.mapNodes, 'update').mockImplementation(async (key, changes) => {
      if (key === 'dependent-node') throw new Error('dependent write failed');
      return originalUpdate(key, changes);
    });

    await expect(readingProgressService.markStoryCompleted('story-map')).rejects.toThrow(
      'dependent write failed'
    );
    updateSpy.mockRestore();

    expect(await db.mapNodes.get('story-node')).toMatchObject({ completed: false });
    expect(await db.mapNodes.get('dependent-node')).toMatchObject({ unlocked: false });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, type Story, type UserProgress } from '@/db';
import { completeStoryQuiz, getLessonAccess } from '@/services/learningCompletionService';

const userId = 'completion-user';
const story: Story = {
  id: 'l1_reward',
  level: 1,
  regionId: 'region_l1',
  title: 'Reward Story',
  titleCn: '奖励故事',
  coverImage: '',
  audioFile: '',
  content: [],
  quiz: [],
  rewards: { magicPower: 15, cards: ['apple', 'red'] },
  metadata: { wordCount: 2, estimatedTime: 1, difficulty: 1 },
};

const progress: UserProgress = {
  id: userId,
  level: 1,
  magicPower: 0,
  buddyStage: 1,
  totalReadingTime: 0,
  totalStoriesRead: 0,
  currentMapNode: 'node_reward',
  unlockedNodes: ['node_reward'],
  achievements: [],
  streakDays: 0,
  lastStudyDate: '2026-09-15',
};

const input = () => ({
  userId,
  storyId: story.id,
  score: 100,
  quizMagicPower: 3,
  answers: [{ questionId: 'q1', userAnswer: 'apple', correctAnswer: 'apple', isCorrect: true }],
});

const clearTables = async () => {
  await Promise.all([
    db.users.clear(),
    db.userProgress.clear(),
    db.stories.clear(),
    db.userVocabulary.clear(),
    db.quizHistory.clear(),
    db.mapNodes.clear(),
    db.achievements.clear(),
  ]);
};

const seed = async (completed = false, totalStoriesRead = 0) => {
  await db.userProgress.add({ ...progress, totalStoriesRead });
  await db.stories.add(story);
  await db.mapNodes.bulkAdd([
    {
      id: 'node_reward',
      regionId: 'region_l1',
      type: 'story',
      storyId: story.id,
      position: { x: 0, y: 0 },
      prerequisites: [],
      rewards: { magicPower: 15 },
      unlocked: true,
      completed,
    },
    {
      id: 'node_next',
      regionId: 'region_l2',
      type: 'story',
      storyId: 'l1_next',
      position: { x: 1, y: 0 },
      prerequisites: ['node_reward'],
      rewards: { magicPower: 15 },
      unlocked: false,
      completed: false,
    },
  ]);
};

describe('learningCompletionService', () => {
  beforeEach(clearTables);
  afterEach(clearTables);

  it('settles the first passing quiz atomically and grants its story rewards once', async () => {
    await seed();

    const result = await completeStoryQuiz(input());

    expect(result).toMatchObject({ firstCompletion: true, awardedMagicPower: 18, level: 2 });
    expect(result.awardedCards.sort()).toEqual(['apple', 'red']);
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 18, level: 2 });
    expect(await db.userVocabulary.where('userId').equals(userId).count()).toBe(2);
    expect(await db.quizHistory.where('userId').equals(userId).count()).toBe(1);
    expect(await db.mapNodes.get('node_reward')).toMatchObject({ completed: true });
    expect(await db.mapNodes.get('node_next')).toMatchObject({ unlocked: true });
    expect(await db.achievements.get(`${userId}_first_story`)).toMatchObject({ claimed: false });
  });

  it('keeps repeat quiz history but does not repeat magic, cards, map transitions, or achievements', async () => {
    await seed();
    await completeStoryQuiz(input());
    const achievementCountAfterFirstPass = await db.achievements
      .where('userId')
      .equals(userId)
      .count();
    const retry = await completeStoryQuiz(input());

    expect(retry).toMatchObject({ firstCompletion: false, awardedMagicPower: 0, awardedCards: [] });
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 18 });
    expect(await db.userVocabulary.where('userId').equals(userId).count()).toBe(2);
    expect(await db.quizHistory.where('userId').equals(userId).count()).toBe(2);
    expect(await db.achievements.where('userId').equals(userId).count()).toBe(
      achievementCountAfterFirstPass
    );
  });

  it('treats a migrated completed map node as a review even without old quiz history', async () => {
    await seed(true);

    const result = await completeStoryQuiz(input());

    expect(result).toMatchObject({ firstCompletion: false, awardedMagicPower: 0 });
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 0 });
    expect(await db.userVocabulary.count()).toBe(0);
    expect(await db.quizHistory.count()).toBe(1);
  });

  it('does not unlock story-completion achievements from reading-only totals or placeholder nodes', async () => {
    await seed(false, 10);
    await db.mapNodes.add({
      id: 'completed-placeholder',
      regionId: 'region_l1',
      type: 'treasure',
      position: { x: 2, y: 0 },
      prerequisites: [],
      rewards: { magicPower: 0 },
      unlocked: true,
      completed: true,
    });

    await completeStoryQuiz(input());

    expect(await db.achievements.get(`${userId}_first_story`)).toBeDefined();
    expect(await db.achievements.get(`${userId}_story_collector_10`)).toBeUndefined();
  });

  it('rejects a locked direct link and rolls back every table when map unlock writing fails', async () => {
    await seed();
    await db.mapNodes.update('node_reward', { unlocked: false });
    await expect(getLessonAccess(userId, story.id)).resolves.toMatchObject({
      allowed: false,
      reason: 'locked',
    });
    await expect(completeStoryQuiz(input())).rejects.toThrow('locked');

    await db.mapNodes.update('node_reward', { unlocked: true });
    const originalUpdate = db.mapNodes.update.bind(db.mapNodes);
    const updateSpy = vi.spyOn(db.mapNodes, 'update').mockImplementation(async (key, changes) => {
      if (key === 'node_next') throw new Error('unlock write failed');
      return originalUpdate(key, changes);
    });
    await expect(completeStoryQuiz(input())).rejects.toThrow('unlock write failed');
    updateSpy.mockRestore();

    expect(await db.quizHistory.count()).toBe(0);
    expect(await db.userVocabulary.count()).toBe(0);
    expect(await db.achievements.count()).toBe(0);
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 0 });
    expect(await db.mapNodes.get('node_reward')).toMatchObject({ completed: false });
    expect(await db.mapNodes.get('node_next')).toMatchObject({ unlocked: false });
  });
});

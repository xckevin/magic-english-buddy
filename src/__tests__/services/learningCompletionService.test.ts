import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, type Story, type UserProgress } from '@/db';
import { completeStoryQuiz } from '@/services/learningCompletionService';

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
  quiz: [
    {
      id: 'q1',
      type: 'image_choice',
      question: 'apple',
      correctAnswer: 'apple',
    },
  ],
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
  completedNodes: [],
  achievements: [],
  streakDays: 0,
  lastStudyDate: '2026-09-15',
};

const input = () => ({
  userId,
  storyId: story.id,
  hintsUsed: 0,
  databaseRevision: '',
  answers: [{ questionId: 'q1', userAnswer: 'apple' }],
});

const clearTables = async () => {
  await Promise.all([
    db.users.clear(),
    db.userProgress.clear(),
    db.stories.clear(),
    db.userVocabulary.clear(),
    db.quizHistory.clear(),
    db.quizDrafts.clear(),
    db.learningMeta.clear(),
    db.mapNodes.clear(),
    db.achievements.clear(),
  ]);
};

const seed = async (totalStoriesRead = 0) => {
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
      completed: false,
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
  afterEach(async () => {
    vi.useRealTimers();
    await clearTables();
  });

  it('settles the first passing quiz atomically and grants its story rewards once', async () => {
    await seed();

    const result = await completeStoryQuiz(input());

    expect(result).toMatchObject({ firstCompletion: true, awardedMagicPower: 18, level: 2 });
    expect(result.awardedCards.sort()).toEqual(['apple', 'red']);
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 18, level: 2 });
    expect(await db.userVocabulary.where('userId').equals(userId).count()).toBe(2);
    expect(await db.quizHistory.where('userId').equals(userId).count()).toBe(1);
    expect(await db.mapNodes.get('node_reward')).toMatchObject({ completed: false });
    expect(await db.mapNodes.get('node_next')).toMatchObject({ unlocked: false });
    expect(await db.userProgress.get(userId)).toMatchObject({
      completedNodes: ['node_reward'],
      unlockedNodes: expect.arrayContaining(['node_reward', 'node_next']),
    });
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

  it('records every completed quiz attempt as one local learning day, including replays', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 15, 12));
    await seed();

    await completeStoryQuiz(input());
    expect(await db.userProgress.get(userId)).toMatchObject({
      lastStudyDate: '2026-09-15',
      streakDays: 1,
    });

    await completeStoryQuiz(input());
    expect((await db.userProgress.get(userId))?.streakDays).toBe(1);

    vi.setSystemTime(new Date(2026, 8, 16, 12));
    await completeStoryQuiz(input());
    expect(await db.userProgress.get(userId)).toMatchObject({
      lastStudyDate: '2026-09-16',
      streakDays: 2,
    });
    vi.useRealTimers();
  });

  it('treats a profile-completed node as a review even without old quiz history', async () => {
    await seed();
    await db.userProgress.update(userId, { completedNodes: ['node_reward'] });

    const result = await completeStoryQuiz(input());

    expect(result).toMatchObject({ firstCompletion: false, awardedMagicPower: 0 });
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 0 });
    expect(await db.userVocabulary.count()).toBe(0);
    expect(await db.quizHistory.count()).toBe(1);
  });

  it('recalculates score and rewards from the stored questions instead of submitted correctness', async () => {
    await seed();

    const result = await completeStoryQuiz({
      ...input(),
      hintsUsed: 1,
      answers: [{ questionId: 'q1', userAnswer: 'not apple' }],
    });

    expect(result).toMatchObject({ passed: false, firstCompletion: false, awardedMagicPower: 0 });
    expect(await db.quizHistory.toCollection().first()).toMatchObject({
      score: 0,
      earnedMagicPower: 0,
      questions: [expect.objectContaining({ questionId: 'q1', isCorrect: false })],
    });
    expect((await db.userProgress.get(userId))?.streakDays).toBe(1);
  });

  it('deletes the matching quiz draft in the same completion transaction', async () => {
    await seed();
    await db.quizDrafts.add({
      id: `${userId}:${story.id}`,
      userId,
      storyId: story.id,
      questionFingerprint: 'quiz-v1:test',
      startedAt: Date.now() - 1,
      updatedAt: Date.now(),
      stage: 'result',
      currentQuestionIndex: 0,
      answers: [{ questionId: 'q1', userAnswer: 'apple' }],
      hintsUsed: 0,
      hintedQuestionIds: [],
    });

    await completeStoryQuiz(input());

    await expect(db.quizDrafts.get(`${userId}:${story.id}`)).resolves.toBeUndefined();
  });

  it('does not unlock story-completion achievements from reading-only totals or placeholder nodes', async () => {
    await seed(10);
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

  it('rejects a completion from a tab superseded by backup restore before writing rewards', async () => {
    await seed();
    await db.learningMeta.put({ key: 'restoreRevision', value: 'after-restore' });

    await expect(completeStoryQuiz(input())).rejects.toThrow('重新打开页面');

    expect(await db.quizHistory.count()).toBe(0);
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 0 });
    expect(await db.mapNodes.get('node_reward')).toMatchObject({ completed: false });
  });

  it('rolls back every table when the profile map write fails', async () => {
    await seed();
    const originalUpdate = db.userProgress.update.bind(db.userProgress);
    const updateSpy = vi
      .spyOn(db.userProgress, 'update')
      .mockImplementation(async (key, changes) => {
        if (key === userId) throw new Error('profile map write failed');
        return originalUpdate(key, changes);
      });
    await expect(completeStoryQuiz(input())).rejects.toThrow('profile map write failed');
    updateSpy.mockRestore();

    expect(await db.quizHistory.count()).toBe(0);
    expect(await db.userVocabulary.count()).toBe(0);
    expect(await db.achievements.count()).toBe(0);
    expect(await db.userProgress.get(userId)).toMatchObject({ magicPower: 0 });
    expect(await db.userProgress.get(userId)).toMatchObject({ completedNodes: [] });
  });
});

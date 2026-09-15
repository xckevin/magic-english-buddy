import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, type User, type UserProgress } from '@/db';
import { getLessonAccess } from '@/services/learningCompletionService';
import { getUserMapNodes } from '@/services/mapProgressService';

const ownerId = 'legacy-owner';
const otherId = 'legacy-other';

const user = (id: string, createdAt: number): User => ({
  id,
  name: id,
  buddyName: '伙伴',
  createdAt,
  lastActiveAt: createdAt,
  settings: {
    language: 'zh-CN',
    ttsSpeed: 1,
    soundEnabled: true,
    vibrationEnabled: true,
    autoPlayTTS: true,
    showTranslation: false,
  },
});

const progress = (id: string, unlockedNodes: string[] = []): UserProgress => ({
  id,
  level: 1,
  magicPower: 0,
  buddyStage: 1,
  totalReadingTime: 0,
  totalStoriesRead: 0,
  currentMapNode: 'node_a',
  unlockedNodes,
  achievements: [],
  streakDays: 0,
  lastStudyDate: '2026-09-15',
});

const clear = async () => {
  await Promise.all([
    db.users.clear(),
    db.userProgress.clear(),
    db.stories.clear(),
    db.quizHistory.clear(),
    db.mapNodes.clear(),
    db.learningMeta.clear(),
  ]);
  localStorage.removeItem('magic-english-storage');
};

describe('mapProgressService', () => {
  beforeEach(clear);
  afterEach(clear);

  it('freezes the selected legacy profile as the only owner of shared map flags', async () => {
    localStorage.setItem(
      'magic-english-storage',
      JSON.stringify({ state: { currentUserId: ownerId } })
    );
    await db.users.bulkAdd([user(ownerId, 1), user(otherId, 2)]);
    await db.userProgress.bulkAdd([progress(ownerId), progress(otherId, ['node_a', 'node_b'])]);
    await db.mapNodes.bulkAdd([
      {
        id: 'node_a',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-a',
        position: { x: 0, y: 0 },
        prerequisites: [],
        rewards: { magicPower: 1 },
        completed: true,
        unlocked: true,
      },
      {
        id: 'node_b',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-b',
        position: { x: 1, y: 0 },
        prerequisites: ['node_a'],
        rewards: { magicPower: 1 },
        completed: false,
        unlocked: true,
      },
    ]);
    await db.quizHistory.add({
      id: 'other-passed-b',
      userId: otherId,
      storyId: 'story-b',
      quizType: 'story_quiz',
      questions: [],
      score: 100,
      earnedMagicPower: 0,
      completedAt: 1,
    });

    const ownerNodes = await getUserMapNodes(ownerId);
    const otherNodes = await getUserMapNodes(otherId);

    expect(ownerNodes.find(node => node.id === 'node_a')).toMatchObject({ completed: true });
    expect(otherNodes.find(node => node.id === 'node_a')).toMatchObject({ completed: false });
    expect(otherNodes.find(node => node.id === 'node_b')).toMatchObject({ completed: true });
    expect(await db.userProgress.get(ownerId)).toMatchObject({ completedNodes: ['node_a'] });
    expect(await db.userProgress.get(otherId)).toMatchObject({ completedNodes: ['node_b'] });
    expect(await db.learningMeta.get('mapProgressLegacyOwner:v1')).toMatchObject({
      value: ownerId,
    });

    localStorage.setItem(
      'magic-english-storage',
      JSON.stringify({ state: { currentUserId: otherId } })
    );
    await getUserMapNodes(otherId);
    expect((await db.userProgress.get(otherId))?.completedNodes).toEqual(['node_b']);
    expect((await db.mapNodes.get('node_a'))?.completed).toBe(true);
  });

  it("does not grant lesson access from another profile's completed or unlocked node", async () => {
    await db.users.bulkAdd([user(ownerId, 1), user(otherId, 2)]);
    await db.userProgress.bulkAdd([
      { ...progress(ownerId, ['node_a', 'node_b']), completedNodes: ['node_a'] },
      { ...progress(otherId, ['node_a']), completedNodes: [] },
    ]);
    await db.stories.add({
      id: 'story-b',
      level: 1,
      regionId: 'region_l1',
      title: 'B',
      titleCn: 'B',
      coverImage: '',
      audioFile: '',
      content: [],
      quiz: [{ id: 'q', type: 'image_choice', question: 'q', correctAnswer: 'q' }],
      rewards: { magicPower: 1, cards: [] },
      metadata: { wordCount: 1, estimatedTime: 1, difficulty: 1 },
    });
    await db.mapNodes.bulkAdd([
      {
        id: 'node_a',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-a',
        position: { x: 0, y: 0 },
        prerequisites: [],
        rewards: { magicPower: 1 },
      },
      {
        id: 'node_b',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-b',
        position: { x: 1, y: 0 },
        prerequisites: ['node_a'],
        rewards: { magicPower: 1 },
      },
    ]);

    await expect(getLessonAccess(ownerId, 'story-b')).resolves.toMatchObject({ allowed: true });
    await expect(getLessonAccess(otherId, 'story-b')).resolves.toMatchObject({
      allowed: false,
      reason: 'locked',
    });
  });

  it("keeps the legacy owner's passed lessons and saved unlocks when shared flags are incomplete", async () => {
    localStorage.setItem(
      'magic-english-storage',
      JSON.stringify({ state: { currentUserId: ownerId } })
    );
    await db.users.add(user(ownerId, 1));
    await db.userProgress.add(progress(ownerId, ['node_a', 'node_c']));
    await db.mapNodes.bulkAdd([
      {
        id: 'node_a',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-a',
        position: { x: 0, y: 0 },
        prerequisites: [],
        rewards: { magicPower: 1 },
        unlocked: true,
      },
      {
        id: 'node_b',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-b',
        position: { x: 1, y: 0 },
        prerequisites: ['node_a'],
        rewards: { magicPower: 1 },
      },
      {
        id: 'node_c',
        regionId: 'region_l1',
        type: 'story',
        storyId: 'story-c',
        position: { x: 2, y: 0 },
        prerequisites: ['node_b'],
        rewards: { magicPower: 1 },
      },
    ]);
    await db.quizHistory.bulkAdd([
      {
        id: 'owner-passed-b',
        userId: ownerId,
        storyId: 'story-b',
        quizType: 'story_quiz',
        questions: [],
        score: 100,
        earnedMagicPower: 0,
        completedAt: 1,
      },
      {
        id: 'owner-review-c',
        userId: ownerId,
        storyId: 'story-c',
        quizType: 'review_quiz',
        questions: [],
        score: 100,
        earnedMagicPower: 0,
        completedAt: 2,
      },
    ]);

    const nodes = await getUserMapNodes(ownerId);

    expect(nodes.find(node => node.id === 'node_b')).toMatchObject({ completed: true });
    expect(nodes.find(node => node.id === 'node_c')).toMatchObject({
      completed: false,
      unlocked: true,
    });
    expect(await db.userProgress.get(ownerId)).toMatchObject({
      completedNodes: ['node_b'],
      unlockedNodes: expect.arrayContaining(['node_a', 'node_b', 'node_c']),
    });
  });
});

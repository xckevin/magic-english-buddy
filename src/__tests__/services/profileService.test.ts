import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, createDefaultSettings } from '@/db';
import {
  createLearningProfile,
  listLearningProfiles,
  renameLearningProfile,
  switchLearningProfile,
} from '@/services/profileService';
import { useAppStore } from '@/stores/useAppStore';

const clearProfiles = async () => {
  await Promise.all([db.users.clear(), db.userProgress.clear(), db.learningMeta.clear()]);
  useAppStore.setState({
    currentUserId: null,
    isFirstLaunch: true,
    settings: createDefaultSettings(),
    currentStoryId: 'old-story',
    currentParagraphIndex: 3,
    activeWordIndex: 2,
    currentQuizIndex: 2,
    quizAnswers: { old: 'answer' },
    toastMessage: 'old toast',
    toastType: 'info',
  });
};

describe('profileService', () => {
  beforeEach(clearProfiles);
  afterEach(clearProfiles);

  it('creates and activates a fresh independent profile', async () => {
    const user = await createLearningProfile('  小橙子  ', '  布布 ');

    expect(user).toMatchObject({ name: '小橙子', buddyName: '布布' });
    expect(await db.userProgress.get(user.id)).toMatchObject({
      magicPower: 0,
      unlockedNodes: ['node_l1_01'],
      completedNodes: [],
    });
    expect(await db.learningMeta.get('activeProfileId')).toMatchObject({ value: user.id });
    expect(useAppStore.getState()).toMatchObject({
      currentUserId: user.id,
      isFirstLaunch: false,
      currentStoryId: null,
      currentQuizIndex: 0,
      quizAnswers: {},
    });
  });

  it('switches profiles without carrying temporary lesson state or changing device settings', async () => {
    const first = await createLearningProfile('小橙子', '布布');
    const second = await createLearningProfile('小蓝莓', '云朵');
    useAppStore.setState({
      currentStoryId: 'old-story',
      currentParagraphIndex: 4,
      activeWordIndex: 1,
      currentQuizIndex: 1,
      quizAnswers: { q1: 'apple' },
      settings: { ...createDefaultSettings(), ttsSpeed: 1.2 },
    });

    await switchLearningProfile(first.id);

    expect(await db.learningMeta.get('activeProfileId')).toMatchObject({ value: first.id });
    expect(useAppStore.getState()).toMatchObject({
      currentUserId: first.id,
      currentStoryId: null,
      currentParagraphIndex: 0,
      activeWordIndex: null,
      currentQuizIndex: 0,
      quizAnswers: {},
      settings: expect.objectContaining({ ttsSpeed: 1.2 }),
    });
    expect(second.id).not.toBe(first.id);
  });

  it('renames only the selected stored profile and rejects blank names', async () => {
    const first = await createLearningProfile('小橙子', '布布');
    const second = await createLearningProfile('小蓝莓', '云朵');

    await expect(renameLearningProfile(first.id, '  新名字 ', ' 新伙伴 ')).resolves.toMatchObject({
      name: '新名字',
      buddyName: '新伙伴',
    });
    await expect(renameLearningProfile(second.id, ' ', '伙伴')).rejects.toThrow('学习者名字');

    expect(await listLearningProfiles()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: first.id, name: '新名字', buddyName: '新伙伴' }),
        expect.objectContaining({ id: second.id, name: '小蓝莓', buddyName: '云朵' }),
      ])
    );
  });
});

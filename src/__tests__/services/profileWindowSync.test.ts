import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db, createUser } from '@/db';
import { recordProfileSelection } from '@/services/profileWindowSync';
import { getLearningRevision } from '@/services/learningRevisionService';
import { saveQuizDraft } from '@/services/quizDraftService';
import { allStories } from '@/data';

beforeEach(async () => {
  vi.restoreAllMocks();
  for (const table of db.tables) await table.clear();
});

describe('profile selection commits', () => {
  it('fences writes from an old screen while preserving its already saved quiz draft', async () => {
    const first = await createUser('小明', '云朵');
    const second = await createUser('小红', '星星');
    await recordProfileSelection(first.id);
    const originalRevision = await getLearningRevision();
    const story = allStories.find(story => story.id === 'l1_001')!;
    const snapshot = { stage: 'playing' as const, currentQuestionIndex: 0, answers: [], hintsUsed: 0, hintedQuestionIds: [] };
    await saveQuizDraft(first.id, story.id, story.quiz, snapshot, 1, originalRevision);
    await recordProfileSelection(second.id);
    await expect(saveQuizDraft(first.id, story.id, story.quiz, snapshot, 1, originalRevision)).rejects.toThrow('档案');
    expect(await db.quizDrafts.count()).toBe(1);
    await recordProfileSelection(first.id);
    await expect(saveQuizDraft(first.id, story.id, story.quiz, snapshot, 1, await getLearningRevision())).resolves.toBe(true);
    expect(await db.quizDrafts.count()).toBe(1);
  });
  it('does not change the selected identity or write fence when selecting a missing profile fails', async () => {
    const user = await createUser('小明', '云朵');
    await recordProfileSelection(user.id);
    const revision = await getLearningRevision();
    await expect(recordProfileSelection('missing-user')).rejects.toThrow();
    expect((await db.learningMeta.get('activeProfileId'))?.value).toBe(user.id);
    expect(await getLearningRevision()).toBe(revision);
  });
});

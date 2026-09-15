import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, generateId, type QuizItem } from '@/db';
import { loadQuizDraft, quizDraftId, saveQuizDraft } from '@/services/quizDraftService';

const userId = 'draft-user';
const storyId = 'draft-story';
const questions: QuizItem[] = [
  { id: 'one', type: 'image_choice', question: 'apple', correctAnswer: 'apple' },
  { id: 'two', type: 'image_choice', question: 'sky', correctAnswer: 'blue' },
];
const startedAt = 1_000;

const clearTables = async () => {
  await Promise.all([db.quizDrafts.clear(), db.quizHistory.clear(), db.learningMeta.clear()]);
};

describe('quizDraftService', () => {
  beforeEach(clearTables);
  afterEach(clearTables);

  it('restores answers, feedback stage, and hint costs after a reload', async () => {
    await expect(
      saveQuizDraft(
        userId,
        storyId,
        questions,
        {
          stage: 'feedback',
          currentQuestionIndex: 0,
          answers: [{ questionId: 'one', userAnswer: 'apple' }],
          hintsUsed: 2,
          hintedQuestionIds: ['one'],
        },
        startedAt,
        ''
      )
    ).resolves.toBe(true);

    await expect(loadQuizDraft(userId, storyId, questions)).resolves.toEqual({
      stage: 'feedback',
      currentQuestionIndex: 0,
      answers: [{ questionId: 'one', userAnswer: 'apple' }],
      hintsUsed: 2,
      hintedQuestionIds: ['one'],
      startedAt,
    });
  });

  it('invalidates and deletes a draft when quiz content changes', async () => {
    await saveQuizDraft(
      userId,
      storyId,
      questions,
      {
        stage: 'playing',
        currentQuestionIndex: 1,
        answers: [{ questionId: 'one', userAnswer: 'apple' }],
        hintsUsed: 0,
        hintedQuestionIds: [],
      },
      startedAt,
      ''
    );

    const changedQuestions = [{ ...questions[0], correctAnswer: 'pear' }, questions[1]];
    await expect(loadQuizDraft(userId, storyId, changedQuestions)).resolves.toBeNull();
    await expect(db.quizDrafts.get(quizDraftId(userId, storyId))).resolves.toBeUndefined();
  });

  it('does not recreate a draft from a stale write after that attempt completes', async () => {
    await db.quizHistory.add({
      id: generateId(),
      userId,
      storyId,
      quizType: 'story_quiz',
      questions: [],
      score: 100,
      earnedMagicPower: 0,
      completedAt: startedAt + 1,
    });

    await expect(
      saveQuizDraft(
        userId,
        storyId,
        questions,
        {
          stage: 'playing',
          currentQuestionIndex: 0,
          answers: [],
          hintsUsed: 0,
          hintedQuestionIds: [],
        },
        startedAt,
        ''
      )
    ).resolves.toBe(false);
    await expect(db.quizDrafts.get(quizDraftId(userId, storyId))).resolves.toBeUndefined();
  });

  it('surfaces storage failures for the page to handle without silently dropping a write', async () => {
    const put = vi.spyOn(db.quizDrafts, 'put').mockRejectedValueOnce(new Error('quota exceeded'));

    await expect(
      saveQuizDraft(
        userId,
        storyId,
        questions,
        {
          stage: 'playing',
          currentQuestionIndex: 0,
          answers: [],
          hintsUsed: 0,
          hintedQuestionIds: [],
        },
        startedAt,
        ''
      )
    ).rejects.toThrow('quota exceeded');
    put.mockRestore();
  });

  it('rejects a save from a tab superseded by backup restore', async () => {
    await db.learningMeta.put({ key: 'restoreRevision', value: 'after-restore' });

    await expect(
      saveQuizDraft(
        userId,
        storyId,
        questions,
        {
          stage: 'playing',
          currentQuestionIndex: 0,
          answers: [],
          hintsUsed: 0,
          hintedQuestionIds: [],
        },
        startedAt,
        ''
      )
    ).rejects.toThrow('另一窗口恢复');
    await expect(db.quizDrafts.get(quizDraftId(userId, storyId))).resolves.toBeUndefined();
  });
});

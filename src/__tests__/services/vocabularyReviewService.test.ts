import { beforeEach, describe, expect, it } from 'vitest';
import { db, createUser } from '@/db';
import { convertToCard } from '@/services/cardCollectionService';
import { initDictionary } from '@/services/dataInitService';
import {
  getReviewQuestions,
  recordVocabularyReview,
  reviewDate,
} from '@/services/vocabularyReviewService';

const now = new Date(2026, 8, 15, 12).getTime();
beforeEach(async () => {
  for (const table of db.tables) await table.clear();
  await initDictionary();
});
async function fixture(due = true) {
  const user = await createUser('学习者', '伙伴');
  await convertToCard(user.id, 'apple', '苹果', '🍎');
  await db.userVocabulary.update(`${user.id}_apple`, {
    nextReviewDate: reviewDate(now, due ? -1 : 3),
    lastReviewed: now - 86400000,
  });
  return { user, question: (await getReviewQuestions(user.id, now))[0] };
}
describe('Vocabulary practice', () => {
  it('turns collected words into definition questions and updates due mastery once', async () => {
    const { question } = await fixture();
    expect(question.options).toContain(question.meaning);
    expect(new Set(question.options).size).toBe(4);
    const results = await Promise.all([
      recordVocabularyReview(question, question.meaning, now),
      recordVocabularyReview(question, question.meaning, now),
    ]);
    expect(results.filter(result => result.updated)).toHaveLength(1);
    const word = await db.userVocabulary.get(question.vocabulary.id);
    expect(word?.correctCount).toBe(question.vocabulary.correctCount + 1);
    expect(word?.masteryLevel).toBe(2);
    expect(word?.nextReviewDate).toBe(reviewDate(now, 3));
    expect(await db.userProgress.get(question.vocabulary.userId)).toMatchObject({
      lastStudyDate: reviewDate(now),
      streakDays: 1,
    });
  });
  it('reschedules a wrong answer for tomorrow while preserving card ownership', async () => {
    const { question } = await fixture();
    await recordVocabularyReview(
      question,
      question.options.find(option => option !== question.meaning)!,
      now
    );
    const word = await db.userVocabulary.get(question.vocabulary.id);
    expect(word?.wrongCount).toBe(question.vocabulary.wrongCount + 1);
    expect(word?.masteryLevel).toBe(0);
    expect(word?.nextReviewDate).toBe(reviewDate(now, 1));
    expect(word?.isCard).toBe(true);
  });
  it('allows early practice without awarding additional mastery or counters', async () => {
    const { question } = await fixture(false);
    expect(question.due).toBe(false);
    expect(await recordVocabularyReview(question, question.meaning, now)).toEqual({
      correct: true,
      updated: false,
    });
    expect(await db.userVocabulary.get(question.vocabulary.id)).toEqual(question.vocabulary);
  });
  it('does not mix users or accept a question from before a backup restore', async () => {
    const { question } = await fixture();
    const other = await createUser('另一人', '伙伴');
    expect(await getReviewQuestions(other.id, now)).toEqual([]);
    await db.learningMeta.put({ key: 'restoreRevision', value: 'new' });
    await expect(recordVocabularyReview(question, question.meaning, now)).rejects.toThrow('恢复');
    expect(await db.userVocabulary.get(question.vocabulary.id)).toEqual(question.vocabulary);
  });
});

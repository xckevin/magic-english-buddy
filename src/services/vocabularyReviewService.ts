import { db, type UserVocabulary } from '@/db';
import { dictionaryService } from './dictionaryService';
import { assertLearningRevision, getLearningRevision } from './learningRevisionService';
import { recordLearningActivityInTransaction } from './learningActivityService';

import { localDate as reviewDate } from '@/utils/localDate';
export { localDate as reviewDate } from '@/utils/localDate';

export interface ReviewQuestion {
  vocabulary: UserVocabulary;
  meaning: string;
  options: string[];
  due: boolean;
  databaseRevision: string;
}
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export async function getReviewQuestions(
  userId: string,
  now = Date.now()
): Promise<ReviewQuestion[]> {
  const databaseRevision = await getLearningRevision();
  const words = (await db.userVocabulary.filter(row => row.userId === userId).toArray()).sort(
    (a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate) || a.lastReviewed - b.lastReviewed
  );
  const due = words.filter(word => word.nextReviewDate <= reviewDate(now));
  const selected = (due.length ? due : words).slice(0, 10);
  const dictionary = await db.dictionary.toArray();
  const questions: ReviewQuestion[] = [];
  for (const vocabulary of selected) {
    const entry = await dictionaryService.lookup(vocabulary.word);
    if (!entry) continue;
    const distractors = [
      ...new Set(
        dictionary
          .map(item => item.meaningCn)
          .filter(meaning => meaning && meaning !== entry.meaningCn)
      ),
    ];
    questions.push({
      vocabulary,
      meaning: entry.meaningCn,
      options: shuffle([entry.meaningCn, ...shuffle(distractors).slice(0, 3)]),
      due: vocabulary.nextReviewDate <= reviewDate(now),
      databaseRevision,
    });
  }
  return questions;
}

/** One due review per displayed revision; concurrent tabs cannot count the same review twice. */
export async function recordVocabularyReview(
  question: ReviewQuestion,
  selectedMeaning: string,
  now = Date.now()
): Promise<{ correct: boolean; updated: boolean }> {
  if (!question.options.includes(selectedMeaning)) throw new Error('请选择一个答案。');
  const correct = selectedMeaning === question.meaning;
  return db.transaction('rw', [db.userVocabulary, db.userProgress, db.learningMeta], async () => {
    await assertLearningRevision(question.databaseRevision);
    const row = await db.userVocabulary.get(question.vocabulary.id);
    if (!row || row.userId !== question.vocabulary.userId)
      throw new Error('这张词卡已变更，请重新打开复习。');
    // Future-due words remain available for practice without accelerating mastery.
    if (
      row.lastReviewed !== question.vocabulary.lastReviewed ||
      row.nextReviewDate > reviewDate(now)
    )
      return { correct, updated: false };
    const masteryLevel = correct ? (Math.min(3, row.masteryLevel + 1) as 1 | 2 | 3) : 0;
    const days = correct ? [1, 1, 3, 7][masteryLevel] : 1;
    await db.userVocabulary.update(row.id, {
      lastReviewed: Math.max(now, row.lastReviewed + 1),
      correctCount: row.correctCount + (correct ? 1 : 0),
      wrongCount: row.wrongCount + (correct ? 0 : 1),
      masteryLevel,
      nextReviewDate: reviewDate(now, days),
    });
    await recordLearningActivityInTransaction(row.userId, now);
    return { correct, updated: true };
  });
}

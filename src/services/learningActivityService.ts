/**
 * Shared local-calendar learning activity state.
 *
 * Call `recordLearningActivityInTransaction` only after the activity itself
 * has been persisted and from a transaction that includes `userProgress`.
 * That keeps a failed save from changing a learner's streak.
 */

import { db, type UserProgress } from '@/db';
import { localDate } from '@/utils/localDate';

export interface LearningActivityState {
  lastStudyDate: string;
  streakDays: number;
}

export const nextLearningActivityState = (
  progress: Pick<UserProgress, 'lastStudyDate' | 'streakDays'>,
  now = Date.now()
): LearningActivityState => {
  const today = localDate(now);
  const currentStreak = Math.max(0, progress.streakDays);

  if (progress.lastStudyDate === today) {
    return { lastStudyDate: today, streakDays: Math.max(1, currentStreak) };
  }

  if (progress.lastStudyDate === localDate(now, -1)) {
    return { lastStudyDate: today, streakDays: currentStreak + 1 };
  }

  return { lastStudyDate: today, streakDays: 1 };
};

/**
 * Returns the streak that is still current for display. A streak remains
 * visible through the following local day, then expires until another real
 * learning activity is recorded.
 */
export const getEffectiveStreak = (
  progress: Pick<UserProgress, 'lastStudyDate' | 'streakDays'>,
  now = Date.now()
): number => {
  const validDate =
    progress.lastStudyDate === localDate(now) || progress.lastStudyDate === localDate(now, -1);
  return validDate ? Math.max(0, progress.streakDays) : 0;
};

/**
 * Requires an enclosing Dexie transaction whose table scope includes
 * `db.userProgress`. It does not check the learning revision itself because
 * callers already do so in their encompassing record transaction.
 */
export const recordLearningActivityInTransaction = async (
  userId: string,
  now = Date.now()
): Promise<LearningActivityState> => {
  const progress = await db.userProgress.get(userId);
  if (!progress) throw new Error('Cannot record learning activity without a user progress record');

  const next = nextLearningActivityState(progress, now);
  if (next.lastStudyDate !== progress.lastStudyDate || next.streakDays !== progress.streakDays) {
    await db.userProgress.update(userId, {
      lastStudyDate: next.lastStudyDate,
      streakDays: next.streakDays,
    });
  }
  return next;
};

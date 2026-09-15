/**
 * Atomic lesson completion and access checks.
 *
 * This is the only writer for a passing story quiz. Keeping the history,
 * reward, map transition and achievement work in one transaction makes a
 * failed write retry-safe and prevents replaying a completed lesson from
 * granting rewards again.
 */

import { db, generateId, type Achievement, type MapNode, type Story } from '@/db';
import { readingProgressService } from '@/services/readingProgressService';
import { grantStoryRewardCardsInTransaction } from '@/services/cardCollectionService';
import { checkAndUnlockAchievementsInTransaction } from '@/services/achievementService';

export interface LessonAccess {
  allowed: boolean;
  reason?: 'missing_profile' | 'missing_story' | 'missing_map_node' | 'locked';
  isReview: boolean;
  story?: Story;
  node?: MapNode;
}

export interface QuizCompletionAnswer {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
}

export interface StoryQuizCompletionInput {
  userId: string;
  storyId: string;
  score: number;
  answers: QuizCompletionAnswer[];
  /** The quiz's per-question reward before first-pass rules are applied. */
  quizMagicPower: number;
}

export interface StoryQuizCompletionResult {
  passed: boolean;
  firstCompletion: boolean;
  awardedMagicPower: number;
  awardedCards: string[];
  newlyUnlockedAchievements: Achievement[];
  level: number;
}

const isPassingQuiz = (score: number) => score >= 60;

const getAccess = async (userId: string, storyId: string): Promise<LessonAccess> => {
  const [progress, story, node] = await Promise.all([
    db.userProgress.get(userId),
    db.stories.get(storyId),
    db.mapNodes.where('storyId').equals(storyId).first(),
  ]);
  if (!progress) return { allowed: false, reason: 'missing_profile', isReview: false };
  if (!story) return { allowed: false, reason: 'missing_story', isReview: false };
  if (!node) return { allowed: false, reason: 'missing_map_node', isReview: false, story };
  if (!node.unlocked && !node.completed) {
    return { allowed: false, reason: 'locked', isReview: false, story, node };
  }
  const hasPassedBefore = await db.quizHistory
    .where('userId')
    .equals(userId)
    .filter(record => record.storyId === storyId && isPassingQuiz(record.score))
    .count();
  return {
    allowed: true,
    isReview: Boolean(node.completed) || hasPassedBefore > 0,
    story,
    node,
  };
};

/**
 * Checks a profile, bundled story and the current map unlock state. Challenge
 * nodes can go directly to quiz; this deliberately does not require a reading
 * record.
 */
export const getLessonAccess = (userId: string, storyId: string): Promise<LessonAccess> =>
  getAccess(userId, storyId);

const mapLevel = (node: MapNode): number | null => {
  const match = node.regionId.match(/(?:^|_)l([1-7])(?:_|$)/);
  return match ? Number(match[1]) : null;
};

const calculateLevel = (nodes: MapNode[], fallback: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 => {
  const highest = nodes.reduce((current, node) => {
    const level = mapLevel(node);
    return level && (node.unlocked || node.completed) ? Math.max(current, level) : current;
  }, fallback);
  return Math.min(7, Math.max(1, highest)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

/** Records a quiz attempt and atomically settles only the first passing attempt. */
export const completeStoryQuiz = async (
  input: StoryQuizCompletionInput
): Promise<StoryQuizCompletionResult> =>
  db.transaction(
    'rw',
    [db.quizHistory, db.userProgress, db.stories, db.mapNodes, db.userVocabulary, db.achievements],
    async () => {
      // Recheck inside the transaction so a stale UI cannot settle a now-locked lesson.
      const access = await getAccess(input.userId, input.storyId);
      if (!access.allowed || !access.story || !access.node) {
        throw new Error(`Lesson is not available: ${access.reason ?? 'unknown'}`);
      }
      const progress = await db.userProgress.get(input.userId);
      if (!progress) throw new Error('Learning profile not found');

      const passed = isPassingQuiz(input.score);
      const firstCompletion = passed && !access.isReview;
      const storyReward = firstCompletion ? access.story.rewards.magicPower : 0;
      const quizReward = firstCompletion ? input.quizMagicPower : 0;
      const awardedMagicPower = storyReward + quizReward;
      let awardedCards: string[] = [];

      await db.quizHistory.add({
        id: generateId(),
        userId: input.userId,
        storyId: input.storyId,
        quizType: 'story_quiz',
        questions: input.answers.map(answer => ({ ...answer, timeSpent: 0 })),
        score: input.score,
        earnedMagicPower: awardedMagicPower,
        completedAt: Date.now(),
      });

      if (!firstCompletion) {
        return {
          passed,
          firstCompletion: false,
          awardedMagicPower: 0,
          awardedCards,
          newlyUnlockedAchievements: [],
          level: progress.level,
        };
      }

      await readingProgressService.markStoryCompletedInTransaction(input.storyId);
      awardedCards = await grantStoryRewardCardsInTransaction(
        input.userId,
        access.story.rewards.cards
      );
      const allNodes = await db.mapNodes.toArray();
      const storyIds = new Set((await db.stories.toArray()).map(story => story.id));
      const completedLearningNodes = allNodes.filter(
        node => node.completed && !!node.storyId && storyIds.has(node.storyId)
      );
      const level = calculateLevel(allNodes, Math.max(progress.level, access.story.level));
      const nextProgress = {
        magicPower: progress.magicPower + awardedMagicPower,
        level,
      };
      await db.userProgress.update(input.userId, nextProgress);

      const vocabulary = await db.userVocabulary.where('userId').equals(input.userId).toArray();
      const userQuizHistory = await db.quizHistory.where('userId').equals(input.userId).toArray();
      const newlyUnlockedAchievements = await checkAndUnlockAchievementsInTransaction(
        input.userId,
        {
          // Reading tracks stories the child has read. Achievement completion is
          // intentionally stricter: only a passed, persisted map lesson counts.
          storiesCompleted: completedLearningNodes.length,
          wordsLearned: vocabulary.length,
          streakDays: progress.streakDays,
          totalCards: vocabulary.filter(item => item.isCard).length,
          goldCards: vocabulary.filter(item => item.isCard && item.cardRarity === 'gold').length,
          buddyStage: progress.buddyStage,
          bossesDefeated: completedLearningNodes.filter(item => item.type === 'boss').length,
          perfectQuizzes: userQuizHistory.filter(item => item.score === 100).length,
        }
      );

      return {
        passed: true,
        firstCompletion: true,
        awardedMagicPower,
        awardedCards,
        newlyUnlockedAchievements,
        level,
      };
    }
  );

export default { getLessonAccess, completeStoryQuiz };

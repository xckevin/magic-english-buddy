/**
 * Atomic lesson completion and access checks.
 *
 * This is the only writer for a passing story quiz. Keeping the history,
 * reward, map transition and achievement work in one transaction makes a
 * failed write retry-safe and prevents replaying a completed lesson from
 * granting rewards again.
 */

import { db, generateId, type Achievement, type MapNode, type QuizItem, type Story } from '@/db';
import { grantStoryRewardCardsInTransaction } from '@/services/cardCollectionService';
import { checkAndUnlockAchievementsInTransaction } from '@/services/achievementService';
import { assertLearningRevision } from '@/services/learningRevisionService';
import { recordLearningActivityInTransaction } from '@/services/learningActivityService';
import {
  completeUserStoryMapNodeInTransaction,
  getUserMapNodes,
  getUserMapNodesInTransaction,
} from '@/services/mapProgressService';

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
}

export interface StoryQuizCompletionInput {
  userId: string;
  storyId: string;
  answers: QuizCompletionAnswer[];
  /** Stored for resume only; completion clamps it before calculating rewards. */
  hintsUsed: number;
  /** Captured when the quiz loaded; rejects a tab superseded by restore. */
  databaseRevision: string;
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

const isCorrectAnswer = (question: QuizItem, userAnswer: string | string[]): boolean => {
  if (question.type === 'sentence_order') {
    const correctOrder = question.correctOrder ?? [];
    return (
      Array.isArray(userAnswer) &&
      userAnswer.length === correctOrder.length &&
      userAnswer.every((word, index) => word === correctOrder[index])
    );
  }
  return typeof userAnswer === 'string' && userAnswer === question.correctAnswer;
};

const scoreQuiz = (story: Story, submitted: QuizCompletionAnswer[], hintsUsed: number) => {
  if (!story.quiz.length) throw new Error('Story has no quiz questions');
  const answersByQuestion = new Map<string, string | string[]>();
  for (const answer of submitted) {
    if (!answersByQuestion.has(answer.questionId)) {
      answersByQuestion.set(answer.questionId, answer.userAnswer);
    }
  }
  const answers = story.quiz.map(question => {
    const userAnswer =
      answersByQuestion.get(question.id) ?? (question.type === 'sentence_order' ? [] : '');
    const correctAnswer =
      question.type === 'sentence_order'
        ? (question.correctOrder ?? [])
        : (question.correctAnswer ?? '');
    return {
      questionId: question.id,
      userAnswer,
      correctAnswer,
      isCorrect: isCorrectAnswer(question, userAnswer),
    };
  });
  const correctCount = answers.filter(answer => answer.isCorrect).length;
  const score = Math.round((correctCount / story.quiz.length) * 100);
  // Existing sentence-order UI allows more than one hint. Preserve that actual
  // cost while rejecting malformed or implausibly large persisted values.
  const safeHints =
    Number.isInteger(hintsUsed) && hintsUsed > 0 && hintsUsed <= 1_000 ? hintsUsed : 0;
  return {
    answers,
    score,
    quizMagicPower: Math.max(0, correctCount * 3 - safeHints * 5),
  };
};

const getAccess = async (
  userId: string,
  storyId: string,
  inTransaction = false
): Promise<LessonAccess> => {
  const [progress, story, nodes] = await Promise.all([
    db.userProgress.get(userId),
    db.stories.get(storyId),
    inTransaction ? getUserMapNodesInTransaction(userId) : getUserMapNodes(userId),
  ]);
  if (!progress) return { allowed: false, reason: 'missing_profile', isReview: false };
  if (!story) return { allowed: false, reason: 'missing_story', isReview: false };
  const node = nodes.find(candidate => candidate.storyId === storyId);
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
    [
      db.quizHistory,
      db.quizDrafts,
      db.learningMeta,
      db.users,
      db.userProgress,
      db.stories,
      db.mapNodes,
      db.userVocabulary,
      db.achievements,
    ],
    async () => {
      await assertLearningRevision(input.databaseRevision);
      // Recheck inside the transaction so a stale UI cannot settle a now-locked lesson.
      const access = await getAccess(input.userId, input.storyId, true);
      if (!access.allowed || !access.story || !access.node) {
        throw new Error(`Lesson is not available: ${access.reason ?? 'unknown'}`);
      }
      const progress = await db.userProgress.get(input.userId);
      if (!progress) throw new Error('Learning profile not found');

      const settledQuiz = scoreQuiz(access.story, input.answers, input.hintsUsed);
      const passed = isPassingQuiz(settledQuiz.score);
      const firstCompletion = passed && !access.isReview;
      const storyReward = firstCompletion ? access.story.rewards.magicPower : 0;
      const quizReward = firstCompletion ? settledQuiz.quizMagicPower : 0;
      const awardedMagicPower = storyReward + quizReward;
      let awardedCards: string[] = [];

      await db.quizHistory.add({
        id: generateId(),
        userId: input.userId,
        storyId: input.storyId,
        quizType: 'story_quiz',
        questions: settledQuiz.answers.map(answer => ({ ...answer, timeSpent: 0 })),
        score: settledQuiz.score,
        earnedMagicPower: awardedMagicPower,
        completedAt: Date.now(),
      });
      // Every submitted course quiz is real learning activity, including a
      // failed attempt or replay. Rewards remain first-pass-only below.
      const activity = await recordLearningActivityInTransaction(input.userId);
      // The completion record and draft deletion commit together. An earlier
      // asynchronous draft write is rejected by quizDraftService's startedAt fence.
      await db.quizDrafts.delete(`${input.userId}:${input.storyId}`);

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

      const userMap = await completeUserStoryMapNodeInTransaction(input.userId, input.storyId);
      awardedCards = await grantStoryRewardCardsInTransaction(
        input.userId,
        access.story.rewards.cards
      );
      const storyIds = new Set((await db.stories.toArray()).map(story => story.id));
      const completedLearningNodes = userMap.nodes.filter(
        node => node.completed && !!node.storyId && storyIds.has(node.storyId)
      );
      const level = calculateLevel(userMap.nodes, Math.max(progress.level, access.story.level));
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
          streakDays: activity.streakDays,
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

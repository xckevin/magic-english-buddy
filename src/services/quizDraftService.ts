import { db, type QuizDraft, type QuizDraftAnswer, type QuizItem } from '@/db';
import { assertLearningRevision } from '@/services/learningRevisionService';

export type QuizDraftStage = QuizDraft['stage'];

export interface QuizDraftSnapshot {
  stage: QuizDraftStage;
  currentQuestionIndex: number;
  answers: QuizDraftAnswer[];
  hintsUsed: number;
  hintedQuestionIds: string[];
}

export interface LoadedQuizDraft extends QuizDraftSnapshot {
  startedAt: number;
}

let lastUpdatedAt = 0;

const nextUpdatedAt = () => {
  lastUpdatedAt = Math.max(Date.now(), lastUpdatedAt + 1);
  return lastUpdatedAt;
};

export const quizDraftId = (userId: string, storyId: string) => `${userId}:${storyId}`;

/**
 * A canonical, collision-free representation of only fields that change how a
 * question is displayed or scored. It intentionally stays readable in a
 * local draft so content changes cannot restore an answer to a different quiz.
 */
export const quizFingerprint = (questions: QuizItem[]): string =>
  `quiz-v1:${JSON.stringify(
    questions.map(question => ({
      id: question.id,
      type: question.type,
      question: question.question,
      audioQuestion: question.audioQuestion,
      options: question.options?.map(option => ({
        value: option.value,
        text: option.text,
        image: option.image,
      })),
      shuffledWords: question.shuffledWords,
      correctOrder: question.correctOrder,
      correctAnswer: question.correctAnswer,
      blank: question.blank,
    }))
  )}`;

const isAnswer = (value: unknown): value is QuizDraftAnswer => {
  if (typeof value !== 'object' || value === null) return false;
  const answer = value as QuizDraftAnswer;
  return (
    typeof answer.questionId === 'string' &&
    (typeof answer.userAnswer === 'string' ||
      (Array.isArray(answer.userAnswer) &&
        answer.userAnswer.every(item => typeof item === 'string')))
  );
};

/** Reject malformed, reordered, or partially stale records before rendering them. */
export const validateQuizDraft = (
  draft: QuizDraft,
  userId: string,
  storyId: string,
  questions: QuizItem[]
): LoadedQuizDraft | null => {
  if (
    draft.id !== quizDraftId(userId, storyId) ||
    draft.userId !== userId ||
    draft.storyId !== storyId ||
    draft.questionFingerprint !== quizFingerprint(questions) ||
    !Number.isFinite(draft.startedAt) ||
    !Number.isFinite(draft.updatedAt) ||
    !Number.isInteger(draft.hintsUsed) ||
    draft.hintsUsed < 0 ||
    (draft.hintedQuestionIds !== undefined &&
      (!Array.isArray(draft.hintedQuestionIds) ||
        draft.hintedQuestionIds.some(questionId => typeof questionId !== 'string'))) ||
    !Array.isArray(draft.answers) ||
    !draft.answers.every(isAnswer) ||
    !['playing', 'feedback', 'result'].includes(draft.stage) ||
    !Number.isInteger(draft.currentQuestionIndex) ||
    !questions.length
  ) {
    return null;
  }

  const expectedAnswers =
    draft.stage === 'playing'
      ? draft.currentQuestionIndex
      : draft.stage === 'feedback'
        ? draft.currentQuestionIndex + 1
        : questions.length;
  if (
    draft.currentQuestionIndex < 0 ||
    draft.currentQuestionIndex >= questions.length ||
    draft.answers.length !== expectedAnswers ||
    draft.answers.some((answer, index) => answer.questionId !== questions[index]?.id)
  ) {
    return null;
  }
  const hintedQuestionIds = draft.hintedQuestionIds ?? [];
  const questionIds = new Set(questions.map(question => question.id));
  if (
    new Set(hintedQuestionIds).size !== hintedQuestionIds.length ||
    hintedQuestionIds.some(questionId => !questionIds.has(questionId))
  ) {
    return null;
  }

  return {
    stage: draft.stage,
    currentQuestionIndex: draft.currentQuestionIndex,
    answers: draft.answers.map(answer => ({
      questionId: answer.questionId,
      userAnswer: Array.isArray(answer.userAnswer) ? [...answer.userAnswer] : answer.userAnswer,
    })),
    hintsUsed: draft.hintsUsed,
    hintedQuestionIds: [...hintedQuestionIds],
    startedAt: draft.startedAt,
  };
};

export const loadQuizDraft = async (
  userId: string,
  storyId: string,
  questions: QuizItem[]
): Promise<LoadedQuizDraft | null> => {
  const id = quizDraftId(userId, storyId);
  const draft = await db.quizDrafts.get(id);
  if (!draft) return null;
  const valid = validateQuizDraft(draft, userId, storyId, questions);
  if (valid) return valid;
  await db.quizDrafts.delete(id);
  return null;
};

/**
 * Returns false when a completion transaction has already settled this exact
 * attempt, or when a later snapshot is stored. Callers may safely ignore it.
 */
export const saveQuizDraft = async (
  userId: string,
  storyId: string,
  questions: QuizItem[],
  snapshot: QuizDraftSnapshot,
  startedAt: number,
  databaseRevision: string
): Promise<boolean> => {
  const draft: QuizDraft = {
    id: quizDraftId(userId, storyId),
    userId,
    storyId,
    questionFingerprint: quizFingerprint(questions),
    startedAt,
    updatedAt: nextUpdatedAt(),
    stage: snapshot.stage,
    currentQuestionIndex: snapshot.currentQuestionIndex,
    answers: snapshot.answers.map(answer => ({
      questionId: answer.questionId,
      userAnswer: Array.isArray(answer.userAnswer) ? [...answer.userAnswer] : answer.userAnswer,
    })),
    hintsUsed: snapshot.hintsUsed,
    hintedQuestionIds: [...snapshot.hintedQuestionIds],
  };
  if (!validateQuizDraft(draft, userId, storyId, questions)) {
    throw new Error('Refusing to save an invalid quiz draft');
  }

  return db.transaction('rw', [db.quizDrafts, db.quizHistory, db.learningMeta], async () => {
    await assertLearningRevision(databaseRevision);
    const completedAfterStart = await db.quizHistory
      .where('userId')
      .equals(userId)
      .filter(record => record.storyId === storyId && record.completedAt >= startedAt)
      .count();
    if (completedAfterStart) return false;

    const existing = await db.quizDrafts.get(draft.id);
    if (existing && existing.updatedAt > draft.updatedAt) return false;
    await db.quizDrafts.put(draft);
    return true;
  });
};

export default { loadQuizDraft, saveQuizDraft, validateQuizDraft, quizFingerprint };

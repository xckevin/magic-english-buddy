/**
 * QuizContainer 组件
 * Quiz 练习容器，管理题目流程和状态
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizItem } from '@/db';
import { QuizProgress } from '../QuizProgress';
import { ImageChoice } from '../ImageChoice';
import { WordBuilder } from '../WordBuilder';
import { SentenceOrder } from '../SentenceOrder';
import { FillBlank } from '../FillBlank';
import { QuizFeedback } from '../QuizFeedback';
import { QuizResult } from '../QuizResult';
import type { LoadedQuizDraft, QuizDraftSnapshot } from '@/services/quizDraftService';
import styles from './QuizContainer.module.css';

interface QuizContainerProps {
  /** 题目列表 */
  questions: QuizItem[];
  /** 故事 ID */
  storyId: string;
  /** 完成回调 */
  onComplete: (result: QuizResultData) => Promise<void>;
  /** 退出回调 */
  onExit: () => void;
  /** Completed lessons keep quiz history but do not award repeat rewards. */
  isReview?: boolean;
  /** Fixed story reward that is granted together with a first passing quiz. */
  storyRewardMagicPower?: number;
  /** A validated, unfinished local attempt restored by the page. */
  initialDraft?: LoadedQuizDraft | null;
  /** Created by the page so draft writes from one attempt share one fence. */
  attemptStartedAt?: number;
  /** Persistence is best effort; answering remains usable if storage is unavailable. */
  onDraftChange?: (draft: QuizDraftSnapshot) => Promise<void> | void;
}

export interface QuizResultData {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  earnedMagicPower: number;
  hintsUsed: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string | string[];
  }>;
}

type QuizState = 'playing' | 'feedback' | 'result';

export const isQuizAnswerCorrect = (question: QuizItem, answer: string | string[]): boolean => {
  if (question.type === 'sentence_order') {
    const correctOrder = question.correctOrder || [];
    return (
      Array.isArray(answer) &&
      answer.length === correctOrder.length &&
      answer.every((word, index) => word === correctOrder[index])
    );
  }
  return typeof answer === 'string' && answer === question.correctAnswer;
};

export const QuizContainer: React.FC<QuizContainerProps> = ({
  questions,
  storyId: _storyId, // 保留供后续扩展使用
  onComplete,
  onExit,
  isReview = false,
  storyRewardMagicPower = 0,
  initialDraft = null,
  attemptStartedAt,
  onDraftChange,
}) => {
  // 状态
  const [currentIndex, setCurrentIndex] = useState(initialDraft?.currentQuestionIndex ?? 0);
  const [quizState, setQuizState] = useState<QuizState>(initialDraft?.stage ?? 'playing');
  const [isCorrect, setIsCorrect] = useState(() => {
    if (initialDraft?.stage !== 'feedback') return false;
    const answer = initialDraft.answers.at(-1);
    const question = questions[initialDraft.currentQuestionIndex];
    return Boolean(answer && question && isQuizAnswerCorrect(question, answer.userAnswer));
  });
  const [startTime] = useState(initialDraft?.startedAt ?? attemptStartedAt ?? Date.now());

  // 答题记录
  const [answers, setAnswers] = useState<QuizResultData['answers']>(() =>
    (initialDraft?.answers ?? []).map(answer => {
      const question = questions.find(item => item.id === answer.questionId);
      return {
        ...answer,
        isCorrect: Boolean(question && isQuizAnswerCorrect(question, answer.userAnswer)),
      };
    })
  );
  const [hintsUsed, setHintsUsed] = useState(initialDraft?.hintsUsed ?? 0);
  const [hintedQuestionIds, setHintedQuestionIds] = useState(initialDraft?.hintedQuestionIds ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const answerLockedRef = useRef(false);
  const draftActiveRef = useRef(true);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? (answers.length / questions.length) * 100 : 0;

  const persistDraft = useCallback(
    (snapshot: QuizDraftSnapshot) => {
      if (!draftActiveRef.current || !onDraftChange) return;
      void Promise.resolve(onDraftChange(snapshot)).catch(error => {
        // Saving a draft must never prevent a child from continuing the quiz.
        console.error('Failed to save quiz draft:', error);
      });
    },
    [onDraftChange]
  );

  // 提交答案
  const handleAnswer = useCallback(
    (userAnswer: string | string[]) => {
      if (!currentQuestion || answerLockedRef.current) return;
      answerLockedRef.current = true;
      const correct = isQuizAnswerCorrect(currentQuestion, userAnswer);
      const nextAnswers = [
        ...answers,
        {
          questionId: currentQuestion.id,
          isCorrect: correct,
          userAnswer,
        },
      ];
      setIsCorrect(correct);
      setAnswers(nextAnswers);
      setQuizState('feedback');
      persistDraft({
        stage: 'feedback',
        currentQuestionIndex: currentIndex,
        answers: nextAnswers.map(({ questionId, userAnswer: answer }) => ({
          questionId,
          userAnswer: answer,
        })),
        hintsUsed,
        hintedQuestionIds,
      });
    },
    [answers, currentIndex, currentQuestion, hintedQuestionIds, hintsUsed, persistDraft]
  );

  // 继续下一题
  const handleContinue = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuizState('playing');
      answerLockedRef.current = false;
      persistDraft({
        stage: 'playing',
        currentQuestionIndex: currentIndex + 1,
        answers: answers.map(({ questionId, userAnswer }) => ({ questionId, userAnswer })),
        hintsUsed,
        hintedQuestionIds,
      });
    } else {
      // 完成所有题目
      setQuizState('result');
      persistDraft({
        stage: 'result',
        currentQuestionIndex: currentIndex,
        answers: answers.map(({ questionId, userAnswer }) => ({ questionId, userAnswer })),
        hintsUsed,
        hintedQuestionIds,
      });
    }
  }, [answers, currentIndex, hintedQuestionIds, hintsUsed, persistDraft, questions.length]);

  // 使用提示
  const handleHint = useCallback(() => {
    if (!currentQuestion || hintedQuestionIds.includes(currentQuestion.id)) return;
    const nextHints = hintsUsed + 1;
    const nextHintedQuestionIds = [...hintedQuestionIds, currentQuestion.id];
    setHintsUsed(nextHints);
    setHintedQuestionIds(nextHintedQuestionIds);
    persistDraft({
      stage: quizState,
      currentQuestionIndex: currentIndex,
      answers: answers.map(({ questionId, userAnswer }) => ({ questionId, userAnswer })),
      hintsUsed: nextHints,
      hintedQuestionIds: nextHintedQuestionIds,
    });
  }, [
    answers,
    currentIndex,
    currentQuestion,
    hintedQuestionIds,
    hintsUsed,
    persistDraft,
    quizState,
  ]);

  // 计算结果
  const calculateResult = useCallback((): QuizResultData => {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const wrongCount = answers.length - correctCount;
    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // 魔力值计算：每题正确 +3，错误 0，提示 -5
    const earnedMagicPower = isReview ? 0 : Math.max(0, correctCount * 3 - hintsUsed * 5);

    return {
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      score,
      earnedMagicPower,
      hintsUsed,
      timeSpent,
      answers,
    };
  }, [answers, questions.length, startTime, hintsUsed, isReview]);

  // 完成 Quiz
  const handleFinish = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    const result = calculateResult();
    draftActiveRef.current = false;
    try {
      await onComplete(result);
    } catch {
      draftActiveRef.current = true;
      setSaveError('暂时没能保存这次练习，请检查后重试。');
      setIsSaving(false);
      persistDraft({
        stage: 'result',
        currentQuestionIndex: currentIndex,
        answers: answers.map(({ questionId, userAnswer }) => ({ questionId, userAnswer })),
        hintsUsed,
        hintedQuestionIds,
      });
    }
  }, [
    answers,
    calculateResult,
    currentIndex,
    hintedQuestionIds,
    hintsUsed,
    isSaving,
    onComplete,
    persistDraft,
  ]);

  // 渲染题目
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const commonProps = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      onHint: handleHint,
      hintUsed: hintedQuestionIds.includes(currentQuestion.id),
    };

    switch (currentQuestion.type) {
      case 'image_choice':
        return <ImageChoice {...commonProps} />;
      case 'word_builder':
        return <WordBuilder {...commonProps} />;
      case 'sentence_order':
        return <SentenceOrder {...commonProps} />;
      case 'fill_blank':
        return <FillBlank {...commonProps} />;
      default:
        return <ImageChoice {...commonProps} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* 进度条 */}
      {quizState !== 'result' && (
        <QuizProgress
          current={currentIndex + 1}
          total={questions.length}
          progress={progress}
          onExit={onExit}
        />
      )}

      {/* 题目内容 */}
      <AnimatePresence mode="wait">
        {quizState === 'playing' && (
          <motion.div
            key={`question-${currentIndex}`}
            className={styles.questionArea}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderQuestion()}
          </motion.div>
        )}

        {quizState === 'feedback' && currentQuestion && (
          <motion.div
            key="feedback"
            className={styles.feedbackArea}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizFeedback
              isCorrect={isCorrect}
              correctAnswer={
                currentQuestion.type === 'sentence_order'
                  ? (currentQuestion.correctOrder || []).join(' ')
                  : currentQuestion.correctAnswer || ''
              }
              onContinue={handleContinue}
            />
          </motion.div>
        )}

        {quizState === 'result' && (
          <motion.div
            key="result"
            className={styles.resultArea}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <QuizResult
              result={calculateResult()}
              isReview={isReview}
              storyRewardMagicPower={storyRewardMagicPower}
              onFinish={handleFinish}
              isSaving={isSaving}
              saveError={saveError}
              onRetry={() => {
                setCurrentIndex(0);
                setAnswers([]);
                setHintsUsed(0);
                setHintedQuestionIds([]);
                setQuizState('playing');
                answerLockedRef.current = false;
                persistDraft({
                  stage: 'playing',
                  currentQuestionIndex: 0,
                  answers: [],
                  hintsUsed: 0,
                  hintedQuestionIds: [],
                });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizContainer;

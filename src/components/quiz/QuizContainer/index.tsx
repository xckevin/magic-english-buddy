/**
 * QuizContainer 组件
 * Quiz 练习容器，管理题目流程和状态
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizItem } from '@/db';
import { QuizProgress } from '../QuizProgress';
import { ImageChoice } from '../ImageChoice';
import { WordBuilder } from '../WordBuilder';
import { SentenceOrder } from '../SentenceOrder';
import { FillBlank } from '../FillBlank';
import { QuizFeedback } from '../QuizFeedback';
import { QuizResult } from '../QuizResult';
import styles from './QuizContainer.module.css';

interface QuizContainerProps {
  /** 题目列表 */
  questions: QuizItem[];
  /** 故事 ID */
  storyId: string;
  /** 完成回调 */
  onComplete: (result: QuizResultData) => void;
  /** 退出回调 */
  onExit: () => void;
}

export interface QuizResultData {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  earnedMagicPower: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string | string[];
  }>;
}

type QuizState = 'playing' | 'feedback' | 'result';

export const QuizContainer: React.FC<QuizContainerProps> = ({
  questions,
  storyId,
  onComplete,
  onExit,
}) => {
  // 状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('playing');
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  
  // 答题记录
  const [answers, setAnswers] = useState<QuizResultData['answers']>([]);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // 提交答案
  const handleAnswer = useCallback((userAnswer: string | string[]) => {
    const correct = checkAnswer(currentQuestion, userAnswer);
    setIsCorrect(correct);
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      isCorrect: correct,
      userAnswer,
    }]);
    setQuizState('feedback');
  }, [currentQuestion]);

  // 检查答案
  const checkAnswer = (question: QuizItem, answer: string | string[]): boolean => {
    if (question.type === 'sentence_order') {
      const correctOrder = question.correctOrder || [];
      if (Array.isArray(answer) && answer.length === correctOrder.length) {
        return answer.every((word, i) => word === correctOrder[i]);
      }
      return false;
    }
    return answer === question.correctAnswer;
  };

  // 继续下一题
  const handleContinue = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuizState('playing');
    } else {
      // 完成所有题目
      setQuizState('result');
    }
  }, [currentIndex, questions.length]);

  // 使用提示
  const handleHint = useCallback(() => {
    setHintsUsed(prev => prev + 1);
  }, []);

  // 计算结果
  const calculateResult = useCallback((): QuizResultData => {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const wrongCount = answers.length - correctCount;
    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // 魔力值计算：每题正确 +3，错误 0，提示 -5
    const earnedMagicPower = Math.max(0, correctCount * 3 - hintsUsed * 5);

    return {
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      score,
      earnedMagicPower,
      timeSpent,
      answers,
    };
  }, [answers, questions.length, startTime, hintsUsed]);

  // 完成 Quiz
  const handleFinish = useCallback(() => {
    const result = calculateResult();
    onComplete(result);
  }, [calculateResult, onComplete]);

  // 渲染题目
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const commonProps = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      onHint: handleHint,
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

        {quizState === 'feedback' && (
          <motion.div
            key="feedback"
            className={styles.feedbackArea}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizFeedback
              isCorrect={isCorrect}
              correctAnswer={currentQuestion.correctAnswer || ''}
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
              onFinish={handleFinish}
              onRetry={() => {
                setCurrentIndex(0);
                setAnswers([]);
                setHintsUsed(0);
                setQuizState('playing');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizContainer;


/**
 * FillBlank 组件
 * 填空题型 - 选择正确的单词填入空白处
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizItem } from '@/db';
import styles from './FillBlank.module.css';

interface FillBlankProps {
  /** 题目数据 */
  question: QuizItem;
  /** 提交答案回调 */
  onAnswer: (answer: string, isCorrect: boolean) => void;
  /** 是否已回答 */
  isAnswered?: boolean;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  question,
  onAnswer,
  isAnswered = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = useCallback((value: string) => {
    if (isAnswered) return;
    
    setSelectedOption(value);
    setShowFeedback(true);
    
    const isCorrect = value === question.correctAnswer;
    
    // 延迟提交答案，让用户看到反馈
    setTimeout(() => {
      onAnswer(value, isCorrect);
    }, 800);
  }, [isAnswered, question.correctAnswer, onAnswer]);

  // 解析题目文本，将 _____ 替换为可视化空白
  const renderQuestion = () => {
    const text = question.question;
    const parts = text.split('_____');
    
    return (
      <div className={styles.questionText}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <span className={`${styles.blank} ${selectedOption ? styles.filled : ''}`}>
                {selectedOption || '______'}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const getOptionState = (value: string) => {
    if (!showFeedback) return '';
    if (value === question.correctAnswer) return styles.correct;
    if (value === selectedOption) return styles.wrong;
    return '';
  };

  return (
    <div className={styles.container}>
      {/* 题目文本 */}
      <div className={styles.questionSection}>
        <div className={styles.questionIcon}>📝</div>
        {renderQuestion()}
      </div>

      {/* 选项 */}
      <div className={styles.options}>
        {question.options?.map((option, index) => (
          <motion.button
            key={option.value}
            className={`${styles.option} ${
              selectedOption === option.value ? styles.selected : ''
            } ${getOptionState(option.value)}`}
            onClick={() => handleSelect(option.value)}
            disabled={isAnswered}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: isAnswered ? 1 : 1.02 }}
            whileTap={{ scale: isAnswered ? 1 : 0.98 }}
          >
            <span className={styles.optionLetter}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className={styles.optionText}>{option.text}</span>
            
            {/* 正确/错误图标 */}
            <AnimatePresence>
              {showFeedback && option.value === question.correctAnswer && (
                <motion.span
                  className={styles.correctIcon}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  ✓
                </motion.span>
              )}
              {showFeedback && option.value === selectedOption && option.value !== question.correctAnswer && (
                <motion.span
                  className={styles.wrongIcon}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  ✗
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* 提示 */}
      {!isAnswered && (
        <p className={styles.hint}>选择正确的单词填入空白处</p>
      )}
    </div>
  );
};

export default FillBlank;


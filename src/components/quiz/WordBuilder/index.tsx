/**
 * WordBuilder 组件
 * 单词拼装题型 - 拖拽字母组成单词
 */

import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { QuizItem } from '@/db';
import styles from './WordBuilder.module.css';

interface WordBuilderProps {
  question: QuizItem;
  onAnswer: (answer: string) => void;
  onHint: () => void;
}

export const WordBuilder: React.FC<WordBuilderProps> = ({
  question,
  onAnswer,
  onHint,
}) => {
  // 打乱的字母
  const shuffledLetters = question.shuffledWords || [];
  
  // 已选择的字母
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  // 剩余可选字母
  const [availableLetters, setAvailableLetters] = useState<string[]>(shuffledLetters);

  // 选择字母
  const handleSelectLetter = useCallback((letter: string, index: number) => {
    setSelectedLetters(prev => [...prev, letter]);
    setAvailableLetters(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 移除字母
  const handleRemoveLetter = useCallback((index: number) => {
    const letter = selectedLetters[index];
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    setAvailableLetters(prev => [...prev, letter]);
  }, [selectedLetters]);

  // 提交答案
  const handleSubmit = useCallback(() => {
    const answer = selectedLetters.join('');
    onAnswer(answer);
  }, [selectedLetters, onAnswer]);

  // 清空
  const handleClear = useCallback(() => {
    setSelectedLetters([]);
    setAvailableLetters(shuffledLetters);
  }, [shuffledLetters]);

  // 使用提示
  const handleHint = useCallback(() => {
    onHint();
    // 显示第一个字母
    const correctAnswer = question.correctAnswer || '';
    if (correctAnswer.length > 0 && selectedLetters.length === 0) {
      const firstLetter = correctAnswer[0];
      const letterIndex = availableLetters.indexOf(firstLetter);
      if (letterIndex !== -1) {
        handleSelectLetter(firstLetter, letterIndex);
      }
    }
  }, [onHint, question.correctAnswer, selectedLetters.length, availableLetters, handleSelectLetter]);

  const isComplete = availableLetters.length === 0;

  return (
    <div className={styles.container}>
      {/* 题目区域 */}
      <div className={styles.questionSection}>
        <h2 className={styles.title}>🧩 拼一拼</h2>
        <p className={styles.instruction}>{question.question}</p>
        
        {/* 图片提示 */}
        {question.audioQuestion && (
          <div className={styles.imageHint}>
            <span className={styles.hintEmoji}>
              {question.audioQuestion}
            </span>
          </div>
        )}
      </div>

      {/* 答案区域 */}
      <div className={styles.answerArea}>
        <div className={styles.answerSlots}>
          {selectedLetters.map((letter, index) => (
            <motion.button
              key={`answer-${index}`}
              className={styles.letterSlot}
              onClick={() => handleRemoveLetter(index)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {letter}
            </motion.button>
          ))}
          {/* 空位占位 */}
          {availableLetters.map((_, index) => (
            <div
              key={`empty-${index}`}
              className={styles.emptySlot}
            />
          ))}
        </div>
      </div>

      {/* 可选字母 */}
      <div className={styles.lettersArea}>
        {availableLetters.map((letter, index) => (
          <motion.button
            key={`letter-${index}-${letter}`}
            className={styles.letterBtn}
            onClick={() => handleSelectLetter(letter, index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button className={styles.hintBtn} onClick={handleHint}>
          💡 提示 (-5 MP)
        </button>
        <button className={styles.clearBtn} onClick={handleClear}>
          🔄 重置
        </button>
        <motion.button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!isComplete}
          whileTap={{ scale: 0.95 }}
        >
          ✓ 确认
        </motion.button>
      </div>
    </div>
  );
};

export default WordBuilder;


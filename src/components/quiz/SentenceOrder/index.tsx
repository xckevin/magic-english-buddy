/**
 * SentenceOrder 组件
 * 句子排序题型 - 拖拽单词组成句子
 */

import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { QuizItem } from '@/db';
import styles from './SentenceOrder.module.css';

interface SentenceOrderProps {
  question: QuizItem;
  onAnswer: (answer: string[]) => void;
  onHint: () => void;
}

export const SentenceOrder: React.FC<SentenceOrderProps> = ({
  question,
  onAnswer,
  onHint,
}) => {
  // 打乱的单词
  const shuffledWords = question.shuffledWords || [];
  
  // 当前排序
  const [orderedWords, setOrderedWords] = useState<string[]>(shuffledWords);
  const [submitted, setSubmitted] = useState(false);

  // 提交答案
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    onAnswer(orderedWords);
  }, [orderedWords, onAnswer]);

  // 使用提示
  const handleHint = useCallback(() => {
    onHint();
    // 提示第一个单词
    const correctOrder = question.correctOrder || [];
    if (correctOrder.length > 0) {
      const firstWord = correctOrder[0];
      setOrderedWords(prev => {
        const filtered = prev.filter(w => w !== firstWord);
        return [firstWord, ...filtered];
      });
    }
  }, [onHint, question.correctOrder]);

  return (
    <div className={styles.container}>
      {/* 题目区域 */}
      <div className={styles.questionSection}>
        <h2 className={styles.title}>📝 排一排</h2>
        <p className={styles.instruction}>{question.question}</p>
      </div>

      {/* 排序区域 */}
      <div className={styles.orderArea}>
        <Reorder.Group
          axis="x"
          values={orderedWords}
          onReorder={setOrderedWords}
          className={styles.wordList}
        >
          {orderedWords.map((word, index) => (
            <Reorder.Item
              key={word}
              value={word}
              className={styles.wordItem}
              whileDrag={{ scale: 1.1, zIndex: 10 }}
            >
              <span className={styles.wordIndex}>{index + 1}</span>
              <span className={styles.wordText}>{word}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        
        <p className={styles.dragHint}>👆 拖拽单词调整顺序</p>
      </div>

      {/* 预览句子 */}
      <div className={styles.preview}>
        <p className={styles.previewLabel}>当前句子：</p>
        <p className={styles.previewText}>
          {orderedWords.join(' ')}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button className={styles.hintBtn} onClick={handleHint}>
          💡 提示 (-5 MP)
        </button>
        <motion.button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitted}
          whileTap={{ scale: 0.95 }}
        >
          ✓ 确认答案
        </motion.button>
      </div>
    </div>
  );
};

export default SentenceOrder;


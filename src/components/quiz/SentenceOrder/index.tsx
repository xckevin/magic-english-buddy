/**
 * SentenceOrder 组件
 * 句子排序题型 - 拖拽单词组成句子
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { QuizItem } from '@/db';
import styles from './SentenceOrder.module.css';

interface SentenceOrderProps {
  question: QuizItem;
  onAnswer: (answer: string[]) => void;
  onHint: () => void;
  hintUsed?: boolean;
}

// 带唯一ID的单词类型
interface WordWithId {
  id: string;
  word: string;
}

const placeHintedFirstWord = (words: WordWithId[], correctOrder: string[] | undefined) => {
  const firstWord = correctOrder?.[0];
  if (!firstWord) return words;
  const target = words.find(word => word.word === firstWord);
  return target ? [target, ...words.filter(word => word.id !== target.id)] : words;
};

export const SentenceOrder: React.FC<SentenceOrderProps> = ({
  question,
  onAnswer,
  onHint,
  hintUsed = false,
}) => {
  // 打乱的单词 - 为每个单词生成唯一ID，防止重复单词key冲突
  const shuffledWords = question.shuffledWords || [];

  // 当前排序（带唯一ID）
  const [orderedWords, setOrderedWords] = useState<WordWithId[]>(() =>
    placeHintedFirstWord(
      shuffledWords.map((word, index) => ({ id: `word-${index}`, word })),
      hintUsed ? question.correctOrder : undefined
    )
  );
  const [submitted, setSubmitted] = useState(false);
  const hintRequestedRef = useRef(hintUsed);

  // 提交答案
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    // 提取单词数组
    onAnswer(orderedWords.map(w => w.word));
  }, [orderedWords, onAnswer]);

  // 使用提示
  const handleHint = useCallback(() => {
    if (hintUsed || hintRequestedRef.current) return;
    hintRequestedRef.current = true;
    onHint();
    // 提示第一个单词
    const correctOrder = question.correctOrder || [];
    if (correctOrder.length > 0) {
      const firstWord = correctOrder[0];
      setOrderedWords(prev => {
        const targetItem = prev.find(w => w.word === firstWord);
        if (!targetItem) return prev;
        const filtered = prev.filter(w => w.id !== targetItem.id);
        return [targetItem, ...filtered];
      });
    }
  }, [hintUsed, onHint, question.correctOrder]);

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
          {orderedWords.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className={styles.wordItem}
              whileDrag={{ scale: 1.1, zIndex: 10 }}
            >
              <span className={styles.wordIndex}>{index + 1}</span>
              <span className={styles.wordText}>{item.word}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <p className={styles.dragHint}>👆 拖拽单词调整顺序</p>
      </div>

      {/* 预览句子 */}
      <div className={styles.preview}>
        <p className={styles.previewLabel}>当前句子：</p>
        <p className={styles.previewText}>{orderedWords.map(w => w.word).join(' ')}</p>
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button
          className={styles.hintBtn}
          onClick={handleHint}
          disabled={hintUsed || hintRequestedRef.current}
        >
          {hintUsed || hintRequestedRef.current ? '💡 已使用提示' : '💡 提示 (-5 MP)'}
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

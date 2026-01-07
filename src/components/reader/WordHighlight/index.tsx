/**
 * WordHighlight 组件
 * 带高亮效果的可点击单词，支持 TTS 同步高亮
 */

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './WordHighlight.module.css';

interface WordHighlightProps {
  /** 单词文本 */
  word: string;
  /** 单词索引 */
  index: number;
  /** 是否高亮（TTS 播放时） */
  isHighlighted?: boolean;
  /** 是否已学习 */
  isLearned?: boolean;
  /** 点击单词回调 */
  onClick?: (word: string, index: number) => void;
  /** 长按单词回调 */
  onLongPress?: (word: string, index: number) => void;
}

export const WordHighlight = memo<WordHighlightProps>(({
  word,
  index,
  isHighlighted = false,
  isLearned = false,
  onClick,
  onLongPress,
}) => {
  // 处理点击
  const handleClick = useCallback(() => {
    onClick?.(word, index);
  }, [word, index, onClick]);

  // 处理长按
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress?.(word, index);
  }, [word, index, onLongPress]);

  // 动画变体
  const variants = {
    normal: { scale: 1, backgroundColor: 'transparent' },
    highlighted: { 
      scale: 1.05, 
      backgroundColor: 'var(--color-highlight)',
      transition: { duration: 0.15 }
    },
  };

  return (
    <motion.span
      className={clsx(
        styles.word,
        isHighlighted && styles.highlighted,
        isLearned && styles.learned
      )}
      variants={variants}
      animate={isHighlighted ? 'highlighted' : 'normal'}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      whileTap={{ scale: 0.95 }}
    >
      {word}
    </motion.span>
  );
});

WordHighlight.displayName = 'WordHighlight';

export default WordHighlight;


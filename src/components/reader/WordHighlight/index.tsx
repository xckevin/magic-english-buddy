/**
 * WordHighlight 组件
 * 带高亮效果的可点击单词，支持 TTS 同步高亮
 */

import { memo, useCallback, useRef, useEffect } from 'react';
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

const LONG_PRESS_MS = 500;

export const WordHighlight = memo<WordHighlightProps>(
  ({ word, index, isHighlighted = false, isLearned = false, onClick, onLongPress }) => {
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didLongPress = useRef(false);

    const clearLongPress = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    useEffect(() => clearLongPress, [clearLongPress]);

    const openDictionary = useCallback(() => onClick?.(word, index), [word, index, onClick]);

    const handleClick = useCallback(() => {
      if (didLongPress.current) {
        didLongPress.current = false;
        return;
      }
      openDictionary();
    }, [openDictionary]);

    // 处理长按
    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        onLongPress?.(word, index);
      },
      [word, index, onLongPress]
    );

    const handlePointerDown = useCallback(
      (event: React.PointerEvent) => {
        if (event.pointerType !== 'touch' || !onLongPress) return;
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
          didLongPress.current = true;
          onLongPress(word, index);
        }, LONG_PRESS_MS);
      },
      [word, index, onLongPress]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDictionary();
        }
      },
      [openDictionary]
    );

    // 动画变体
    const variants = {
      normal: { scale: 1, backgroundColor: 'transparent' },
      highlighted: {
        scale: 1.05,
        backgroundColor: 'var(--color-highlight)',
        transition: { duration: 0.15 },
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
        role="button"
        tabIndex={0}
        aria-label={`查询单词 ${word}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onPointerMove={clearLongPress}
        onKeyDown={handleKeyDown}
      >
        {word}
      </motion.span>
    );
  }
);

WordHighlight.displayName = 'WordHighlight';

export default WordHighlight;

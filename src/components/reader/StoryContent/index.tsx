/**
 * StoryContent 组件
 * 故事内容显示区域，包含段落、单词高亮、翻译
 */

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WordHighlight } from '../WordHighlight';
import styles from './StoryContent.module.css';

interface WordData {
  word: string;
  start: number;
  end: number;
  index: number;
}

interface ParagraphData {
  paragraphId: string;
  text: string;
  translation: string;
  audioStart: number;
  audioEnd: number;
  words: WordData[];
}

interface StoryContentProps {
  /** 段落数据 */
  paragraphs: ParagraphData[];
  /** 当前高亮的单词索引 (全局索引) */
  currentWordIndex: number;
  /** 当前段落索引 */
  currentParagraphIndex: number;
  /** 是否显示翻译 */
  showTranslation: boolean;
  /** 已学习的单词列表 */
  learnedWords?: Set<string>;
  /** 单词点击回调 */
  onWordClick?: (word: string, globalIndex: number, paragraphIndex: number) => void;
  /** 单词长按回调 */
  onWordLongPress?: (word: string, globalIndex: number, paragraphIndex: number) => void;
}

export const StoryContent = memo<StoryContentProps>(({
  paragraphs,
  currentWordIndex,
  currentParagraphIndex,
  showTranslation,
  learnedWords = new Set(),
  onWordClick,
  onWordLongPress,
}) => {
  // 计算全局单词索引
  const getGlobalWordIndex = useCallback((paragraphIndex: number, localWordIndex: number) => {
    let globalIndex = 0;
    for (let i = 0; i < paragraphIndex; i++) {
      globalIndex += paragraphs[i]?.words.length || 0;
    }
    return globalIndex + localWordIndex;
  }, [paragraphs]);

  // 处理单词点击
  const handleWordClick = useCallback((word: string, localIndex: number, paragraphIndex: number) => {
    const globalIndex = getGlobalWordIndex(paragraphIndex, localIndex);
    onWordClick?.(word, globalIndex, paragraphIndex);
  }, [getGlobalWordIndex, onWordClick]);

  // 处理单词长按
  const handleWordLongPress = useCallback((word: string, localIndex: number, paragraphIndex: number) => {
    const globalIndex = getGlobalWordIndex(paragraphIndex, localIndex);
    onWordLongPress?.(word, globalIndex, paragraphIndex);
  }, [getGlobalWordIndex, onWordLongPress]);

  return (
    <div className={styles.content}>
      {paragraphs.map((paragraph, paragraphIndex) => {
        // 计算该段落的全局起始索引
        const paragraphStartIndex = getGlobalWordIndex(paragraphIndex, 0);
        const isActiveParagraph = paragraphIndex === currentParagraphIndex;

        return (
          <motion.div
            key={paragraph.paragraphId}
            className={`${styles.paragraph} ${isActiveParagraph ? styles.active : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: paragraphIndex * 0.1 }}
          >
            {/* 英文段落 */}
            <p className={styles.englishText}>
              {paragraph.words.map((wordData, localIndex) => {
                const globalIndex = paragraphStartIndex + localIndex;
                const isHighlighted = globalIndex === currentWordIndex;
                const isLearned = learnedWords.has(wordData.word.toLowerCase().replace(/[.,!?]/g, ''));

                return (
                  <WordHighlight
                    key={`${paragraph.paragraphId}-${localIndex}`}
                    word={wordData.word}
                    index={localIndex}
                    isHighlighted={isHighlighted}
                    isLearned={isLearned}
                    onClick={(word) => handleWordClick(word, localIndex, paragraphIndex)}
                    onLongPress={(word) => handleWordLongPress(word, localIndex, paragraphIndex)}
                  />
                );
              })}
            </p>

            {/* 中文翻译 */}
            <motion.p
              className={styles.translation}
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: showTranslation ? 0.8 : 0,
                height: showTranslation ? 'auto' : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {paragraph.translation}
            </motion.p>
          </motion.div>
        );
      })}
    </div>
  );
});

StoryContent.displayName = 'StoryContent';

export default StoryContent;


/**
 * DictionaryPopup 组件
 * 单词查询弹窗，显示释义、发音、例句
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dictionaryService } from '@/services/dictionaryService';
import { ttsService } from '@/services/ttsService';
import type { DictionaryEntry } from '@/db';
import styles from './DictionaryPopup.module.css';

interface DictionaryPopupProps {
  /** 要查询的单词 */
  word: string | null;
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 添加到生词本回调 */
  onAddToWordbook?: (word: string) => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  word,
  visible,
  onClose,
  onAddToWordbook,
}) => {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 查询单词
  useEffect(() => {
    if (word && visible) {
      setLoading(true);
      dictionaryService.lookup(word).then(result => {
        setEntry(result);
        setLoading(false);
      });
    }
  }, [word, visible]);

  // 播放发音
  const handlePlayPronunciation = useCallback(async () => {
    if (!word || isPlaying) return;
    
    setIsPlaying(true);
    try {
      await ttsService.speakWord(word);
    } finally {
      setIsPlaying(false);
    }
  }, [word, isPlaying]);

  // 添加到生词本
  const handleAddToWordbook = useCallback(() => {
    if (word) {
      onAddToWordbook?.(word);
    }
  }, [word, onAddToWordbook]);

  // 动画配置
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className={styles.popup}
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>

            {loading ? (
              <div className={styles.loading}>
                <span className={styles.spinner} />
                <p>查询中...</p>
              </div>
            ) : entry ? (
              <>
                {/* 单词头部 */}
                <div className={styles.header}>
                  <div className={styles.wordInfo}>
                    <h3 className={styles.word}>{entry.word}</h3>
                    <span className={styles.phonetic}>{entry.phonetic}</span>
                    <span className={styles.partOfSpeech}>{entry.partOfSpeech}</span>
                  </div>
                  <button 
                    className={styles.speakBtn}
                    onClick={handlePlayPronunciation}
                    disabled={isPlaying}
                  >
                    {isPlaying ? '🔊' : '🔈'}
                  </button>
                </div>

                {/* Emoji 图示 */}
                {entry.emoji && (
                  <div className={styles.emojiSection}>
                    <span className={styles.emoji}>{entry.emoji}</span>
                  </div>
                )}

                {/* 释义 */}
                <div className={styles.meanings}>
                  <p className={styles.meaningCn}>{entry.meaningCn}</p>
                  <p className={styles.meaningEn}>{entry.meaningEn}</p>
                </div>

                {/* 例句 */}
                {entry.examples && entry.examples.length > 0 && (
                  <div className={styles.examples}>
                    <h4 className={styles.sectionTitle}>例句</h4>
                    {entry.examples.slice(0, 2).map((example, i) => (
                      <p key={i} className={styles.example}>
                        • {example}
                      </p>
                    ))}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className={styles.actions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={handleAddToWordbook}
                  >
                    ⭐ 加入生词本
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.notFound}>
                <span className={styles.notFoundEmoji}>🔍</span>
                <p className={styles.notFoundText}>
                  未找到 "<strong>{word}</strong>" 的释义
                </p>
                <p className={styles.notFoundHint}>
                  试试查询单词的原形
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DictionaryPopup;


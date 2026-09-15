/**
 * DictionaryPopup 组件
 * 单词查询弹窗，显示释义、发音、例句
 */

import { useEffect, useState, useCallback } from 'react';
import { Modal } from '@/components/common/Modal';
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
  onAddToWordbook?: (entry: DictionaryEntry) => Promise<void>;
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
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 查询单词
  const lookupWord = useCallback(async () => {
    if (!word) return;
    setLoading(true);
    setLookupError(null);
    setEntry(null);
    setIsSaved(false);
    try {
      const result = await dictionaryService.lookup(word);
      setEntry(result);
    } catch {
      setLookupError('词典暂时打不开，请检查后重试。');
    } finally {
      setLoading(false);
    }
  }, [word]);

  useEffect(() => {
    if (word && visible) {
      void lookupWord();
    }
  }, [word, visible, lookupWord]);

  // 播放发音
  const handlePlayPronunciation = useCallback(async () => {
    if (!word || isPlaying) return;
    setIsPlaying(true);
    setAudioError(null);
    try {
      await ttsService.speakWord(word);
    } catch {
      setAudioError('发音暂时不可用，请稍后再试。');
    } finally {
      setIsPlaying(false);
    }
  }, [word, isPlaying]);

  // 添加到生词本
  const handleAddToWordbook = useCallback(async () => {
    if (!entry || !onAddToWordbook || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onAddToWordbook(entry);
      setIsSaved(true);
    } catch {
      setSaveError('没有保存成功，请重试。');
    } finally {
      setIsSaving(false);
    }
  }, [entry, onAddToWordbook, isSaving]);

  return (
    <Modal
      open={visible}
      onClose={onClose}
      title={word ? `单词：${word}` : '单词'}
      size="sm"
      className={styles.modal}
    >
      <div className={styles.popup}>
        {loading ? (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            <p>查询中...</p>
          </div>
        ) : lookupError ? (
          <div className={styles.notFound} role="alert">
            <span className={styles.notFoundEmoji}>⚠️</span>
            <p className={styles.notFoundText}>{lookupError}</p>
            <button className={styles.retryBtn} onClick={() => void lookupWord()}>
              重试
            </button>
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
                aria-label={isPlaying ? '正在播放发音' : `播放 ${entry.word} 的发音`}
              >
                {isPlaying ? '🔊' : '🔈'}
              </button>
            </div>

            {audioError && (
              <p className={styles.inlineError} role="status">
                {audioError}
              </p>
            )}

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
                onClick={() => void handleAddToWordbook()}
                disabled={!onAddToWordbook || isSaving || isSaved}
              >
                {isSaved
                  ? '✓ 已加入生词本'
                  : isSaving
                    ? '正在保存…'
                    : onAddToWordbook
                      ? '⭐ 加入生词本'
                      : '需要学习档案才能收藏'}
              </button>
            </div>
            {saveError && (
              <p className={styles.inlineError} role="alert">
                {saveError}
              </p>
            )}
          </>
        ) : (
          <div className={styles.notFound}>
            <span className={styles.notFoundEmoji}>🔍</span>
            <p className={styles.notFoundText}>
              未找到 "<strong>{word}</strong>" 的释义
            </p>
            <p className={styles.notFoundHint}>试试查询单词的原形</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DictionaryPopup;

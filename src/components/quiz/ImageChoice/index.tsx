/**
 * ImageChoice 组件
 * 听音辨图题型 - 听音频选择正确的图片
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { QuizItem } from '@/db';
import { ttsService } from '@/services/ttsService';
import { getQuizEmoji } from '../quizIllustrations';
import styles from './ImageChoice.module.css';

interface ImageChoiceProps {
  question: QuizItem;
  onAnswer: (answer: string) => void;
  onHint: () => void;
}

export const ImageChoice: React.FC<ImageChoiceProps> = ({ question, onAnswer, onHint }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const selectedRef = useRef(false);
  const hintUsedRef = useRef(false);
  const answerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      ttsService.stop('quiz');
    },
    []
  );

  // 播放音频
  const playAudio = useCallback(async () => {
    if (isPlaying) return;
    setAudioError(null);
    try {
      setIsPlaying(true);
      ttsService.setRate(0.8);
      await ttsService.speak(question.question, { owner: 'quiz' });
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setAudioError('语音没有播放成功，请直接看英文单词再选择图片。');
      }
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, question]);

  // 选择选项
  const handleSelect = useCallback(
    (value: string) => {
      if (selectedRef.current) return;
      selectedRef.current = true;
      setSelectedOption(value);

      // 延迟提交，让用户看到选中效果
      answerTimerRef.current = setTimeout(() => {
        onAnswer(value);
      }, 300);
    },
    [onAnswer]
  );

  // 使用提示
  const handleHint = useCallback(() => {
    if (hintUsedRef.current) return;
    hintUsedRef.current = true;
    onHint();
    setHintMessage(`💡 要找的是 “${question.question}” 对应的图片。已使用提示（-5 魔力值）`);
    hintTimerRef.current = setTimeout(() => setHintMessage(null), 3000);
  }, [onHint, question.question]);

  return (
    <div className={styles.container}>
      {/* 题目区域 */}
      <div className={styles.questionSection}>
        <h2 className={styles.title}>🎧 看一看，选一选</h2>
        <p className={styles.instruction}>一起读题目，也可以点喇叭听题，再选答案</p>
        <p className={styles.questionWord} lang="en">
          {question.question}
        </p>

        <motion.button
          className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
          onClick={playAudio}
          whileTap={{ scale: 0.95 }}
          disabled={isPlaying}
        >
          <span className={styles.playIcon}>{isPlaying ? '🔊' : '🔈'}</span>
          <span className={styles.playText}>{isPlaying ? '播放中...' : '听题目'}</span>
        </motion.button>
        {audioError && (
          <p className={styles.audioError} role="alert">
            {audioError}
          </p>
        )}
      </div>

      {/* 选项区域 */}
      <div className={styles.optionsGrid}>
        {question.options?.map((option, index) => (
          <motion.button
            key={option.value}
            className={`${styles.option} ${selectedOption === option.value ? styles.selected : ''}`}
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {getQuizEmoji(option.image) ? (
              <div className={styles.optionImage}>
                <span className={styles.emoji} aria-hidden="true">{getQuizEmoji(option.image)}</span>
                <span className={styles.optionText}>{option.text || option.value}</span>
              </div>
            ) : (
              <div className={styles.optionText}>{option.text || option.value}</div>
            )}
          </motion.button>
        ))}
      </div>

      {/* 提示按钮和消息 */}
      <div className={styles.hintSection}>
        {hintMessage && (
          <motion.div
            className={styles.hintMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {hintMessage}
          </motion.div>
        )}
        <button className={styles.hintBtn} onClick={handleHint} disabled={hintUsedRef.current}>
          {hintUsedRef.current ? '💡 已使用提示' : '💡 提示 (-5 MP)'}
        </button>
      </div>
    </div>
  );
};

export default ImageChoice;

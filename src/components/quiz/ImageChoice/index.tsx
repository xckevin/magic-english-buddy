/**
 * ImageChoice 组件
 * 听音辨图题型 - 听音频选择正确的图片
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { QuizItem } from '@/db';
import styles from './ImageChoice.module.css';

interface ImageChoiceProps {
  question: QuizItem;
  onAnswer: (answer: string) => void;
  onHint: () => void;
}

export const ImageChoice: React.FC<ImageChoiceProps> = ({
  question,
  onAnswer,
  onHint,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 播放音频
  const playAudio = useCallback(() => {
    if (question.audioQuestion) {
      setIsPlaying(true);
      // 模拟音频播放
      const utterance = new SpeechSynthesisUtterance(question.question);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  }, [question]);

  // 自动播放
  useEffect(() => {
    const timer = setTimeout(playAudio, 500);
    return () => clearTimeout(timer);
  }, [playAudio]);

  // 选择选项
  const handleSelect = useCallback((value: string) => {
    if (selectedOption) return; // 防止重复选择
    setSelectedOption(value);
    
    // 延迟提交，让用户看到选中效果
    setTimeout(() => {
      onAnswer(value);
    }, 300);
  }, [selectedOption, onAnswer]);

  // 使用提示
  const handleHint = useCallback(() => {
    onHint();
    // 排除一个错误选项（简化实现）
    alert('💡 提示：仔细听单词的发音！(-5 魔力值)');
  }, [onHint]);

  return (
    <div className={styles.container}>
      {/* 题目区域 */}
      <div className={styles.questionSection}>
        <h2 className={styles.title}>🎧 听一听，选一选</h2>
        <p className={styles.instruction}>点击喇叭听单词，选择对应的图片</p>
        
        <motion.button
          className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
          onClick={playAudio}
          whileTap={{ scale: 0.95 }}
          disabled={isPlaying}
        >
          <span className={styles.playIcon}>{isPlaying ? '🔊' : '🔈'}</span>
          <span className={styles.playText}>
            {isPlaying ? '播放中...' : '点击听音'}
          </span>
        </motion.button>
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
            {option.image ? (
              <div className={styles.optionImage}>
                <span className={styles.emoji}>{option.image}</span>
              </div>
            ) : (
              <div className={styles.optionText}>
                {option.text}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* 提示按钮 */}
      <div className={styles.hintSection}>
        <button className={styles.hintBtn} onClick={handleHint}>
          💡 提示 (-5 MP)
        </button>
      </div>
    </div>
  );
};

export default ImageChoice;


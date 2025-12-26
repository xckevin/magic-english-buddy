/**
 * ReaderControls 组件
 * 阅读器底部控制栏：播放/暂停、语速、跟读、翻译
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './ReaderControls.module.css';

type SpeedOption = 0.8 | 1.0 | 1.2;

interface ReaderControlsProps {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否暂停 */
  isPaused: boolean;
  /** 当前语速 */
  speed: SpeedOption;
  /** 是否显示翻译 */
  showTranslation: boolean;
  /** 是否在录音模式 */
  isRecording: boolean;
  /** 播放/暂停回调 */
  onPlayPause: () => void;
  /** 停止回调 */
  onStop: () => void;
  /** 语速切换回调 */
  onSpeedChange: (speed: SpeedOption) => void;
  /** 翻译开关回调 */
  onTranslationToggle: () => void;
  /** 跟读模式回调 */
  onRecordToggle: () => void;
}

export const ReaderControls = memo<ReaderControlsProps>(({
  isPlaying,
  isPaused,
  speed,
  showTranslation,
  isRecording,
  onPlayPause,
  onStop,
  onSpeedChange,
  onTranslationToggle,
  onRecordToggle,
}) => {
  // 语速选项
  const speedOptions: SpeedOption[] = [0.8, 1.0, 1.2];
  
  // 获取下一个语速
  const getNextSpeed = (): SpeedOption => {
    const currentIndex = speedOptions.indexOf(speed);
    return speedOptions[(currentIndex + 1) % speedOptions.length] as SpeedOption;
  };

  return (
    <div className={styles.controls}>
      {/* 翻译按钮 */}
      <button
        className={clsx(styles.controlBtn, styles.translationBtn, {
          [styles.active]: showTranslation,
        })}
        onClick={onTranslationToggle}
        title={showTranslation ? '隐藏翻译' : '显示翻译'}
      >
        <span className={styles.btnIcon}>📖</span>
        <span className={styles.btnLabel}>翻译</span>
      </button>

      {/* 语速按钮 */}
      <button
        className={styles.controlBtn}
        onClick={() => onSpeedChange(getNextSpeed())}
        title={`当前语速: ${speed}x`}
      >
        <span className={styles.btnIcon}>⚡</span>
        <span className={styles.btnLabel}>{speed}x</span>
      </button>

      {/* 播放/暂停按钮（主按钮） */}
      <motion.button
        className={clsx(styles.controlBtn, styles.playBtn, {
          [styles.playing]: isPlaying && !isPaused,
        })}
        onClick={onPlayPause}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span 
          className={styles.playIcon}
          animate={{ scale: isPlaying && !isPaused ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isPlaying && !isPaused ? Infinity : 0, duration: 1 }}
        >
          {isPlaying && !isPaused ? '⏸️' : '▶️'}
        </motion.span>
        <span className={styles.btnLabel}>
          {isPlaying && !isPaused ? '暂停' : isPaused ? '继续' : '播放'}
        </span>
      </motion.button>

      {/* 跟读按钮 */}
      <button
        className={clsx(styles.controlBtn, styles.recordBtn, {
          [styles.recording]: isRecording,
        })}
        onClick={onRecordToggle}
        title={isRecording ? '停止录音' : '开始跟读'}
      >
        <span className={styles.btnIcon}>🎤</span>
        <span className={styles.btnLabel}>跟读</span>
      </button>

      {/* 停止按钮 */}
      {isPlaying && (
        <motion.button
          className={clsx(styles.controlBtn, styles.stopBtn)}
          onClick={onStop}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <span className={styles.btnIcon}>⏹️</span>
          <span className={styles.btnLabel}>停止</span>
        </motion.button>
      )}
    </div>
  );
});

ReaderControls.displayName = 'ReaderControls';

export default ReaderControls;


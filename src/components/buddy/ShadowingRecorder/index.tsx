/**
 * ShadowingRecorder 组件
 * 影子跟读录音器
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { audioRecorderService, type RecordingState } from '@/services/audioRecorderService';
import styles from './ShadowingRecorder.module.css';

interface ShadowingRecorderProps {
  /** 原音频 URL */
  originalAudioUrl?: string;
  /** 录制完成回调 */
  onRecordComplete?: (audioBlob: Blob) => void;
  /** 是否显示波形 */
  showWaveform?: boolean;
}

export const ShadowingRecorder: React.FC<ShadowingRecorderProps> = ({
  originalAudioUrl,
  onRecordComplete,
  showWaveform = true,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });

  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [originalAudio] = useState(() => originalAudioUrl ? new Audio(originalAudioUrl) : null);
  const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>(null);

  // 订阅录音状态
  useEffect(() => {
    const unsubscribe = audioRecorderService.subscribe(setRecordingState);
    return () => unsubscribe();
  }, []);

  // 更新录制的音频
  useEffect(() => {
    if (recordingState.audioUrl) {
      const audio = new Audio(recordingState.audioUrl);
      audio.onended = () => setIsPlayingRecorded(false);
      setRecordedAudio(audio);
      
      if (recordingState.audioBlob) {
        onRecordComplete?.(recordingState.audioBlob);
      }
    }
  }, [recordingState.audioUrl, recordingState.audioBlob, onRecordComplete]);

  // 开始录音
  const handleStartRecording = useCallback(async () => {
    const success = await audioRecorderService.start();
    if (!success) {
      alert('无法访问麦克风，请检查权限设置');
    }
  }, []);

  // 停止录音
  const handleStopRecording = useCallback(() => {
    audioRecorderService.stop();
  }, []);

  // 播放原音频
  const handlePlayOriginal = useCallback(() => {
    if (originalAudio) {
      if (isPlayingOriginal) {
        originalAudio.pause();
        originalAudio.currentTime = 0;
        setIsPlayingOriginal(false);
      } else {
        originalAudio.play();
        setIsPlayingOriginal(true);
        originalAudio.onended = () => setIsPlayingOriginal(false);
      }
    }
  }, [originalAudio, isPlayingOriginal]);

  // 播放录制的音频
  const handlePlayRecorded = useCallback(() => {
    if (recordedAudio) {
      if (isPlayingRecorded) {
        recordedAudio.pause();
        recordedAudio.currentTime = 0;
        setIsPlayingRecorded(false);
      } else {
        recordedAudio.play();
        setIsPlayingRecorded(true);
      }
    }
  }, [recordedAudio, isPlayingRecorded]);

  // 双轨播放（同时播放原音和录音）
  const handleDualPlay = useCallback(() => {
    if (originalAudio && recordedAudio) {
      originalAudio.currentTime = 0;
      recordedAudio.currentTime = 0;
      originalAudio.volume = 0.5;
      recordedAudio.volume = 0.5;
      originalAudio.play();
      recordedAudio.play();
      setIsPlayingOriginal(true);
      setIsPlayingRecorded(true);
    }
  }, [originalAudio, recordedAudio]);

  // 重置
  const handleReset = useCallback(() => {
    audioRecorderService.reset();
    setRecordedAudio(null);
  }, []);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      {/* 状态显示 */}
      <div className={styles.status}>
        {recordingState.isRecording ? (
          <motion.div
            className={styles.recordingIndicator}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <span className={styles.recordDot} />
            <span>录音中 {formatTime(recordingState.duration)}</span>
          </motion.div>
        ) : recordingState.audioUrl ? (
          <span className={styles.completedText}>✅ 录音完成</span>
        ) : (
          <span className={styles.hintText}>点击麦克风开始录音</span>
        )}
      </div>

      {/* 波形显示 (简化版) */}
      {showWaveform && recordingState.isRecording && (
        <div className={styles.waveform}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.waveBar}
              animate={{
                height: [20, 40 + Math.random() * 30, 20],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}

      {/* 控制按钮 */}
      <div className={styles.controls}>
        {/* 原音播放 */}
        {originalAudioUrl && (
          <button
            className={`${styles.controlBtn} ${isPlayingOriginal ? styles.active : ''}`}
            onClick={handlePlayOriginal}
          >
            <span className={styles.btnIcon}>{isPlayingOriginal ? '⏸️' : '🔊'}</span>
            <span className={styles.btnLabel}>原音</span>
          </button>
        )}

        {/* 录音按钮 */}
        <motion.button
          className={`${styles.recordBtn} ${recordingState.isRecording ? styles.recording : ''}`}
          onClick={recordingState.isRecording ? handleStopRecording : handleStartRecording}
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.recordIcon}>
            {recordingState.isRecording ? '⏹️' : '🎤'}
          </span>
        </motion.button>

        {/* 录音播放 */}
        {recordingState.audioUrl && (
          <button
            className={`${styles.controlBtn} ${isPlayingRecorded ? styles.active : ''}`}
            onClick={handlePlayRecorded}
          >
            <span className={styles.btnIcon}>{isPlayingRecorded ? '⏸️' : '▶️'}</span>
            <span className={styles.btnLabel}>回放</span>
          </button>
        )}
      </div>

      {/* 额外功能 */}
      {recordingState.audioUrl && (
        <div className={styles.extraControls}>
          {originalAudioUrl && (
            <button className={styles.extraBtn} onClick={handleDualPlay}>
              🎧 对比播放
            </button>
          )}
          <button className={styles.extraBtn} onClick={handleReset}>
            🔄 重新录制
          </button>
        </div>
      )}
    </div>
  );
};

export default ShadowingRecorder;


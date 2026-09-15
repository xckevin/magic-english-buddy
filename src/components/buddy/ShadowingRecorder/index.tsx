/** A small, child-friendly record-and-replay panel for shadowing practice. */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { audioRecorderService, type RecordingState } from '@/services/audioRecorderService';
import { isTTSAbortError, ttsService } from '@/services/ttsService';
import styles from './ShadowingRecorder.module.css';

interface ShadowingRecorderProps {
  /** Optional genuine original-audio file. Do not pass a guessed asset path. */
  originalAudioUrl?: string;
  /** Text used for a TTS demonstration when no original audio file exists. */
  originalText?: string;
  onRecordComplete?: (audioBlob: Blob) => void;
  /** Kept for call-site compatibility; shown as a non-measured recording indicator. */
  showWaveform?: boolean;
}

export const ShadowingRecorder: React.FC<ShadowingRecorderProps> = ({
  originalAudioUrl,
  originalText,
  onRecordComplete,
  showWaveform = true,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>(
    audioRecorderService.getState()
  );
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalAudio] = useState(() => (originalAudioUrl ? new Audio(originalAudioUrl) : null));
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const onRecordCompleteRef = useRef(onRecordComplete);
  const originalVolume = useRef(1);
  const recordedVolume = useRef(1);
  const demoPlaying = useRef(false);
  const stopAllPlaybackRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    onRecordCompleteRef.current = onRecordComplete;
  }, [onRecordComplete]);

  const restoreVolumes = useCallback(() => {
    if (originalAudio) originalAudio.volume = originalVolume.current;
    if (recordedAudioRef.current) recordedAudioRef.current.volume = recordedVolume.current;
  }, [originalAudio]);

  const stopAudio = useCallback((audio: HTMLAudioElement | null, reset = true) => {
    if (!audio) return;
    audio.pause();
    if (reset) audio.currentTime = 0;
  }, []);

  const stopAllPlayback = useCallback(() => {
    stopAudio(originalAudio);
    stopAudio(recordedAudioRef.current);
    restoreVolumes();
    setIsPlayingOriginal(false);
    setIsPlayingRecorded(false);
  }, [originalAudio, restoreVolumes, stopAudio]);
  stopAllPlaybackRef.current = stopAllPlayback;

  useEffect(() => {
    const unsubscribe = audioRecorderService.subscribe(setRecordingState);
    return () => {
      unsubscribe();
      audioRecorderService.dispose();
      stopAllPlaybackRef.current();
      if (demoPlaying.current) ttsService.stop('shadowing');
    };
  }, []);

  useEffect(() => {
    if (!recordingState.audioUrl) return;
    const audio = new Audio(recordingState.audioUrl);
    recordedAudioRef.current = audio;
    audio.onended = () => {
      setIsPlayingRecorded(false);
      restoreVolumes();
    };
    if (recordingState.audioBlob) onRecordCompleteRef.current?.(recordingState.audioBlob);
    return () => {
      audio.pause();
      if (recordedAudioRef.current === audio) recordedAudioRef.current = null;
    };
  }, [recordingState.audioUrl, recordingState.audioBlob, restoreVolumes]);

  useEffect(() => {
    if (recordingState.error) setError(recordingState.error);
  }, [recordingState.error]);

  const handleStartRecording = useCallback(async () => {
    setError(null);
    stopAllPlayback();
    ttsService.stop();
    demoPlaying.current = false;
    setIsPlayingDemo(false);
    const success = await audioRecorderService.start();
    if (!success) setError('无法使用麦克风。请允许录音权限，然后再试一次。');
  }, [stopAllPlayback]);

  const handleStopRecording = useCallback(() => audioRecorderService.stop(), []);

  const handlePlayOriginal = useCallback(async () => {
    if (!originalAudio || recordingState.isRecording) return;
    setError(null);
    if (isPlayingOriginal) {
      stopAudio(originalAudio);
      restoreVolumes();
      setIsPlayingOriginal(false);
      return;
    }
    try {
      stopAudio(recordedAudioRef.current);
      ttsService.stop();
      demoPlaying.current = false;
      setIsPlayingDemo(false);
      setIsPlayingRecorded(false);
      originalVolume.current = originalAudio.volume;
      await originalAudio.play();
      setIsPlayingOriginal(true);
      originalAudio.onended = () => {
        setIsPlayingOriginal(false);
        restoreVolumes();
      };
    } catch {
      setIsPlayingOriginal(false);
      setError('示范音频暂时无法播放，请稍后再试。');
    }
  }, [isPlayingOriginal, originalAudio, recordingState.isRecording, restoreVolumes, stopAudio]);

  const handlePlayDemo = useCallback(async () => {
    if (!originalText || recordingState.isRecording) return;
    setError(null);
    if (isPlayingDemo) {
      ttsService.stop('shadowing');
      demoPlaying.current = false;
      setIsPlayingDemo(false);
      return;
    }
    try {
      stopAllPlayback();
      demoPlaying.current = true;
      setIsPlayingDemo(true);
      await ttsService.speak(originalText, { owner: 'shadowing' });
    } catch (error) {
      if (!isTTSAbortError(error)) setError('语音示范暂时不可用，请稍后再试。');
    } finally {
      demoPlaying.current = false;
      setIsPlayingDemo(false);
    }
  }, [isPlayingDemo, originalText, recordingState.isRecording, stopAllPlayback]);

  const handlePlayRecorded = useCallback(async () => {
    const recordedAudio = recordedAudioRef.current;
    if (!recordedAudio) return;
    setError(null);
    if (isPlayingRecorded) {
      stopAudio(recordedAudio);
      restoreVolumes();
      setIsPlayingRecorded(false);
      return;
    }
    try {
      stopAudio(originalAudio);
      ttsService.stop();
      demoPlaying.current = false;
      setIsPlayingDemo(false);
      setIsPlayingOriginal(false);
      recordedVolume.current = recordedAudio.volume;
      await recordedAudio.play();
      setIsPlayingRecorded(true);
    } catch {
      setIsPlayingRecorded(false);
      setError('你的录音暂时无法播放，请再试一次。');
    }
  }, [isPlayingRecorded, originalAudio, restoreVolumes, stopAudio]);

  const handleDualPlay = useCallback(async () => {
    const recordedAudio = recordedAudioRef.current;
    if (!originalAudio || !recordedAudio) return;
    setError(null);
    stopAllPlayback();
    ttsService.stop();
    demoPlaying.current = false;
    setIsPlayingDemo(false);
    originalAudio.currentTime = 0;
    recordedAudio.currentTime = 0;
    originalVolume.current = originalAudio.volume;
    recordedVolume.current = recordedAudio.volume;
    originalAudio.volume = 0.5;
    recordedAudio.volume = 0.5;
    const results = await Promise.allSettled([originalAudio.play(), recordedAudio.play()]);
    if (results.every(result => result.status === 'fulfilled')) {
      setIsPlayingOriginal(true);
      setIsPlayingRecorded(true);
      return;
    }
    // A partially-started pair is harder to understand than a clear retry state.
    stopAllPlayback();
    setError('对比播放没有完整开始，请稍后再试。');
  }, [originalAudio, stopAllPlayback]);

  const handleReset = useCallback(() => {
    stopAllPlayback();
    audioRecorderService.reset();
    recordedAudioRef.current = null;
    setError(null);
  }, [stopAllPlayback]);

  const formatTime = (seconds: number): string =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  const hasOriginalAudio = Boolean(originalAudioUrl && originalAudio);
  const hasDemo = Boolean(originalText && !hasOriginalAudio);

  return (
    <div className={styles.container}>
      <div className={styles.status} aria-live="polite">
        {recordingState.isRecording ? (
          <span className={styles.recordingIndicator}>
            正在录音 {formatTime(recordingState.duration)}
          </span>
        ) : recordingState.audioUrl ? (
          <span className={styles.completedText}>录好了，可以回放</span>
        ) : (
          <span className={styles.hintText}>先听示范，再录下自己的声音</span>
        )}
      </div>
      {showWaveform && recordingState.isRecording && (
        <div className={styles.recordingPulse} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.controls}>
        {hasOriginalAudio && (
          <button
            className={`${styles.controlBtn} ${isPlayingOriginal ? styles.active : ''}`}
            onClick={() => void handlePlayOriginal()}
            disabled={recordingState.isRecording}
          >
            <span aria-hidden="true">{isPlayingOriginal ? '⏸' : '🔊'}</span>
            <span>听原音</span>
          </button>
        )}
        {hasDemo && (
          <button
            className={`${styles.controlBtn} ${isPlayingDemo ? styles.active : ''}`}
            onClick={() => void handlePlayDemo()}
            disabled={recordingState.isRecording}
          >
            <span aria-hidden="true">{isPlayingDemo ? '⏸' : '🔊'}</span>
            <span>{isPlayingDemo ? '停止示范' : '听示范'}</span>
          </button>
        )}
        <button
          className={`${styles.recordBtn} ${recordingState.isRecording ? styles.recording : ''}`}
          onClick={
            recordingState.isRecording ? handleStopRecording : () => void handleStartRecording()
          }
          aria-label={recordingState.isRecording ? '停止录音' : '开始录音'}
        >
          <span aria-hidden="true">{recordingState.isRecording ? '⏹' : '🎤'}</span>
          <span>{recordingState.isRecording ? '完成录音' : '开始录音'}</span>
        </button>
        {recordingState.audioUrl && (
          <button
            className={`${styles.controlBtn} ${isPlayingRecorded ? styles.active : ''}`}
            onClick={() => void handlePlayRecorded()}
          >
            <span aria-hidden="true">{isPlayingRecorded ? '⏸' : '▶'}</span>
            <span>{isPlayingRecorded ? '停止回放' : '听我的录音'}</span>
          </button>
        )}
      </div>

      {recordingState.audioUrl && (
        <div className={styles.extraControls}>
          {hasOriginalAudio && (
            <button className={styles.extraBtn} onClick={() => void handleDualPlay()}>
              一起对比听
            </button>
          )}
          <button className={styles.extraBtn} onClick={handleReset}>
            重新录一遍
          </button>
        </div>
      )}
    </div>
  );
};

export default ShadowingRecorder;

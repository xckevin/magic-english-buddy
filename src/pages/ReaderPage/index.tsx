/** Story reader: saved reading preferences, TTS, dictionary, and shadowing. */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { db, type Story } from '@/db';
import { ttsService } from '@/services/ttsService';
import { readingProgressService } from '@/services/readingProgressService';
import { convertToCard } from '@/services/cardCollectionService';
import { StoryContent, ReaderControls, DictionaryPopup } from '@/components/reader';
import { ShadowingRecorder } from '@/components/buddy/ShadowingRecorder';
import styles from './ReaderPage.module.css';

type SpeedOption = 0.8 | 1.0 | 1.2;
type PendingAction = 'back' | 'complete' | null;

const ReaderPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { currentUserId, settings } = useAppStore();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [speed, setSpeed] = useState<SpeedOption>(settings.ttsSpeed);
  const [showTranslation, setShowTranslation] = useState(settings.showTranslation);
  const [isShadowingOpen, setIsShadowingOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [learnedWords] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => setSpeed(settings.ttsSpeed), [settings.ttsSpeed]);
  useEffect(() => setShowTranslation(settings.showTranslation), [settings.showTranslation]);

  const loadStory = useCallback(async () => {
    if (!storyId) {
      setLoadError('没有找到要阅读的故事。');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const storyData = await db.stories.get(storyId);
      if (!storyData) {
        setStory(null);
        setLoadError('这个故事暂时不可用。');
        return;
      }
      setStory(storyData);

      readingProgressService.startSession(storyId, storyData.content?.length || 1);
    } catch {
      setLoadError('故事没有加载成功，请检查后重试。');
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    void loadStory();
    return () => {
      ttsService.stop();
      unsubscribeRef.current?.();
    };
  }, [loadStory]);

  useEffect(() => {
    unsubscribeRef.current = ttsService.subscribe(event => {
      switch (event.type) {
        case 'start':
          setPlaybackError(null);
          setIsPlaying(true);
          setIsPaused(false);
          break;
        case 'end':
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
          break;
        case 'pause':
          setIsPaused(true);
          break;
        case 'resume':
          setIsPaused(false);
          break;
        case 'error':
          setIsPlaying(false);
          setIsPaused(false);
          setPlaybackError('播放没有开始，请确认设备允许语音播放后重试。');
          break;
        case 'word': {
          if (event.wordIndex === undefined || !story?.content) break;
          setCurrentWordIndex(event.wordIndex);
          let count = 0;
          for (let i = 0; i < story.content.length; i += 1) {
            count += story.content[i].words.length;
            if (event.wordIndex < count) {
              setCurrentParagraphIndex(i);
              readingProgressService.updateParagraph(i);
              break;
            }
          }
          break;
        }
      }
    });
    return () => unsubscribeRef.current?.();
  }, [story]);

  const handlePlayPause = useCallback(async () => {
    if (!story?.content) return;
    setPlaybackError(null);
    if (isPlaying) {
      if (isPaused) ttsService.resume();
      else ttsService.pause();
      return;
    }
    try {
      ttsService.setRate(speed);
      await ttsService.speak(story.content.map(paragraph => paragraph.text).join(' '));
    } catch {
      setPlaybackError('播放没有开始，请确认设备允许语音播放后重试。');
    }
  }, [story, isPlaying, isPaused, speed]);

  const handleStop = useCallback(() => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: SpeedOption) => {
    setSpeed(newSpeed);
    ttsService.setRate(newSpeed);
  }, []);

  const openDictionary = useCallback(
    (word: string) => {
      // Web Speech exposes one speech queue. Stop the story explicitly so the controls
      // never claim it is still playing while a word pronunciation takes over.
      if (isPlaying || isPaused) handleStop();
      setSelectedWord(word);
      setShowDictionary(true);
      readingProgressService.addLookedUpWord(word);
    },
    [handleStop, isPaused, isPlaying]
  );

  const saveWord = useCallback(
    async (entry: { word: string; meaningCn: string; emoji?: string }) => {
      if (!currentUserId) throw new Error('No current user');
      await convertToCard(
        currentUserId,
        entry.word.toLowerCase(),
        entry.meaningCn,
        entry.emoji || '📝'
      );
    },
    [currentUserId]
  );

  const finishReading = useCallback(
    async (action: Exclude<PendingAction, null>) => {
      if (savingRef.current) return;
      if (!currentUserId) {
        navigate('/map');
        return;
      }
      savingRef.current = true;
      setSaving(true);
      setActionError(null);
      setPendingAction(null);
      handleStop();
      try {
        const record = await readingProgressService.endSession(
          currentUserId,
          action === 'complete'
        );
        if (!record) throw new Error('save failed');
        navigate(action === 'complete' ? `/quiz/${storyId}` : '/map');
      } catch {
        setPendingAction(action);
        setActionError('阅读进度没有保存成功。请重试，避免丢失本次记录。');
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [currentUserId, navigate, storyId, handleStop]
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>正在打开故事…</p>
      </div>
    );
  }

  if (!story || loadError) {
    return (
      <main className={styles.errorContainer} aria-live="polite">
        <span className={styles.errorIcon}>📚</span>
        <h1>故事还没准备好</h1>
        <p>{loadError || '故事暂时不可用。'}</p>
        <div className={styles.errorActions}>
          <button onClick={() => void loadStory()}>重试</button>
          <button className={styles.secondaryBtn} onClick={() => navigate('/map')}>
            返回地图
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.container} data-testid="reader-page">
      <main id="story-content" className={styles.main} tabIndex={-1}>
        <header className={styles.header}>
          <button
            className={styles.backBtn}
            disabled={saving}
            onClick={() => void finishReading('back')}
          >
            ← <span>返回</span>
          </button>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>
              第 {story.level} 级 · {story.metadata.wordCount} 词 · 约{' '}
              {story.metadata.estimatedTime} 分钟
            </p>
            <h1 className={styles.title}>{story.title}</h1>
            <p className={styles.titleCn}>{story.titleCn}</p>
          </div>
          <button
            className={styles.speedBtn}
            onClick={() => handleSpeedChange(speed === 1.2 ? 0.8 : speed === 0.8 ? 1.0 : 1.2)}
            aria-label={`语速 ${speed} 倍，点击切换`}
          >
            {speed}×
          </button>
        </header>

        <p className={styles.readingHint}>点击单词查意思 · 听完后，和伙伴一起读一读</p>
        {isShadowingOpen && (
          <aside className={styles.shadowingPanel} aria-label="跟读录音">
            <div className={styles.panelHeading}>
              <h2>跟读练习</h2>
              <button onClick={() => setIsShadowingOpen(false)}>收起</button>
            </div>
            <p className={styles.readingHint}>先听这一小段，再试着跟读。录音仅用于本次回放。</p>
            <ShadowingRecorder
              originalText={
                story.content[currentParagraphIndex]?.text ??
                story.content.map(paragraph => paragraph.text).join(' ')
              }
            />
          </aside>
        )}
        <StoryContent
          paragraphs={story.content || []}
          currentWordIndex={currentWordIndex}
          currentParagraphIndex={currentParagraphIndex}
          showTranslation={showTranslation}
          learnedWords={learnedWords}
          onWordClick={openDictionary}
          onWordLongPress={openDictionary}
        />
      </main>

      <footer className={styles.footer}>
        {playbackError && (
          <p className={styles.statusError} role="status">
            {playbackError}
          </p>
        )}
        {actionError && (
          <div className={styles.actionError} role="alert">
            <span>{actionError}</span>
            <button onClick={() => pendingAction && void finishReading(pendingAction)}>重试</button>
          </div>
        )}
        <ReaderControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          speed={speed}
          showTranslation={showTranslation}
          isRecording={isShadowingOpen}
          onPlayPause={() => void handlePlayPause()}
          onStop={handleStop}
          onSpeedChange={handleSpeedChange}
          onTranslationToggle={() => setShowTranslation(value => !value)}
          onRecordToggle={() => {
            handleStop();
            setIsShadowingOpen(value => !value);
          }}
        />
        <button
          className={styles.completeBtn}
          disabled={saving}
          onClick={() => void finishReading('complete')}
        >
          {saving ? '正在保存…' : '读完了，去练一练'}
        </button>
      </footer>

      <DictionaryPopup
        word={selectedWord}
        visible={showDictionary}
        onClose={() => {
          setShowDictionary(false);
          setSelectedWord(null);
        }}
        onAddToWordbook={currentUserId ? saveWord : undefined}
      />
    </div>
  );
};

export default ReaderPage;

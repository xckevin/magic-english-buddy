/**
 * 阅读器页面
 * 故事阅读、TTS 播放、单词高亮、字典查询
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { db, type Story } from '@/db';
import { ttsService } from '@/services/ttsService';
import { readingProgressService } from '@/services/readingProgressService';
import { StoryContent, ReaderControls, DictionaryPopup } from '@/components/reader';
import styles from './ReaderPage.module.css';

type SpeedOption = 0.8 | 1.0 | 1.2;

const ReaderPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { currentUserId } = useAppStore();

  // 故事数据
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  // TTS 状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);

  // 控制状态
  const [speed, setSpeed] = useState<SpeedOption>(1.0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // 字典弹窗
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);

  // 已学习的单词
  const [learnedWords] = useState<Set<string>>(new Set());

  // TTS 事件订阅
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 加载故事数据
  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) return;
      
      setLoading(true);
      try {
        const storyData = await db.stories.get(storyId);
        if (storyData) {
          setStory(storyData);
          // 开始阅读会话
          readingProgressService.startSession(storyId);
        } else {
          console.error('Story not found:', storyId);
        }
      } catch (error) {
        console.error('Failed to load story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();

    // 清理
    return () => {
      ttsService.stop();
      unsubscribeRef.current?.();
    };
  }, [storyId]);

  // 订阅 TTS 事件
  useEffect(() => {
    unsubscribeRef.current = ttsService.subscribe((event) => {
      switch (event.type) {
        case 'start':
          setIsPlaying(true);
          setIsPaused(false);
          break;
        case 'end':
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIndex(-1);
          break;
        case 'word':
          if (event.wordIndex !== undefined) {
            setCurrentWordIndex(event.wordIndex);
            // 更新当前段落
            if (story?.content) {
              let wordCount = 0;
              for (let i = 0; i < story.content.length; i++) {
                wordCount += story.content[i].words.length;
                if (event.wordIndex < wordCount) {
                  setCurrentParagraphIndex(i);
                  break;
                }
              }
            }
          }
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
          console.error('TTS error:', event.error);
          break;
      }
    });

    return () => unsubscribeRef.current?.();
  }, [story]);

  // 播放/暂停
  const handlePlayPause = useCallback(async () => {
    if (!story?.content) return;

    if (isPlaying) {
      if (isPaused) {
        ttsService.resume();
      } else {
        ttsService.pause();
      }
    } else {
      // 合并所有段落文本
      const fullText = story.content.map(p => p.text).join(' ');
      ttsService.setRate(speed);
      try {
        await ttsService.speak(fullText);
      } catch (error) {
        console.error('TTS speak failed:', error);
      }
    }
  }, [story, isPlaying, isPaused, speed]);

  // 停止播放
  const handleStop = useCallback(() => {
    ttsService.stop();
    setCurrentWordIndex(-1);
  }, []);

  // 语速切换
  const handleSpeedChange = useCallback((newSpeed: SpeedOption) => {
    setSpeed(newSpeed);
    ttsService.setRate(newSpeed);
  }, []);

  // 翻译开关
  const handleTranslationToggle = useCallback(() => {
    setShowTranslation(prev => !prev);
  }, []);

  // 跟读开关
  const handleRecordToggle = useCallback(() => {
    setIsRecording(prev => !prev);
    // TODO: 实现录音功能
  }, []);

  // 单词点击 - 发音
  const handleWordClick = useCallback(async (word: string) => {
    try {
      await ttsService.speakWord(word);
    } catch (error) {
      console.error('Word TTS failed:', error);
    }
  }, []);

  // 单词长按 - 查字典
  const handleWordLongPress = useCallback((word: string) => {
    setSelectedWord(word);
    setShowDictionary(true);
    // 记录学习的单词
    readingProgressService.addLearnedWord(word);
  }, []);

  // 关闭字典
  const handleCloseDictionary = useCallback(() => {
    setShowDictionary(false);
    setSelectedWord(null);
  }, []);

  // 返回
  const handleBack = useCallback(async () => {
    // 结束阅读会话
    if (currentUserId) {
      await readingProgressService.endSession(currentUserId);
    }
    navigate('/map');
  }, [navigate, currentUserId]);

  // 完成阅读
  const handleComplete = useCallback(async () => {
    if (!storyId || !currentUserId) return;
    
    // 结束阅读会话
    await readingProgressService.endSession(currentUserId);
    // 标记故事完成
    await readingProgressService.markStoryCompleted(storyId);
    // 跳转到 Quiz
    navigate(`/quiz/${storyId}`);
  }, [storyId, currentUserId, navigate]);

  // 加载中
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>加载故事中...</p>
      </div>
    );
  }

  // 故事不存在
  if (!story) {
    return (
      <div className={styles.errorContainer}>
        <p>故事不存在</p>
        <button onClick={() => navigate('/map')}>返回地图</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← 返回
        </button>
        <h1 className={styles.title}>{story.title}</h1>
        <button className={styles.speedBtn} onClick={() => handleSpeedChange(speed === 1.2 ? 0.8 : speed === 0.8 ? 1.0 : 1.2)}>
          {speed}x
        </button>
      </header>

      {/* 插图区域 */}
      <div className={styles.illustration}>
        <motion.div
          className={styles.illustrationPlaceholder}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {story.id === 'l1_001' && '🍎'}
          {story.id === 'l1_002' && '🐱'}
          {story.id === 'l1_003' && '🌈'}
          {story.id === 'l1_004' && '👨‍👩‍👧'}
          {story.id === 'l1_005' && '🌅'}
          {story.id === 'l1_006' && '🔢'}
          {story.id === 'l1_007' && '🐶'}
          {story.id === 'l1_008' && '🏞️'}
          {story.id === 'l1_009' && '🧸'}
          {story.id === 'l1_010' && '🌙'}
          {!['l1_001', 'l1_002', 'l1_003', 'l1_004', 'l1_005', 'l1_006', 'l1_007', 'l1_008', 'l1_009', 'l1_010'].includes(story.id) && '📖'}
        </motion.div>
      </div>

      {/* 故事内容 */}
      <main className={styles.main}>
        <StoryContent
          paragraphs={story.content || []}
          currentWordIndex={currentWordIndex}
          currentParagraphIndex={currentParagraphIndex}
          showTranslation={showTranslation}
          learnedWords={learnedWords}
          onWordClick={handleWordClick}
          onWordLongPress={handleWordLongPress}
        />
      </main>

      {/* 控制栏 */}
      <footer className={styles.footer}>
        <ReaderControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          speed={speed}
          showTranslation={showTranslation}
          isRecording={isRecording}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onSpeedChange={handleSpeedChange}
          onTranslationToggle={handleTranslationToggle}
          onRecordToggle={handleRecordToggle}
        />
        
        {/* 完成阅读按钮 */}
        <motion.button
          className={styles.completeBtn}
          onClick={handleComplete}
          whileTap={{ scale: 0.98 }}
        >
          完成阅读 →
        </motion.button>
      </footer>

      {/* 字典弹窗 */}
      <DictionaryPopup
        word={selectedWord}
        visible={showDictionary}
        onClose={handleCloseDictionary}
        onAddToWordbook={(word) => {
          console.log('Add to wordbook:', word);
          // TODO: 实现添加到生词本
        }}
      />
    </div>
  );
};

export default ReaderPage;

/**
 * QuizPage 练习页面
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, type QuizItem } from '@/db';
import { QuizContainer, type QuizResultData } from '@/components/quiz';
import { readingProgressService } from '@/services/readingProgressService';
import { Modal } from '@/components/common/Modal';
import { Loading } from '@/components/common';
import { useAppStore } from '@/stores/useAppStore';
import styles from './QuizPage.module.css';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const currentUserId = useAppStore(state => state.currentUserId);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exitConfirmationOpen, setExitConfirmationOpen] = useState(false);
  const saveInFlightRef = useRef(false);

  // 加载题目
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        if (!storyId) {
          setLoadError('没有找到这篇故事，暂时不能开始练习。');
          return;
        }
        const story = await db.stories.get(storyId);
        if (!story) {
          setLoadError('这篇故事已经不存在了。');
          return;
        }
        if (!story.quiz?.length) {
          setLoadError('这篇故事的练习正在准备中。');
          return;
        }
        setQuestions(story.quiz);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setLoadError('练习加载失败，请重试。');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [storyId]);

  const retryLoad = useCallback(() => {
    window.location.reload();
  }, []);

  // 完成 Quiz：同一笔事务内保存记录、奖励和地图状态，失败时由结果页保留并重试。
  const handleComplete = useCallback(
    async (result: QuizResultData) => {
      if (saveInFlightRef.current) return;
      saveInFlightRef.current = true;
      try {
        if (!currentUserId || !storyId) throw new Error('Missing learning profile');
        {
          await db.transaction('rw', [db.quizHistory, db.userProgress, db.mapNodes], async () => {
            await db.quizHistory.add({
              id: crypto.randomUUID(),
              userId: currentUserId,
              storyId,
              quizType: 'story_quiz',
              questions: result.answers.map(a => ({
                questionId: a.questionId,
                userAnswer: a.userAnswer,
                correctAnswer:
                  questions.find(q => q.id === a.questionId)?.correctOrder ??
                  questions.find(q => q.id === a.questionId)?.correctAnswer ??
                  '',
                isCorrect: a.isCorrect,
                timeSpent: 0,
              })),
              score: result.score,
              earnedMagicPower: result.earnedMagicPower,
              completedAt: Date.now(),
            });
            const progress = await db.userProgress.get(currentUserId);
            if (!progress) throw new Error('Learning profile not found');
            {
              await db.userProgress.update(currentUserId, {
                magicPower: progress.magicPower + result.earnedMagicPower,
              });
            }
            if (result.score >= 60) await readingProgressService.markStoryCompleted(storyId);
          });
        }
        navigate('/map');
      } catch (error) {
        console.error('Failed to save quiz result:', error);
        throw error;
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [currentUserId, storyId, navigate, questions]
  );

  // 退出
  const handleExit = useCallback(() => setExitConfirmationOpen(true), []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
      </div>
    );
  }

  if (loadError) {
    return (
      <main className={styles.statusPage} aria-live="polite">
        <div className={styles.statusCard}>
          <span aria-hidden="true" className={styles.statusIcon}>
            📚
          </span>
          <h1>暂时不能开始练习</h1>
          <p>{loadError}</p>
          <div className={styles.statusActions}>
            <button
              className={styles.secondaryAction}
              onClick={() => navigate(`/reader/${storyId}`)}
            >
              返回阅读
            </button>
            <button className={styles.primaryAction} onClick={retryLoad}>
              重新加载
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.container}>
      <QuizContainer
        questions={questions}
        storyId={storyId || 'unknown'}
        onComplete={handleComplete}
        onExit={handleExit}
      />
      <Modal
        open={exitConfirmationOpen}
        onClose={() => setExitConfirmationOpen(false)}
        title="要退出练习吗？"
        size="sm"
      >
        <p>这次未完成的题目不会保存。已经读过的故事记录会保留。</p>
        <div className={styles.statusActions}>
          <button
            className={styles.secondaryAction}
            autoFocus
            onClick={() => setExitConfirmationOpen(false)}
          >
            继续练习
          </button>
          <button className={styles.dangerAction} onClick={() => navigate('/map')}>
            退出练习
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default QuizPage;

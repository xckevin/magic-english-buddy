/**
 * QuizPage 练习页面
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuizItem } from '@/db';
import { QuizContainer, type QuizResultData } from '@/components/quiz';
import { completeStoryQuiz, getLessonAccess } from '@/services/learningCompletionService';
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
  const [isReview, setIsReview] = useState(false);
  const [storyRewardMagicPower, setStoryRewardMagicPower] = useState(0);
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
        if (!currentUserId) {
          setLoadError('请先创建学习档案，再开始练习。');
          return;
        }
        const access = await getLessonAccess(currentUserId, storyId);
        if (!access.allowed || !access.story) {
          setLoadError(
            access.reason === 'locked'
              ? '这篇故事还没有解锁。请从地图上的下一关开始。'
              : '这篇故事暂时不可用。'
          );
          return;
        }
        const story = access.story;
        if (!story.quiz?.length) {
          setLoadError('这篇故事的练习正在准备中。');
          return;
        }
        setQuestions(story.quiz);
        setIsReview(access.isReview);
        setStoryRewardMagicPower(story.rewards.magicPower);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setLoadError('练习加载失败，请重试。');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [currentUserId, storyId]);

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
        await completeStoryQuiz({
          userId: currentUserId,
          storyId,
          score: result.score,
          quizMagicPower: result.earnedMagicPower,
          answers: result.answers.map(answer => ({
            ...answer,
            correctAnswer:
              questions.find(question => question.id === answer.questionId)?.correctOrder ??
              questions.find(question => question.id === answer.questionId)?.correctAnswer ??
              '',
          })),
        });
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
        isReview={isReview}
        storyRewardMagicPower={storyRewardMagicPower}
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

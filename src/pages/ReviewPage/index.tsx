import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import { useAppStore } from '@/stores/useAppStore';
import {
  getReviewQuestions,
  recordVocabularyReview,
  type ReviewQuestion,
} from '@/services/vocabularyReviewService';
import styles from './ReviewPage.module.css';

export default function ReviewPage() {
  const userId = useAppStore(state => state.currentUserId);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; updated: boolean } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const pending = useRef(false);
  const session = useRef(0);
  useEffect(() => {
    let active = true;
    session.current += 1;
    if (!userId) return;
    setLoading(true);
    setError('');
    setIndex(0);
    setFeedback(null);
    setCorrectCount(0);
    getReviewQuestions(userId)
      .then(result => {
        if (active) setQuestions(result);
      })
      .catch(() => {
        if (active) setError('复习内容没有加载成功，请重试。');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      session.current += 1;
    };
  }, [userId, attempt]);
  const question = questions[index];
  if (!userId) return <Navigate to="/onboarding" replace />;
  const answer = async (meaning: string) => {
    if (pending.current || feedback || !question) return;
    if (question.vocabulary.userId !== userId) return;
    const currentSession = session.current;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await recordVocabularyReview(question, meaning);
      if (session.current !== currentSession || useAppStore.getState().currentUserId !== userId)
        return;
      setFeedback(result);
      if (result.correct) setCorrectCount(count => count + 1);
    } catch {
      if (session.current === currentSession)
        setError('这次答案还没有保存，请重新打开复习后重试。');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <AppShell title="生词复习" subtitle="每天温习一点，让新单词更熟悉">
      <section className={styles.card}>
        {loading || (question && question.vocabulary.userId !== userId) ? (
          <p role="status">正在准备词卡…</p>
        ) : error && !questions.length ? (
          <>
            <p role="alert">{error}</p>
            <button onClick={() => setAttempt(value => value + 1)}>重新加载</button>
          </>
        ) : !questions.length ? (
          <>
            <h2>还没有可复习的生词</h2>
            <p>阅读时点击单词，再选择“收藏词卡”。</p>
            <Link to="/map">去读一篇故事</Link>
          </>
        ) : !question ? (
          <>
            <h2>本轮复习完成</h2>
            <p>
              答对 {correctCount} / {questions.length} 个单词。每道已答题都已保存。
            </p>
            <Link to="/scroll">返回成长记录</Link>
          </>
        ) : (
          <>
            <p>
              第 {index + 1} / {questions.length} 个词 ·{' '}
              {question.due ? '到期复习' : '提前练习，不改变复习日期'}
            </p>
            <progress value={index} max={questions.length} aria-label="复习进度" />
            <h2 lang="en">{question.vocabulary.word}</h2>
            <p>选择它的中文意思</p>
            <div className={styles.options}>
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => void answer(option)}
                  disabled={busy || !!feedback}
                >
                  {option}
                </button>
              ))}
            </div>
            {error && <p role="alert">{error}</p>}
            {feedback && (
              <div role="status" className={styles.feedback}>
                <strong>
                  {feedback.correct ? '答对了！' : '再记一次：'}
                  {!feedback.correct && question.meaning}
                </strong>
                <p>
                  {feedback.updated
                    ? '已保存本次复习，熟练度与下次复习日期已更新。'
                    : '本次作为练习，不重复累计熟练度。'}
                </p>
                <button
                  onClick={() => {
                    setIndex(value => value + 1);
                    setFeedback(null);
                    setError('');
                  }}
                >
                  继续复习
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}

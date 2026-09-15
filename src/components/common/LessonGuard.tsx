import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { getLessonAccess } from '@/services/learningCompletionService';
import { initializeAppData, needsInitialization } from '@/services/dataInitService';
import { Loading } from './Loading';
import { Button } from './Button';

/** Bookmarked/deep links must pass the same checks as the map buttons. */
export function LessonGuard({ children }: { children: ReactNode }) {
  const { storyId } = useParams();
  const userId = useAppStore(state => state.currentUserId);
  const [status, setStatus] = useState<'checking' | 'allowed' | 'profile' | 'locked' | 'error'>(
    'checking'
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus('checking');
    void (async () => {
      if (!userId) {
        if (active) setStatus('profile');
        return;
      }
      if (needsInitialization()) {
        const result = await initializeAppData();
        if (!result.success) throw new Error('Lesson data unavailable');
      }
      const access = await getLessonAccess(userId, storyId ?? '');
      if (active)
        setStatus(
          access.allowed ? 'allowed' : access.reason === 'missing_profile' ? 'profile' : 'locked'
        );
    })().catch(() => {
      if (active) setStatus('error');
    });
    return () => {
      active = false;
    };
  }, [userId, storyId, attempt]);

  if (status === 'checking') return <Loading fullscreen message="正在打开关卡…" />;
  if (status === 'profile') return <Navigate to="/onboarding" replace />;
  if (status === 'allowed') return <>{children}</>;
  return (
    <main style={{ maxWidth: 480, margin: '10vh auto', padding: 24 }}>
      <h1>{status === 'error' ? '关卡暂时没有打开' : '这个关卡还不能开始'}</h1>
      <p>
        {status === 'error'
          ? '请重试，你的学习记录仍保存在这台设备上。'
          : '回到地图查看当前关卡，完成前面的练习后再来吧。'}
      </p>
      {status === 'error' && <Button onClick={() => setAttempt(value => value + 1)}>重试</Button>}
      <p>
        <Link to="/map">返回魔法地图</Link>
      </p>
    </main>
  );
}

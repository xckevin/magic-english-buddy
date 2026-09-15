import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import { Certificate } from '@/components/incentive/Certificate';
import { db } from '@/db';
import { getCertificateData, type CertificateData } from '@/services/certificateService';
import { useAppStore } from '@/stores/useAppStore';
import styles from './CertificatePage.module.css';

type PageState = 'loading' | 'ready' | 'empty' | 'error' | 'profileMissing';

export default function CertificatePage() {
  const userId = useAppStore(state => state.currentUserId);
  const [state, setState] = useState<PageState>('loading');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (!userId) return;
    const request = ++requestRef.current;
    setState('loading');
    setError('');
    try {
      if (!(await db.users.get(userId))) {
        if (request === requestRef.current) setState('profileMissing');
        return;
      }
      const data = await getCertificateData(userId);
      if (request !== requestRef.current || useAppStore.getState().currentUserId !== userId) return;
      setCertificate(data);
      setState(data ? 'ready' : 'empty');
    } catch {
      if (request !== requestRef.current) return;
      setError('学习记录暂时无法读取，请稍后重试。');
      setState('error');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void load();
    return () => {
      requestRef.current += 1;
    };
  }, [load, userId]);

  if (!userId || state === 'profileMissing') return <Navigate to="/onboarding" replace />;

  return (
    <AppShell title="学习里程碑证书" subtitle="基于当前档案已完成的课程记录">
      <div className={styles.page}>
        {state === 'loading' && <section className={styles.state} role="status">正在整理当前档案的学习记录…</section>}
        {state === 'error' && (
          <section className={styles.state} role="alert">
            <h2>证书暂时无法打开</h2><p>{error}</p><button type="button" onClick={() => void load()}>重新尝试</button>
          </section>
        )}
        {state === 'empty' && (
          <section className={styles.state}>
            <span aria-hidden="true">📚</span><h2>完成第一节课程后再来领取记录</h2>
            <p>完成课程后，可以在这里生成一份学习里程碑记录。</p>
            <Link to="/map">去学习</Link>
          </section>
        )}
        {state === 'ready' && certificate && (
          <>
            <p className={styles.note}>证书展示当前档案已完成课程和本地记录日期。</p>
            <Certificate {...certificate} date={certificate.issuedOn} onError={setError} />
            {error && <p className={styles.inlineError} role="alert">{error}</p>}
          </>
        )}
      </div>
    </AppShell>
  );
}

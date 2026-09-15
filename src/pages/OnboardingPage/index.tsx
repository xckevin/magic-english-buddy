import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Headphones, Sparkles, ShieldCheck } from 'lucide-react';
import { db } from '@/db';
import { useAppStore } from '@/stores/useAppStore';
import { useInitialization } from '@/hooks/useInitialization';
import { useLongPress } from '@/hooks/useLongPress';
import { MagicEgg } from '@/components/onboarding';
import BuddyScene from '@/components/common/BuddyScene';
import Button from '@/components/common/Button';
import { createLearningProfile } from '@/services/profileService';
import styles from './OnboardingPage.module.css';

type Step = 'welcome' | 'hatching' | 'naming';
export default function OnboardingPage() {
  const navigate = useNavigate();
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const finishFirstLaunch = useAppStore(s => s.setFirstLaunchComplete);
  const { state: init, retry } = useInitialization();
  const [step, setStep] = useState<Step>('welcome');
  const [userName, setUserName] = useState('');
  const [buddyName, setBuddyName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const { progress, handlers } = useLongPress({
    duration: 1800,
    onComplete: () => setStep('naming'),
  });
  useEffect(() => {
    if (!init.isComplete) return;
    let cancelled = false;
    const selectedUserId = useAppStore.getState().currentUserId;
    void (async () => {
      const activeProfileId = (await db.learningMeta.get('activeProfileId'))?.value;
      return (
        (activeProfileId ? await db.users.get(activeProfileId) : undefined) ??
        (selectedUserId ? await db.users.get(selectedUserId) : undefined) ??
        (await db.users.orderBy('createdAt').last())
      );
    })()
      .then(user => {
        // Creating a profile performs its own committed navigation. An older
        // startup lookup must not add a second navigation while it finishes.
        if (user && !cancelled && !submitting.current) {
          setCurrentUser(user.id);
          navigate('/map', { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) setError('暂时无法读取学习记录，请刷新后重试。');
      });
    return () => {
      cancelled = true;
    };
  }, [init.isComplete, setCurrentUser, navigate]);
  const create = useCallback(
    async (skip = false) => {
      if (submitting.current) return;
      if (!skip && (!userName.trim() || !buddyName.trim())) {
        setError('请填写你的名字和伙伴的名字。');
        return;
      }
      submitting.current = true;
      setBusy(true);
      setError('');
      try {
        await createLearningProfile(
          skip ? '小小探险队' : userName.trim(),
          skip ? '小精灵' : buddyName.trim()
        );
        finishFirstLaunch();
        navigate('/map', { replace: true });
      } catch {
        setError('还没能保存名字，你的输入已保留。请再试一次。');
      } finally {
        submitting.current = false;
        setBusy(false);
      }
    },
    [userName, buddyName, finishFirstLaunch, navigate]
  );
  const loading = init.isChecking || init.isInitializing;
  return (
    <div className={styles.page} data-testid="onboarding-page">
      <header className={styles.header}>
        <span className={styles.logo}>
          <BookOpen size={23} />
        </span>
        <strong>Magic Buddy</strong>
        <span>英语启蒙，从好奇开始</span>
      </header>
      <main className={styles.layout}>
        <section
          className={`${styles.storyPanel} ${step !== 'welcome' ? styles.hideOnMobile : ''}`}
        >
          <span className={styles.eyebrow}>
            <Sparkles size={14} /> A LITTLE EVERY DAY
          </span>
          <h1>
            小小好奇心，
            <br />
            大大的<span>魔法世界。</span>
          </h1>
          <p>
            一个故事，一个新单词。
            <br />
            和专属伙伴一起，让英语成为每天的小期待。
          </p>
          <BuddyScene className={styles.illustration} />
          <div className={styles.features}>
            <span>
              <BookOpen size={17} /> 分级故事
            </span>
            <span>
              <Headphones size={17} /> 边听边读
            </span>
            <span>
              <Sparkles size={17} /> 趣味练习
            </span>
          </div>
        </section>
        <section className={styles.setupPanel}>
          <div
            className={styles.steps}
            aria-label={`第 ${step === 'welcome' ? 1 : step === 'hatching' ? 2 : 3} 步，共 3 步`}
          >
            <span className={styles.stepActive} />
            <span className={step !== 'welcome' ? styles.stepActive : ''} />
            <span className={step === 'naming' ? styles.stepActive : ''} />
          </div>
          {loading ? (
            <div className={styles.state} role="status">
              <Sparkles size={32} />
              <h2>正在准备魔法世界</h2>
              <p>{init.message}</p>
              <progress value={init.progress} max={100} aria-label="内容加载进度" />
            </div>
          ) : init.error ? (
            <div className={styles.state} role="alert">
              <h2>内容还没有准备好</h2>
              <p>请重新加载，准备好后就能开始冒险。</p>
              <Button onClick={retry}>重新加载</Button>
            </div>
          ) : (
            <>
              {step !== 'welcome' && (
                <button
                  className={styles.back}
                  onClick={() => {
                    setError('');
                    setStep(step === 'naming' ? 'hatching' : 'welcome');
                  }}
                  disabled={busy}
                >
                  <ArrowLeft size={16} /> 上一步
                </button>
              )}
              {step === 'welcome' && (
                <>
                  <span className={styles.stepLabel}>01 / 遇见你的伙伴</span>
                  <h2>你好，小小冒险家！</h2>
                  <p className={styles.description}>
                    一部手机，也能开启英语冒险。
                    <br />
                    和老师、伙伴们一起听故事。
                  </p>
                  <div className={styles.eggPreview} aria-hidden="true">
                    🥚<span>一份只属于你的惊喜</span>
                  </div>
                  <Button
                    fullWidth
                    loading={busy}
                    rightIcon={<ArrowRight size={17} />}
                    onClick={() => create(true)}
                  >
                    直接开始，一起学英语
                  </Button>
                  <button
                    className={styles.skip}
                    onClick={() => setStep('hatching')}
                    disabled={busy}
                  >
                    先为我们的伙伴起个名字
                  </button>
                  <button
                    className={styles.skip}
                    onClick={() => navigate('/settings')}
                    disabled={busy}
                  >
                    已有学习记录？恢复备份或管理档案
                  </button>
                </>
              )}
              {step === 'hatching' && (
                <>
                  <span className={styles.stepLabel}>02 / 唤醒小伙伴</span>
                  <h2>把一点魔法，交给它。</h2>
                  <p className={styles.description}>
                    按住魔法蛋，就能唤醒伙伴。
                    <br />
                    也可以轻点下方按钮直接孵化。
                  </p>
                  <div className={styles.egg} {...handlers}>
                    <MagicEgg
                      state={progress > 0 ? 'awakening' : 'dormant'}
                      holdProgress={progress}
                    />
                  </div>
                  <Button fullWidth onClick={() => setStep('naming')}>
                    轻点孵化 <Sparkles size={17} />
                  </Button>
                </>
              )}
              {step === 'naming' && (
                <>
                  <span className={styles.stepLabel}>03 / 认识一下吧</span>
                  <h2>我们的冒险，从名字开始。</h2>
                  <p className={styles.description}>为你和伙伴起个喜欢的昵称。</p>
                  <form
                    className={styles.form}
                    onSubmit={event => {
                      event.preventDefault();
                      void create();
                    }}
                  >
                    <label htmlFor="userName">
                      你的昵称
                      <input
                        id="userName"
                        autoFocus
                        value={userName}
                        onChange={event => setUserName(event.target.value)}
                        placeholder="例如：小橙子"
                        maxLength={20}
                        required
                        disabled={busy}
                        autoComplete="nickname"
                      />
                    </label>
                    <label htmlFor="buddyName">
                      伙伴的名字
                      <input
                        id="buddyName"
                        value={buddyName}
                        onChange={event => setBuddyName(event.target.value)}
                        placeholder="例如：布布"
                        maxLength={20}
                        required
                        disabled={busy}
                        autoComplete="off"
                      />
                    </label>
                    <Button
                      type="submit"
                      loading={busy}
                      fullWidth
                      rightIcon={<ArrowRight size={17} />}
                    >
                      一起开始冒险
                    </Button>
                  </form>
                </>
              )}
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
            </>
          )}
          <p className={styles.privacy}>
            <ShieldCheck size={14} /> 无需账号 · 共用设备也能分开保存学习档案
          </p>
        </section>
      </main>
      <footer className={styles.footer}>每一次尝试，都值得被鼓励。</footer>
    </div>
  );
}

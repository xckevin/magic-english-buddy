/**
 * 新手引导页面
 * 包含数据初始化和角色创建流程
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { useInitialization } from '@/hooks/useInitialization';
import { createUser, getCurrentUser } from '@/db';
import { Button } from '@/components/common';
import styles from './OnboardingPage.module.css';

type OnboardingStep = 'loading' | 'welcome' | 'naming' | 'ready';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setFirstLaunchComplete, isFirstLaunch, currentUserId } = useAppStore();
  const { state: initState } = useInitialization();
  
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [userName, setUserName] = useState('');
  const [buddyName, setBuddyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 检查初始化状态
  useEffect(() => {
    if (initState.isComplete && step === 'loading') {
      // 检查是否已有用户
      if (currentUserId && !isFirstLaunch) {
        navigate('/map', { replace: true });
      } else {
        setStep('welcome');
      }
    }
  }, [initState.isComplete, step, currentUserId, isFirstLaunch, navigate]);

  // 处理创建用户
  const handleCreateUser = async () => {
    if (!userName.trim() || !buddyName.trim()) return;
    
    setIsCreating(true);
    try {
      const user = await createUser(userName.trim(), buddyName.trim());
      setCurrentUser(user.id);
      setFirstLaunchComplete();
      setStep('ready');
      
      // 延迟跳转
      setTimeout(() => {
        navigate('/map');
      }, 2000);
    } catch (error) {
      console.error('Create user failed:', error);
      setIsCreating(false);
    }
  };

  // 快速开始（跳过命名）
  const handleQuickStart = async () => {
    setIsCreating(true);
    try {
      // 检查是否已有用户
      let user = await getCurrentUser();
      if (!user) {
        user = await createUser('小魔法师', '星星');
      }
      setCurrentUser(user.id);
      setFirstLaunchComplete();
      navigate('/map');
    } catch (error) {
      console.error('Quick start failed:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 背景层 */}
      <div className={styles.background}>
        <div className={styles.stars} />
        <div className={styles.mist} />
      </div>

      {/* 内容层 */}
      <AnimatePresence mode="wait">
        {/* 加载中 */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            className={styles.content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.loadingArea}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>{initState.message}</p>
              {initState.isInitializing && (
                <div className={styles.progressBar}>
                  <motion.div
                    className={styles.progressFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${initState.progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 欢迎页 */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              className={styles.logoArea}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className={styles.title}>Magic English Buddy</h1>
              <p className={styles.subtitle}>你的魔法英语伙伴</p>
            </motion.div>

            <motion.div
              className={styles.eggArea}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <div className={styles.eggPlaceholder}>
                <span className={styles.eggEmoji}>🥚</span>
                <p className={styles.eggHint}>一颗神秘的魔法蛋</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.buttonGroup}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button variant="primary" size="lg" fullWidth onClick={() => setStep('naming')}>
                唤醒我的伙伴 ✨
              </Button>
              <button className={styles.skipBtn} onClick={handleQuickStart}>
                跳过，直接开始
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 命名页 */}
        {step === 'naming' && (
          <motion.div
            key="naming"
            className={styles.content}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <motion.div
              className={styles.namingCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className={styles.namingTitle}>创建你的魔法档案</h2>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>你的名字</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="输入你的名字..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={12}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>给伙伴起个名字</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="给你的魔法伙伴起个名字..."
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  maxLength={12}
                />
              </div>

              <div className={styles.buddyPreview}>
                <span className={styles.previewEmoji}>🐣</span>
                <p className={styles.previewName}>{buddyName || '???'}</p>
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!userName.trim() || !buddyName.trim()}
                  loading={isCreating}
                  onClick={handleCreateUser}
                >
                  开始冒险！
                </Button>
                <button className={styles.backBtn} onClick={() => setStep('welcome')}>
                  ← 返回
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 准备完成 */}
        {step === 'ready' && (
          <motion.div
            key="ready"
            className={styles.content}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className={styles.readyArea}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <motion.span
                className={styles.readyEmoji}
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                🎉
              </motion.span>
              <h2 className={styles.readyTitle}>准备完成！</h2>
              <p className={styles.readyText}>
                {buddyName} 已经迫不及待要和你一起冒险了！
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;

/**
 * 新手引导页面
 * P0-4 阶段实现
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import styles from './OnboardingPage.module.css';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUserId, isFirstLaunch, setFirstLaunchComplete } = useAppStore();

  // 如果已有用户且不是首次启动，跳转到地图页
  useEffect(() => {
    if (currentUserId && !isFirstLaunch) {
      navigate('/map', { replace: true });
    }
  }, [currentUserId, isFirstLaunch, navigate]);

  // 临时：快速进入按钮
  const handleQuickStart = () => {
    setFirstLaunchComplete();
    navigate('/map');
  };

  return (
    <div className={styles.container}>
      {/* 背景层 */}
      <div className={styles.background}>
        <div className={styles.stars} />
        <div className={styles.mist} />
      </div>

      {/* 内容层 */}
      <motion.div
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo 区域 */}
        <motion.div
          className={styles.logoArea}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className={styles.title}>Magic English Buddy</h1>
          <p className={styles.subtitle}>你的魔法英语伙伴</p>
        </motion.div>

        {/* 魔法蛋区域 - P0-4 阶段实现动画 */}
        <motion.div
          className={styles.eggArea}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className={styles.eggPlaceholder}>
            <span className={styles.eggEmoji}>🥚</span>
            <p className={styles.eggHint}>魔法蛋等待唤醒</p>
          </div>
        </motion.div>

        {/* 提示文字 */}
        <motion.p
          className={styles.hint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          长按魔法蛋，唤醒你的伙伴
        </motion.p>

        {/* 临时快速开始按钮 */}
        <motion.button
          className={styles.quickStartBtn}
          onClick={handleQuickStart}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          开始探索 ✨
        </motion.button>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;


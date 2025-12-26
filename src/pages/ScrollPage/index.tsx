/**
 * 守护者卷轴页面
 * P2-11 阶段实现完整功能
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './ScrollPage.module.css';

const ScrollPage: React.FC = () => {
  const navigate = useNavigate();

  // 临时：模拟用户数据
  const mockData = {
    userName: '小明',
    buddyName: '星星',
    level: 1,
    levelTitle: '见习魔法师',
    storiesRead: 3,
    wordsLearned: 42,
    totalTime: 25,
    streakDays: 2,
    achievements: ['first_story', 'word_10'],
  };

  const handleBack = () => {
    navigate('/map');
  };

  return (
    <div className={styles.container}>
      {/* 顶部栏 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← 返回
        </button>
        <h1 className={styles.title}>守护者卷轴</h1>
        <div style={{ width: 60 }} />
      </header>

      {/* 卷轴内容 */}
      <main className={styles.scrollContent}>
        <motion.div
          className={styles.scrollCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 个人信息卡 */}
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>🐣</div>
              <div className={styles.buddyBadge}>Lv.{mockData.level}</div>
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.userName}>{mockData.userName}</h2>
              <p className={styles.buddyInfo}>
                伙伴：{mockData.buddyName}
              </p>
              <span className={styles.levelBadge}>{mockData.levelTitle}</span>
            </div>
          </div>

          {/* 数据统计 */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📚</span>
              <span className={styles.statValue}>{mockData.storiesRead}</span>
              <span className={styles.statLabel}>故事</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📝</span>
              <span className={styles.statValue}>{mockData.wordsLearned}</span>
              <span className={styles.statLabel}>单词</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValue}>{mockData.totalTime}</span>
              <span className={styles.statLabel}>分钟</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🔥</span>
              <span className={styles.statValue}>{mockData.streakDays}</span>
              <span className={styles.statLabel}>连续天</span>
            </div>
          </div>

          {/* 二维码区域 - 占位 */}
          <div className={styles.qrSection}>
            <div className={styles.qrPlaceholder}>
              <span className={styles.qrEmoji}>📱</span>
              <p>扫描二维码同步进度</p>
            </div>
            <p className={styles.qrHint}>请让老师扫描以同步魔法数据</p>
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <span>💾</span>
            <span>保存图片</span>
          </button>
          <button className={styles.actionBtn}>
            <span>🖨️</span>
            <span>打印证书</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ScrollPage;


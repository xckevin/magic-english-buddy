/**
 * 地图页面
 * P1-5 阶段实现完整功能
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './MapPage.module.css';

const MapPage: React.FC = () => {
  const navigate = useNavigate();

  // 临时：模拟故事列表
  const mockStories = [
    { id: 'l1_001', title: 'The Magic Apple', level: 1, unlocked: true },
    { id: 'l1_002', title: 'A Little Rabbit', level: 1, unlocked: true },
    { id: 'l1_003', title: 'Red and Blue', level: 1, unlocked: false },
    { id: 'l1_004', title: 'The Big Tree', level: 1, unlocked: false },
  ];

  return (
    <div className={styles.container}>
      {/* 顶部状态栏 */}
      <header className={styles.header}>
        <div className={styles.buddyInfo}>
          <div className={styles.buddyAvatar}>🐣</div>
          <div className={styles.buddyStats}>
            <span className={styles.level}>Lv.1 见习魔法师</span>
            <div className={styles.mpBar}>
              <div className={styles.mpFill} style={{ width: '30%' }} />
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.iconBtn}
            onClick={() => navigate('/scroll')}
          >
            📜
          </button>
        </div>
      </header>

      {/* 地图区域 - P1 阶段实现完整地图 */}
      <main className={styles.mapArea}>
        <motion.div
          className={styles.mapContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className={styles.regionTitle}>🌲 萌芽之森</h2>
          <p className={styles.regionDesc}>Level 1 区域 - 开始你的魔法之旅</p>

          {/* 临时故事列表 */}
          <div className={styles.storyList}>
            {mockStories.map((story, index) => (
              <motion.button
                key={story.id}
                className={`${styles.storyNode} ${story.unlocked ? styles.unlocked : styles.locked}`}
                onClick={() => story.unlocked && navigate(`/reader/${story.id}`)}
                disabled={!story.unlocked}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileTap={story.unlocked ? { scale: 0.95 } : {}}
              >
                <span className={styles.nodeIcon}>
                  {story.unlocked ? '⭐' : '🔒'}
                </span>
                <span className={styles.nodeTitle}>{story.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* 底部导航 */}
      <nav className={styles.bottomNav}>
        <button className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>🗺️</span>
          <span className={styles.navLabel}>地图</span>
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>📚</span>
          <span className={styles.navLabel}>图鉴</span>
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>🐣</span>
          <span className={styles.navLabel}>伙伴</span>
        </button>
        <button 
          className={styles.navItem}
          onClick={() => navigate('/scroll')}
        >
          <span className={styles.navIcon}>📜</span>
          <span className={styles.navLabel}>卷轴</span>
        </button>
      </nav>
    </div>
  );
};

export default MapPage;


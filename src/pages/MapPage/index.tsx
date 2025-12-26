/**
 * MapPage 地图页面
 * 故事列表、进度显示、Buddy 状态
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { db, type Story, type MapNode } from '@/db';
import { readingProgressService } from '@/services/readingProgressService';
import styles from './MapPage.module.css';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentUserId } = useAppStore();

  // 故事数据
  const [stories, setStories] = useState<Story[]>([]);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [loading, setLoading] = useState(true);

  // 统计数据
  const [stats, setStats] = useState({
    todayStories: 0,
    totalStories: 0,
    streakDays: 0,
  });

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 加载故事
        const allStories = await db.stories.where('level').equals(1).toArray();
        setStories(allStories);

        // 加载地图节点
        const nodes = await db.mapNodes.toArray();
        setMapNodes(nodes);

        // 加载统计
        if (currentUserId) {
          const todayStats = await readingProgressService.getTodayStats(currentUserId);
          const totalStats = await readingProgressService.getTotalStats(currentUserId);
          setStats({
            todayStories: todayStats.storiesRead,
            totalStories: totalStats.totalStories,
            streakDays: totalStats.streakDays,
          });
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUserId]);

  // 点击故事
  const handleStoryClick = useCallback((story: Story) => {
    if (isStoryClickable(story)) {
      navigate(`/reader/${story.id}`);
    }
  }, [navigate, mapNodes]);

  // 解锁下一个故事
  const unlockNextStory = useCallback(async (currentStoryId: string) => {
    const currentIndex = stories.findIndex(s => s.id === currentStoryId);
    if (currentIndex >= 0 && currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      await db.stories.update(nextStory.id, { unlocked: true });
      await db.mapNodes.update(nextStory.id, { unlocked: true });
      
      // 刷新数据
      const updatedStories = await db.stories.where('level').equals(1).toArray();
      setStories(updatedStories);
    }
  }, [stories]);

  // 获取故事状态（基于 mapNodes）
  const getStoryStatus = (story: Story): 'locked' | 'available' | 'completed' => {
    const node = mapNodes.find(n => n.storyId === story.id);
    if (node?.completed) return 'completed';
    if (node?.unlocked) return 'available';
    return 'locked';
  };

  // 检查故事是否可点击
  const isStoryClickable = (story: Story): boolean => {
    const node = mapNodes.find(n => n.storyId === story.id);
    return node?.unlocked || false;
  };

  // 获取故事图标
  const getStoryEmoji = (storyId: string): string => {
    const emojiMap: Record<string, string> = {
      'l1_001': '🍎',
      'l1_002': '🐱',
      'l1_003': '🌈',
      'l1_004': '👨‍👩‍👧',
      'l1_005': '🌅',
      'l1_006': '🔢',
      'l1_007': '🐶',
      'l1_008': '🏞️',
      'l1_009': '🧸',
      'l1_010': '🌙',
    };
    return emojiMap[storyId] || '📖';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>加载地图中...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 头部状态栏 */}
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {currentUser?.buddyName?.charAt(0) || '🐣'}
          </div>
          <div className={styles.userText}>
            <span className={styles.greeting}>你好，{currentUser?.name || '小魔法师'}</span>
            <span className={styles.buddyName}>{currentUser?.buddyName || '小精灵'}</span>
          </div>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.todayStories}</span>
            <span className={styles.statLabel}>今日</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.totalStories}</span>
            <span className={styles.statLabel}>已读</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>🔥 {stats.streakDays}</span>
            <span className={styles.statLabel}>连续</span>
          </div>
        </div>
      </header>

      {/* 等级标题 */}
      <div className={styles.levelHeader}>
        <h2 className={styles.levelTitle}>Level 1 · 魔法起源</h2>
        <p className={styles.levelDesc}>简单句型，基础词汇</p>
      </div>

      {/* 故事列表 */}
      <main className={styles.storyList}>
        {stories.map((story, index) => {
          const status = getStoryStatus(story);
          const emoji = getStoryEmoji(story.id);
          
          return (
            <motion.div
              key={story.id}
              className={`${styles.storyCard} ${styles[status]}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleStoryClick(story)}
            >
              {/* 连接线 */}
              {index < stories.length - 1 && (
                <div className={`${styles.connector} ${stories[index + 1]?.unlocked ? styles.active : ''}`} />
              )}

              {/* 故事图标 */}
              <div className={styles.storyIcon}>
                {status === 'locked' ? '🔒' : emoji}
              </div>

              {/* 故事信息 */}
              <div className={styles.storyInfo}>
                <h3 className={styles.storyTitle}>
                  {status === 'locked' ? '???' : story.title}
                </h3>
                <div className={styles.storyMeta}>
                  {status === 'completed' && <span className={styles.badge}>✅ 已完成</span>}
                  {status === 'available' && <span className={styles.badgeNew}>🆕 可阅读</span>}
                  {status === 'locked' && <span className={styles.badgeLocked}>🔒 未解锁</span>}
                </div>
              </div>

              {/* 箭头 */}
              {status !== 'locked' && (
                <div className={styles.arrow}>→</div>
              )}
            </motion.div>
          );
        })}
      </main>

      {/* 底部导航 */}
      <nav className={styles.bottomNav}>
        <button className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>🗺️</span>
          <span className={styles.navLabel}>地图</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('/scroll')}>
          <span className={styles.navIcon}>📜</span>
          <span className={styles.navLabel}>卷轴</span>
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>📚</span>
          <span className={styles.navLabel}>魔典</span>
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>设置</span>
        </button>
      </nav>
    </div>
  );
};

export default MapPage;


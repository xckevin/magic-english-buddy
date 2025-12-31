/**
 * LevelDivider - 级别分隔区域
 * 显示级别名称和进度
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { LevelSection } from '@/data/unifiedMap';
import { levelThemeColors, type LevelNumber } from '@/data/unifiedMap';
import styles from './styles.module.css';

interface LevelDividerProps {
  section: LevelSection;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  isCurrentLevel: boolean;
  isUnlocked: boolean;
}

const LevelDivider: React.FC<LevelDividerProps> = memo(({
  section,
  progress,
  isCurrentLevel,
  isUnlocked,
}) => {
  const themeColor = levelThemeColors[section.level as LevelNumber];
  
  // 级别主题图标
  const levelIcons: Record<number, string> = {
    1: '🌲',  // 萌芽之森
    2: '🏔️',  // 回声山谷
    3: '🌊',  // 深海秘境
    4: '☁️',  // 云端城堡
    5: '⭐',  // 星空迷宫
    6: '⏳',  // 时光长廊
    7: '💎',  // 魔力核心
  };
  
  return (
    <motion.div
      className={`
        ${styles.levelDivider}
        ${isCurrentLevel ? styles.levelDividerCurrent : ''}
        ${!isUnlocked ? styles.levelDividerLocked : ''}
      `}
      style={{
        '--level-color': themeColor.primary,
        '--level-color-secondary': themeColor.secondary,
        '--level-bg': themeColor.bg,
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 级别图标 */}
      <div className={styles.levelIcon}>
        {isUnlocked ? levelIcons[section.level] : '🔒'}
      </div>
      
      {/* 级别信息 */}
      <div className={styles.levelInfo}>
        <span className={styles.levelName}>
          {section.region.nameCn}
        </span>
        <span className={styles.levelSubtitle}>
          Level {section.level} · {section.region.name}
        </span>
      </div>
      
      {/* 进度指示 */}
      {isUnlocked && (
        <div className={styles.levelProgress}>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className={styles.progressText}>
            {progress.completed}/{progress.total}
          </span>
        </div>
      )}
      
      {/* 当前级别标记 */}
      {isCurrentLevel && (
        <motion.div
          className={styles.currentLevelBadge}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          当前
        </motion.div>
      )}
    </motion.div>
  );
});

LevelDivider.displayName = 'LevelDivider';

export default LevelDivider;


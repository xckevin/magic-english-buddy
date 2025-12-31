/**
 * RegionIndicator - 区域指示器组件
 * 底部圆点指示器，显示当前区域位置，支持快速跳转
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { LevelSection, UnifiedMapNode } from '@/data/unifiedMap';
import { levelThemeColors, getLevelProgress } from '@/data/unifiedMap';
import styles from './styles.module.css';

interface RegionIndicatorProps {
  sections: LevelSection[];
  currentIndex: number;
  nodes: UnifiedMapNode[];
  onRegionClick: (index: number) => void;
}

// 区域 emoji
const regionEmojis: Record<number, string> = {
  1: '🌲',
  2: '⛰️',
  3: '🌊',
  4: '☁️',
  5: '⭐',
  6: '⏳',
  7: '💎',
};

const RegionIndicator: React.FC<RegionIndicatorProps> = memo(({
  sections,
  currentIndex,
  nodes,
  onRegionClick,
}) => {
  // 计算每个区域的进度
  const regionProgress = useMemo(() => {
    return sections.map(section => {
      const progress = getLevelProgress(nodes, section.level);
      const isUnlocked = nodes.some(n => n.level === section.level && n.unlocked);
      return { ...progress, isUnlocked };
    });
  }, [sections, nodes]);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {/* 指示器圆点 */}
        <div className={styles.dots}>
          {sections.map((section, index) => {
            const isCurrent = index === currentIndex;
            const progress = regionProgress[index];
            const themeColors = levelThemeColors[section.level];
            const emoji = regionEmojis[section.level];
            
            return (
              <motion.button
                key={section.level}
                className={`
                  ${styles.dot}
                  ${isCurrent ? styles.dotCurrent : ''}
                  ${!progress.isUnlocked ? styles.dotLocked : ''}
                  ${progress.percentage === 100 ? styles.dotCompleted : ''}
                `}
                style={{
                  '--dot-color': themeColors.primary,
                  '--dot-color-secondary': themeColors.secondary,
                } as React.CSSProperties}
                onClick={() => onRegionClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title={`Level ${section.level}: ${section.region.nameCn}`}
              >
                {/* 进度环 */}
                {progress.isUnlocked && progress.percentage > 0 && progress.percentage < 100 && (
                  <svg className={styles.progressRing} viewBox="0 0 36 36">
                    <circle
                      className={styles.progressBg}
                      cx="18"
                      cy="18"
                      r="16"
                    />
                    <circle
                      className={styles.progressFill}
                      cx="18"
                      cy="18"
                      r="16"
                      strokeDasharray={`${progress.percentage} 100`}
                    />
                  </svg>
                )}
                
                {/* 内容 */}
                <span className={styles.dotContent}>
                  {isCurrent ? emoji : (progress.isUnlocked ? section.level : '🔒')}
                </span>
                
                {/* 当前指示器 */}
                {isCurrent && (
                  <motion.div
                    className={styles.currentIndicator}
                    layoutId="currentRegion"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 区域名称 */}
        <motion.div
          className={styles.regionName}
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className={styles.regionEmoji}>{regionEmojis[sections[currentIndex]?.level]}</span>
          <span className={styles.regionTitle}>
            {sections[currentIndex]?.region.nameCn || '未知区域'}
          </span>
          <span className={styles.regionProgress}>
            {regionProgress[currentIndex]?.percentage}%
          </span>
        </motion.div>
      </div>
    </div>
  );
});

RegionIndicator.displayName = 'RegionIndicator';

export default RegionIndicator;


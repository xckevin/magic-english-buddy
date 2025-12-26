/**
 * MapNode 组件
 * 地图上的单个节点，支持不同状态和类型
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { MapNode } from '@/db';
import styles from './MapNode.module.css';

interface MapNodeProps {
  /** 节点数据 */
  node: MapNode;
  /** 是否激活状态 */
  isActive?: boolean;
  /** 点击回调 */
  onClick?: () => void;
}

// 节点类型样式映射
const typeStyles: Record<string, { bg: string; border: string; glow: string }> = {
  story: {
    bg: 'linear-gradient(135deg, #6B5CE7 0%, #8B7CF7 100%)',
    border: '#9B8CF7',
    glow: 'rgba(107, 92, 231, 0.5)',
  },
  boss: {
    bg: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    border: '#FCD34D',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  bonus: {
    bg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    border: '#6EE7B7',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  challenge: {
    bg: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    border: '#FCA5A5',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
};

export const MapNodeComponent = memo<MapNodeProps>(({
  node,
  isActive = false,
  onClick,
}) => {
  const nodeType = node.type || 'story';
  const style = typeStyles[nodeType] || typeStyles.story;
  const isLocked = !node.unlocked;
  const isCompleted = node.completed;

  // 动画变体
  const variants = {
    idle: {
      scale: 1,
    },
    active: {
      scale: [1, 1.1, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
      },
    },
    hover: {
      scale: 1.1,
    },
    tap: {
      scale: 0.95,
    },
  };

  // 光圈动画
  const pulseVariants = {
    idle: {
      scale: 1,
      opacity: 0,
    },
    active: {
      scale: [1, 1.8, 1],
      opacity: [0.8, 0, 0.8],
      transition: {
        repeat: Infinity,
        duration: 2,
      },
    },
  };

  return (
    <motion.div
      className={`${styles.node} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      variants={variants}
      initial="idle"
      animate={isActive ? 'active' : 'idle'}
      whileHover={!isLocked ? 'hover' : undefined}
      whileTap={!isLocked ? 'tap' : undefined}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* 激活光圈 */}
      {isActive && !isLocked && (
        <motion.div
          className={styles.pulse}
          style={{ background: style.glow }}
          variants={pulseVariants}
          initial="idle"
          animate="active"
        />
      )}

      {/* 节点主体 */}
      <div
        className={styles.body}
        style={{
          background: isLocked ? 'linear-gradient(135deg, #374151 0%, #4B5563 100%)' : style.bg,
          borderColor: isLocked ? '#6B7280' : style.border,
          boxShadow: isLocked ? 'none' : `0 0 20px ${style.glow}`,
        }}
      >
        {/* 图标 */}
        <span className={styles.icon}>
          {isLocked ? '🔒' : node.emoji || '📖'}
        </span>

        {/* 完成标记 */}
        {isCompleted && (
          <div className={styles.completeMark}>✓</div>
        )}

        {/* Boss 皇冠 */}
        {nodeType === 'boss' && !isLocked && (
          <div className={styles.crown}>👑</div>
        )}
      </div>

      {/* 节点标签 */}
      {!isLocked && (
        <motion.div
          className={styles.label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className={styles.title}>{node.titleCn || node.title}</span>
          {nodeType === 'challenge' && (
            <span className={styles.badge}>挑战</span>
          )}
          {nodeType === 'bonus' && (
            <span className={styles.badgeBonus}>奖励</span>
          )}
        </motion.div>
      )}

      {/* 锁定时显示 ??? */}
      {isLocked && (
        <div className={styles.lockedLabel}>???</div>
      )}
    </motion.div>
  );
});

MapNodeComponent.displayName = 'MapNode';

export default MapNodeComponent;


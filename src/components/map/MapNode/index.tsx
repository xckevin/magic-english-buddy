/**
 * MapNode 组件
 * 地图上的单个节点，支持不同状态和类型
 */

import React, { memo } from 'react';
import type { MapNode } from '@/db';
import styles from './MapNode.module.css';

interface MapNodeProps {
  /** 节点数据 */
  node: MapNode;
  /** 是否激活状态 */
  isActive?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 节点大小 */
  size?: number;
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
  size = 56,
}) => {
  const nodeType = node.type || 'story';
  const style = typeStyles[nodeType] || typeStyles.story;
  const isLocked = !node.unlocked;
  const isCompleted = node.completed;
  
  // 根据size计算各元素尺寸
  const iconSize = Math.round(size * 0.5);
  const pulseSize = Math.round(size * 1.1);
  const markSize = Math.round(size * 0.35);

  return (
    <div
      className={`${styles.node} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        cursor: isLocked ? 'default' : 'pointer',
      }}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* 激活光圈 - 使用CSS动画保持节点稳定 */}
      {isActive && !isLocked && (
        <div
          className={styles.pulse}
          style={{ 
            background: style.glow,
            width: pulseSize,
            height: pulseSize,
          }}
        />
      )}

      {/* 节点主体 */}
      <div
        className={styles.body}
        style={{
          width: size,
          height: size,
          background: isLocked ? 'linear-gradient(135deg, #374151 0%, #4B5563 100%)' : style.bg,
          borderColor: isLocked ? '#6B7280' : style.border,
          boxShadow: isLocked ? 'none' : `0 0 ${size * 0.35}px ${style.glow}`,
        }}
      >
        {/* 图标 */}
        <span className={styles.icon} style={{ fontSize: iconSize }}>
          {isLocked ? '🔒' : node.emoji || '📖'}
        </span>

        {/* 完成标记 */}
        {isCompleted && (
          <div 
            className={styles.completeMark}
            style={{
              width: markSize,
              height: markSize,
              fontSize: markSize * 0.6,
            }}
          >
            ✓
          </div>
        )}

        {/* Boss 皇冠 */}
        {nodeType === 'boss' && !isLocked && (
          <div className={styles.crown} style={{ fontSize: size * 0.35 }}>👑</div>
        )}
      </div>

      {/* 节点标签 */}
      {!isLocked && (
        <div className={styles.label}>
          <span className={styles.title} style={{ fontSize: Math.max(10, size * 0.2) }}>
            {node.titleCn || node.title}
          </span>
          {nodeType === 'challenge' && (
            <span className={styles.badge}>挑战</span>
          )}
          {nodeType === 'bonus' && (
            <span className={styles.badgeBonus}>奖励</span>
          )}
        </div>
      )}

      {/* 锁定时显示 ??? */}
      {isLocked && (
        <div className={styles.lockedLabel} style={{ fontSize: Math.max(10, size * 0.2) }}>???</div>
      )}
    </div>
  );
});

MapNodeComponent.displayName = 'MapNode';

export default MapNodeComponent;


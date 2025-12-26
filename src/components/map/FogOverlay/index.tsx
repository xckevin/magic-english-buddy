/**
 * FogOverlay 组件
 * 迷雾遮罩效果，只显示已解锁区域
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MapNode } from '@/db';
import styles from './FogOverlay.module.css';

interface FogOverlayProps {
  /** 节点列表 */
  nodes: MapNode[];
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 可见半径 */
  visibleRadius?: number;
}

export const FogOverlay = memo<FogOverlayProps>(({
  nodes,
  width,
  height,
  visibleRadius = 100,
}) => {
  // 生成 SVG mask 的路径数据
  const maskId = useMemo(() => `fog-mask-${Math.random().toString(36).substr(2, 9)}`, []);

  // 获取已解锁节点
  const unlockedNodes = useMemo(() => 
    nodes.filter(node => node.unlocked),
    [nodes]
  );

  // 获取下一个可解锁的节点（预览）
  const nextNodes = useMemo(() => {
    const lastUnlocked = unlockedNodes[unlockedNodes.length - 1];
    if (!lastUnlocked) return [];
    
    return nodes.filter(node => 
      !node.unlocked && 
      node.prerequisites?.includes(lastUnlocked.id)
    );
  }, [nodes, unlockedNodes]);

  return (
    <svg 
      className={styles.fog}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* 迷雾遮罩 */}
        <mask id={maskId}>
          {/* 默认全黑（迷雾） */}
          <rect x="0" y="0" width={width} height={height} fill="white" />
          
          {/* 已解锁区域挖洞（透明） */}
          {unlockedNodes.map((node) => (
            <motion.circle
              key={node.id}
              cx={node.position.x}
              cy={node.position.y}
              fill="black"
              initial={{ r: 0 }}
              animate={{ r: visibleRadius }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
          
          {/* 下一个可解锁节点（半透明预览） */}
          {nextNodes.map((node) => (
            <motion.circle
              key={`preview-${node.id}`}
              cx={node.position.x}
              cy={node.position.y}
              fill="rgba(0, 0, 0, 0.5)"
              initial={{ r: 0 }}
              animate={{ r: visibleRadius * 0.6 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            />
          ))}
        </mask>

        {/* 径向渐变用于柔化边缘 */}
        <radialGradient id="fog-gradient">
          <stop offset="0%" stopColor="rgba(15, 23, 42, 0)" />
          <stop offset="70%" stopColor="rgba(15, 23, 42, 0.3)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0.95)" />
        </radialGradient>
      </defs>

      {/* 迷雾层 */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#fog-gradient)"
        mask={`url(#${maskId})`}
        className={styles.fogLayer}
      />

      {/* 神秘粒子效果 */}
      <g className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={i}
            r={2}
            fill="rgba(167, 139, 250, 0.3)"
            initial={{
              cx: Math.random() * width,
              cy: Math.random() * height,
              opacity: 0,
            }}
            animate={{
              cy: [null, Math.random() * height],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </g>
    </svg>
  );
});

FogOverlay.displayName = 'FogOverlay';

export default FogOverlay;


/**
 * MapNode - 地图节点组件
 * 根据节点类型和状态显示不同样式
 */

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { UnifiedMapNode } from '@/data/unifiedMap';
import { getNodeVisualConfig, nodeTypeStyles } from '@/data/unifiedMap';
import styles from './styles.module.css';

interface MapNodeProps {
  node: UnifiedMapNode;
  isActive: boolean;
  onClick: (node: UnifiedMapNode) => void;
  style?: React.CSSProperties;
}

const MapNode: React.FC<MapNodeProps> = memo(({ node, isActive, onClick, style }) => {
  const visual = getNodeVisualConfig(node);
  const typeStyle = nodeTypeStyles[node.type] || nodeTypeStyles.story;
  
  const handleClick = useCallback(() => {
    if (node.unlocked) {
      onClick(node);
    }
  }, [node, onClick]);
  
  // 节点大小
  const sizeClass = {
    sm: styles.nodeSm,
    md: styles.nodeMd,
    lg: styles.nodeLg,
  }[typeStyle.size];
  
  return (
    <motion.div
      className={styles.nodeWrapper}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 节点主体 */}
      <motion.button
        className={`
          ${styles.node}
          ${sizeClass}
          ${node.unlocked ? styles.nodeUnlocked : styles.nodeLocked}
          ${node.completed ? styles.nodeCompleted : ''}
          ${isActive ? styles.nodeActive : ''}
        `}
        style={{
          '--node-color': visual.themeColor.primary,
          '--node-color-secondary': visual.themeColor.secondary,
          opacity: visual.opacity,
          filter: visual.grayscale ? 'grayscale(0.8)' : 'none',
        } as React.CSSProperties}
        onClick={handleClick}
        disabled={!node.unlocked}
        whileHover={node.unlocked ? { scale: 1.1 } : undefined}
        whileTap={node.unlocked ? { scale: 0.95 } : undefined}
      >
        {/* 发光效果 */}
        {visual.glow && !node.completed && (
          <div className={styles.nodeGlow} />
        )}
        
        {/* 图标 */}
        <span className={styles.nodeIcon}>
          {node.emoji || typeStyle.icon}
        </span>
        
        {/* 完成标记 */}
        {node.completed && (
          <motion.div
            className={styles.checkmark}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            ✓
          </motion.div>
        )}
        
        {/* 锁定图标 */}
        {!node.unlocked && (
          <div className={styles.lockIcon}>
            🔒
          </div>
        )}
        
        {/* Boss 特殊效果 */}
        {node.type === 'boss' && node.unlocked && !node.completed && (
          <div className={styles.bossRing} />
        )}
      </motion.button>
      
      {/* 节点标题 */}
      <div className={`${styles.nodeLabel} ${!node.unlocked ? styles.nodeLabelLocked : ''}`}>
        <span className={styles.nodeTitleCn}>{node.titleCn}</span>
        {node.type !== 'story' && (
          <span className={styles.nodeType}>
            {node.type === 'boss' ? 'Boss' : 
             node.type === 'challenge' ? '挑战' :
             node.type === 'bonus' ? '奖励' : ''}
          </span>
        )}
      </div>
      
      {/* 当前节点指示器 */}
      {isActive && node.unlocked && !node.completed && (
        <motion.div
          className={styles.activeIndicator}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span>👆</span>
          <span className={styles.activeText}>继续学习</span>
        </motion.div>
      )}
    </motion.div>
  );
});

MapNode.displayName = 'MapNode';

export default MapNode;


/**
 * PathConnector - 节点之间的连接线
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { UnifiedMapNode } from '@/data/unifiedMap';
import { levelThemeColors } from '@/data/unifiedMap';
import styles from './styles.module.css';

interface PathConnectorProps {
  fromNode: UnifiedMapNode;
  toNode: UnifiedMapNode;
  /** 连接线是否激活（已解锁） */
  isActive: boolean;
  /** 连接线是否完成 */
  isCompleted: boolean;
}

const PathConnector: React.FC<PathConnectorProps> = memo(({
  fromNode,
  toNode,
  isActive,
  isCompleted,
}) => {
  const themeColor = levelThemeColors[toNode.level];
  
  // 如果跨级别，使用渐变
  const isLevelTransition = fromNode.level !== toNode.level;
  
  return (
    <div className={styles.pathConnector}>
      <motion.div
        className={`
          ${styles.pathLine}
          ${isActive ? styles.pathLineActive : styles.pathLineInactive}
          ${isCompleted ? styles.pathLineCompleted : ''}
          ${isLevelTransition ? styles.pathLineTransition : ''}
        `}
        style={{
          '--path-color': isCompleted 
            ? themeColor.primary 
            : isActive 
              ? themeColor.secondary 
              : 'rgba(255,255,255,0.1)',
        } as React.CSSProperties}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 流动动画（仅未完成但已激活时显示） */}
        {isActive && !isCompleted && (
          <motion.div
            className={styles.pathFlow}
            animate={{
              y: ['100%', '-100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </motion.div>
      
      {/* 级别过渡装饰 */}
      {isLevelTransition && (
        <div 
          className={styles.levelTransitionDot}
          style={{ backgroundColor: themeColor.primary }}
        />
      )}
    </div>
  );
});

PathConnector.displayName = 'PathConnector';

export default PathConnector;


/**
 * NodePreview 组件
 * 点击节点时弹出的预览面板
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapNode } from '@/db';
import { Button } from '@/components/common';
import styles from './NodePreview.module.css';

interface NodePreviewProps {
  /** 节点数据 */
  node: MapNode | null;
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 开始按钮回调 */
  onStart: (node: MapNode) => void;
}

// 默认配置
const defaultConfig = { label: '故事', color: '#6B5CE7', icon: '📖' };

// 节点类型配置
const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  story: { label: '故事', color: '#6B5CE7', icon: '📖' },
  boss: { label: 'Boss', color: '#F59E0B', icon: '👑' },
  bonus: { label: '奖励', color: '#10B981', icon: '🎁' },
  challenge: { label: '挑战', color: '#EF4444', icon: '⚡' },
};

export const NodePreview = memo<NodePreviewProps>(({
  node,
  isOpen,
  onClose,
  onStart,
}) => {
  if (!node) return null;

  const config = typeConfig[node.type || 'story'] ?? defaultConfig;
  
  // 获取奖励描述
  const getRewardText = () => {
    const rewards: string[] = [];
    if (node.rewards?.magicPower) {
      rewards.push(`✨ ${node.rewards.magicPower} 魔力值`);
    }
    if (node.rewards?.cards?.length) {
      rewards.push(`🃏 ${node.rewards.cards.length} 张卡牌`);
    }
    return rewards;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 预览面板 */}
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 头部 */}
            <div className={styles.header}>
              <div
                className={styles.iconWrapper}
                style={{ background: config.color }}
              >
                <span className={styles.icon}>{node.emoji || config.icon}</span>
              </div>
              <div className={styles.titleSection}>
                <span
                  className={styles.typeLabel}
                  style={{ background: `${config.color}20`, color: config.color }}
                >
                  {config.icon} {config.label}
                </span>
                <h3 className={styles.title}>{node.titleCn || node.title}</h3>
                {node.title !== node.titleCn && (
                  <p className={styles.subtitle}>{node.title}</p>
                )}
              </div>
            </div>

            {/* 奖励信息 */}
            <div className={styles.rewards}>
              <h4 className={styles.rewardsTitle}>完成奖励</h4>
              <div className={styles.rewardsList}>
                {getRewardText().map((reward, index) => (
                  <div key={index} className={styles.rewardItem}>
                    {reward}
                  </div>
                ))}
              </div>
            </div>

            {/* 状态信息 */}
            {node.completed && (
              <div className={styles.completedBadge}>
                ✅ 已完成
              </div>
            )}

            {/* 操作按钮 */}
            <div className={styles.actions}>
              <Button
                variant="ghost"
                onClick={onClose}
              >
                返回
              </Button>
              <Button
                variant="primary"
                onClick={() => onStart(node)}
              >
                {node.completed ? '再次阅读' : '开始冒险'} →
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

NodePreview.displayName = 'NodePreview';

export default NodePreview;


/**
 * BuddyAvatar 组件
 * Buddy 头像显示，支持不同阶段和心情
 */

import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  type BuddyStage, 
  type BuddyMood,
  EVOLUTION_CONFIG,
  MOOD_CONFIG,
  getBuddyEncouragement,
} from '@/services/buddyService';
import styles from './BuddyAvatar.module.css';

interface BuddyAvatarProps {
  /** Buddy 阶段 */
  stage: BuddyStage;
  /** Buddy 心情 */
  mood: BuddyMood;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否显示对话气泡 */
  showBubble?: boolean;
  /** 对话内容 */
  bubbleText?: string;
  /** 上下文（用于自动生成对话） */
  context?: 'start' | 'success' | 'fail' | 'complete';
  /** 是否启用动画 */
  animated?: boolean;
  /** 点击回调 */
  onClick?: () => void;
}

const sizeMap = {
  sm: { avatar: 48, bubble: 120 },
  md: { avatar: 64, bubble: 160 },
  lg: { avatar: 96, bubble: 200 },
  xl: { avatar: 128, bubble: 240 },
};

export const BuddyAvatar = memo<BuddyAvatarProps>(({
  stage,
  mood,
  size = 'md',
  showBubble = false,
  bubbleText,
  context,
  animated = true,
  onClick,
}) => {
  const [currentBubbleText, setCurrentBubbleText] = useState('');
  const config = EVOLUTION_CONFIG[stage];
  const moodConfig = MOOD_CONFIG[mood];
  const sizeConfig = sizeMap[size];

  // 生成或使用对话文本
  useEffect(() => {
    if (bubbleText) {
      setCurrentBubbleText(bubbleText);
    } else if (context) {
      setCurrentBubbleText(getBuddyEncouragement(mood, context));
    }
  }, [bubbleText, context, mood]);

  // 动画变体
  const avatarVariants = {
    idle: {
      y: [0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      },
    },
    tap: {
      scale: 0.95,
    },
    hover: {
      scale: 1.05,
    },
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.8 },
  };

  return (
    <div className={styles.container} onClick={onClick}>
      {/* Buddy 头像 */}
      <motion.div
        className={styles.avatar}
        style={{
          width: sizeConfig.avatar,
          height: sizeConfig.avatar,
          fontSize: sizeConfig.avatar * 0.6,
          borderColor: moodConfig.color,
        }}
        variants={animated ? avatarVariants : undefined}
        initial="idle"
        animate="idle"
        whileHover={onClick ? 'hover' : undefined}
        whileTap={onClick ? 'tap' : undefined}
      >
        {/* 主头像 */}
        <span className={styles.mainEmoji}>{config.avatar}</span>
        
        {/* 心情指示器 */}
        <motion.div
          className={styles.moodIndicator}
          style={{ background: moodConfig.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {moodConfig.emoji}
        </motion.div>
      </motion.div>

      {/* 对话气泡 */}
      <AnimatePresence>
        {showBubble && currentBubbleText && (
          <motion.div
            className={styles.bubble}
            style={{ maxWidth: sizeConfig.bubble }}
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span className={styles.bubbleText}>{currentBubbleText}</span>
            <div className={styles.bubbleArrow} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

BuddyAvatar.displayName = 'BuddyAvatar';

export default BuddyAvatar;


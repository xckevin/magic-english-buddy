/**
 * AchievementCard 组件
 * 成就卡片展示
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './AchievementCard.module.css';

interface AchievementCardProps {
  /** 成就名称 */
  name: string;
  /** 中文名称 */
  nameCn: string;
  /** 描述 */
  description: string;
  /** 图标 */
  icon: string;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁日期 */
  unlockedAt?: string;
  /** 奖励魔力值 */
  rewardMagicPower?: number;
  /** 点击回调 */
  onClick?: () => void;
}

export const AchievementCard = memo<AchievementCardProps>(({
  name: _name, // 英文名称，保留供未来使用
  nameCn,
  description,
  icon,
  unlocked,
  unlockedAt,
  rewardMagicPower,
  onClick,
}) => {
  return (
    <motion.div
      className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}
      onClick={onClick}
      whileHover={unlocked ? { scale: 1.02 } : undefined}
      whileTap={unlocked ? { scale: 0.98 } : undefined}
    >
      {/* 图标 */}
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{unlocked ? icon : '🔒'}</span>
        {unlocked && (
          <motion.div
            className={styles.glow}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </div>

      {/* 内容 */}
      <div className={styles.content}>
        <h4 className={styles.name}>{unlocked ? nameCn : '???'}</h4>
        <p className={styles.description}>
          {unlocked ? description : '继续探索来解锁这个成就'}
        </p>
        
        {unlocked && unlockedAt && (
          <span className={styles.date}>🏅 {unlockedAt}</span>
        )}
      </div>

      {/* 奖励 */}
      {unlocked && rewardMagicPower && (
        <div className={styles.reward}>
          <span className={styles.rewardIcon}>✨</span>
          <span className={styles.rewardValue}>+{rewardMagicPower}</span>
        </div>
      )}
    </motion.div>
  );
});

AchievementCard.displayName = 'AchievementCard';

export default AchievementCard;


/**
 * AchievementCard 组件
 * 成就卡片展示
 */

import { memo } from 'react';
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
}

export const AchievementCard = memo<AchievementCardProps>(
  ({
    name: _name, // 英文名称，保留供未来使用
    nameCn,
    description,
    icon,
    unlocked,
    unlockedAt,
    rewardMagicPower,
  }) => {
    return (
      <div className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}>
        {/* 图标 */}
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>{unlocked ? icon : '🔒'}</span>
          {unlocked && <span className={styles.glow} aria-hidden="true" />}
        </div>

        {/* 内容 */}
        <div className={styles.content}>
          <h4 className={styles.name}>{nameCn}</h4>
          <p className={styles.description}>{description}</p>
          {!unlocked && <span className={styles.date}>尚未解锁</span>}

          {unlocked && unlockedAt && <span className={styles.date}>🏅 {unlockedAt}</span>}
        </div>

        {/* 奖励 */}
        {unlocked && rewardMagicPower && (
          <div className={styles.reward}>
            <span className={styles.rewardIcon}>✨</span>
            <span className={styles.rewardValue}>+{rewardMagicPower}</span>
          </div>
        )}
      </div>
    );
  }
);

AchievementCard.displayName = 'AchievementCard';

export default AchievementCard;

/**
 * MagicCard 组件
 * 魔法卡牌（单词卡）展示
 */

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './MagicCard.module.css';

type CardRarity = 'white' | 'green' | 'blue' | 'gold';

interface MagicCardProps {
  /** 单词 */
  word: string;
  /** 中文含义 */
  meaningCn: string;
  /** 表情符号 */
  emoji?: string;
  /** 稀有度 */
  rarity: CardRarity;
  /** 掌握等级 */
  masteryLevel: 0 | 1 | 2 | 3;
  /** 是否可翻转 */
  flippable?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

const rarityConfig: Record<CardRarity, { name: string; gradient: string; border: string }> = {
  white: {
    name: '普通',
    gradient: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
    border: '#6B7280',
  },
  green: {
    name: '精良',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    border: '#34D399',
  },
  blue: {
    name: '稀有',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    border: '#60A5FA',
  },
  gold: {
    name: '传说',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    border: '#FBBF24',
  },
};

const sizeConfig = {
  sm: { width: 128, height: 172, fontSize: 18 },
  md: { width: 140, height: 196, fontSize: 18 },
  lg: { width: 180, height: 252, fontSize: 22 },
};

export const MagicCard = memo<MagicCardProps>(
  ({ word, meaningCn, emoji, rarity, masteryLevel, flippable = true, size = 'md' }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const config = rarityConfig[rarity];
    const sizeStyle = sizeConfig[size];

    const handleFlip = () => {
      if (flippable) {
        setIsFlipped(!isFlipped);
      }
    };

    return (
      <motion.button
        type="button"
        aria-label={isFlipped ? `${word}：${meaningCn}，点按查看英文` : `${word}，点按查看意思`}
        aria-pressed={isFlipped}
        disabled={!flippable}
        className={styles.cardContainer}
        style={{
          width: sizeStyle.width,
          height: sizeStyle.height,
        }}
        onClick={handleFlip}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className={styles.card}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* 正面 */}
          <div
            className={styles.front}
            style={{
              background: config.gradient,
              borderColor: config.border,
            }}
          >
            {/* 稀有度标识 */}
            <div className={styles.rarityBadge}>
              {rarity === 'gold' && '⭐'}
              {rarity === 'blue' && '💎'}
              {rarity === 'green' && '🌟'}
            </div>

            {/* 表情 */}
            <div className={styles.emoji}>{emoji || '📝'}</div>

            {/* 单词 */}
            <span className={styles.word} style={{ fontSize: sizeStyle.fontSize }}>
              {word}
            </span>

            {/* 掌握进度 */}
            <div className={styles.mastery}>
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`${styles.masteryDot} ${i < masteryLevel ? styles.filled : ''}`}
                />
              ))}
            </div>
          </div>

          {/* 背面 */}
          <div
            className={styles.back}
            style={{
              background: config.gradient,
              borderColor: config.border,
            }}
          >
            <div className={styles.meaning}>{meaningCn}</div>
            <div className={styles.rarityLabel}>{config.name}</div>
          </div>
        </motion.div>
      </motion.button>
    );
  }
);

MagicCard.displayName = 'MagicCard';

export default MagicCard;

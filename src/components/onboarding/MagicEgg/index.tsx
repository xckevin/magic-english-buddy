/**
 * MagicEgg 组件
 * 魔法蛋动画：呼吸光晕、破壳动画、孵化效果
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MagicEgg.module.css';

type EggState = 'dormant' | 'awakening' | 'cracking' | 'hatched';

interface MagicEggProps {
  /** 蛋的状态 */
  state?: EggState;
  /** 长按进度 (0-1) */
  holdProgress?: number;
  /** 孵化完成回调 */
  onHatched?: () => void;
  /** 点击回调 */
  onClick?: () => void;
}

export const MagicEgg: React.FC<MagicEggProps> = ({
  state = 'dormant',
  holdProgress = 0,
  onHatched,
  onClick,
}) => {
  const [internalState, setInternalState] = useState<EggState>(state);
  const [showBuddy, setShowBuddy] = useState(false);

  // 同步外部状态
  useEffect(() => {
    setInternalState(state);
  }, [state]);

  // 破壳动画完成后显示 Buddy
  const handleCrackComplete = useCallback(() => {
    if (internalState === 'cracking') {
      setInternalState('hatched');
      setShowBuddy(true);
      setTimeout(() => {
        onHatched?.();
      }, 800);
    }
  }, [internalState, onHatched]);

  // 蛋壳动画变体
  const eggVariants = {
    dormant: {
      scale: 1,
      rotate: 0,
      filter: 'brightness(0.8)',
    },
    awakening: {
      scale: [1, 1.05, 1],
      rotate: [0, -2, 2, -2, 0],
      filter: 'brightness(1)',
      transition: {
        scale: { repeat: Infinity, duration: 2 },
        rotate: { repeat: Infinity, duration: 0.5 },
      },
    },
    cracking: {
      scale: [1, 1.1, 0.9, 1.2, 0],
      rotate: [0, -5, 5, -10, 10, 0],
      filter: 'brightness(1.5)',
      transition: {
        duration: 1.5,
        times: [0, 0.2, 0.4, 0.6, 1],
      },
    },
    hatched: {
      scale: 0,
      opacity: 0,
    },
  };

  // 光晕动画变体
  const glowVariants = {
    dormant: {
      opacity: 0.3,
      scale: 1,
    },
    awakening: {
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
      },
    },
    cracking: {
      opacity: 1,
      scale: 2,
      transition: { duration: 0.5 },
    },
    hatched: {
      opacity: 0,
      scale: 3,
    },
  };

  // Buddy 出现动画
  const buddyVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      y: 20,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 200,
        delay: 0.3,
      },
    },
  };

  return (
    <div className={styles.container} onClick={onClick}>
      {/* 背景光晕 */}
      <motion.div
        className={styles.glow}
        variants={glowVariants}
        animate={internalState}
        style={{
          background: `radial-gradient(circle, rgba(107, 92, 231, ${0.3 + holdProgress * 0.5}) 0%, transparent 70%)`,
        }}
      />

      {/* 进度环 */}
      {holdProgress > 0 && internalState !== 'hatched' && (
        <svg className={styles.progressRing} viewBox="0 0 100 100">
          <circle
            className={styles.progressBg}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
          />
          <motion.circle
            className={styles.progressFill}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${holdProgress * 283} 283`}
            initial={{ strokeDasharray: '0 283' }}
            animate={{ strokeDasharray: `${holdProgress * 283} 283` }}
          />
        </svg>
      )}

      {/* 蛋壳碎片（破壳时显示） */}
      <AnimatePresence>
        {internalState === 'cracking' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.shellPiece}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  rotate: 0, 
                  opacity: 1 
                }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 8) * 150,
                  y: Math.sin((i * Math.PI * 2) / 8) * 150 + 100,
                  rotate: Math.random() * 360,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(${i * 45}deg, #E8E4F3, #D4CEE8)`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 蛋 */}
      <AnimatePresence>
        {internalState !== 'hatched' && (
          <motion.div
            className={styles.egg}
            variants={eggVariants}
            initial="dormant"
            animate={internalState}
            onAnimationComplete={handleCrackComplete}
          >
            {/* 蛋壳高光 */}
            <div className={styles.eggHighlight} />
            {/* 蛋壳纹理 */}
            <div className={styles.eggTexture}>
              <span>🥚</span>
            </div>
            {/* 裂纹（唤醒时显示） */}
            {(internalState === 'awakening' || internalState === 'cracking') && (
              <motion.div
                className={styles.crack}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: holdProgress > 0.5 ? 1 : holdProgress, 
                  scale: 1 
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 孵化的 Buddy */}
      <AnimatePresence>
        {showBuddy && (
          <motion.div
            className={styles.buddy}
            variants={buddyVariants}
            initial="hidden"
            animate="visible"
          >
            <span className={styles.buddyEmoji}>🐣</span>
            <motion.div
              className={styles.sparkles}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 粒子效果 */}
      {(internalState === 'awakening' || internalState === 'cracking') && (
        <div className={styles.particles}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0 
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 12) * (50 + Math.random() * 50),
                y: Math.sin((i * Math.PI * 2) / 12) * (50 + Math.random() * 50) - 30,
                opacity: [0, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MagicEgg;


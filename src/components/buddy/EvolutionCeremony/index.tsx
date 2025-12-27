/**
 * EvolutionCeremony 组件
 * Buddy 进化仪式动画
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type BuddyStage, EVOLUTION_CONFIG, evolve } from '@/services/buddyService';
import { Button } from '@/components/common';
import styles from './EvolutionCeremony.module.css';

interface EvolutionCeremonyProps {
  userId: string;
  currentStage: BuddyStage;
  nextStage: BuddyStage;
  onComplete: () => void;
  onCancel: () => void;
}

type CeremonyPhase = 'ready' | 'charging' | 'evolving' | 'complete';

export const EvolutionCeremony: React.FC<EvolutionCeremonyProps> = ({
  userId,
  currentStage,
  nextStage,
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<CeremonyPhase>('ready');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const currentConfig = EVOLUTION_CONFIG[currentStage];
  const nextConfig = EVOLUTION_CONFIG[nextStage];

  // 生成粒子
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // 开始进化
  const handleStartEvolution = useCallback(async () => {
    setPhase('charging');
    
    // 蓄力阶段
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPhase('evolving');
    
    // 执行进化
    const success = await evolve(userId);
    
    if (success) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPhase('complete');
    }
  }, [userId]);

  return (
    <div className={styles.container}>
      {/* 背景粒子 */}
      <div className={styles.particlesContainer}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className={styles.particle}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{
              y: phase === 'charging' ? [-20, 20, -20] : 0,
              opacity: phase === 'charging' || phase === 'evolving' ? [0.3, 1, 0.3] : 0.2,
              scale: phase === 'evolving' ? [1, 1.5, 0] : 1,
            }}
            transition={{
              duration: 2,
              delay: p.delay,
              repeat: phase === 'complete' ? 0 : Infinity,
            }}
          />
        ))}
      </div>

      {/* 光环效果 */}
      <AnimatePresence>
        {(phase === 'charging' || phase === 'evolving') && (
          <motion.div
            className={styles.aura}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: phase === 'evolving' ? [1, 2, 3] : [1, 1.2, 1],
              opacity: phase === 'evolving' ? [0.8, 0.4, 0] : [0.5, 0.8, 0.5],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: phase === 'evolving' ? 0 : Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Buddy 展示 */}
      <div className={styles.buddyStage}>
        <AnimatePresence mode="wait">
          {phase !== 'complete' ? (
            <motion.div
              key="current"
              className={styles.buddyAvatar}
              initial={{ scale: 1 }}
              animate={{
                scale: phase === 'charging' ? [1, 1.1, 1] : phase === 'evolving' ? [1, 1.5, 0] : 1,
                rotate: phase === 'evolving' ? [0, 360] : 0,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: phase === 'evolving' ? 1 : 0.5 }}
            >
              <span className={styles.emoji}>{currentConfig.avatar}</span>
            </motion.div>
          ) : (
            <motion.div
              key="next"
              className={styles.buddyAvatar}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <span className={styles.emoji}>{nextConfig.avatar}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 文字信息 */}
      <div className={styles.info}>
        <AnimatePresence mode="wait">
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className={styles.title}>🌟 进化准备</h2>
              <p className={styles.description}>
                {currentConfig.nameCn} 即将进化为 {nextConfig.nameCn}！
              </p>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={onCancel}>
                  稍后再说
                </Button>
                <Button variant="primary" onClick={handleStartEvolution}>
                  ✨ 开始进化
                </Button>
              </div>
            </motion.div>
          )}

          {phase === 'charging' && (
            <motion.div
              key="charging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.chargingText}
            >
              <h2 className={styles.title}>⚡ 魔力聚集中...</h2>
              <div className={styles.chargingBar}>
                <motion.div
                  className={styles.chargingFill}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            </motion.div>
          )}

          {phase === 'evolving' && (
            <motion.div
              key="evolving"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={styles.evolvingText}
            >
              <h2 className={styles.title}>🔮 进化中！</h2>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.completeSection}
            >
              <h2 className={styles.successTitle}>🎉 进化成功！</h2>
              <p className={styles.newName}>{nextConfig.nameCn}</p>
              <p className={styles.description}>{nextConfig.description}</p>
              <Button variant="primary" onClick={onComplete}>
                太棒了！
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EvolutionCeremony;


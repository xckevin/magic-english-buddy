/**
 * QuizResult 组件
 * Quiz 结果统计页面
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { QuizResultData } from '../QuizContainer';
import { Button } from '@/components/common';
import styles from './QuizResult.module.css';

interface QuizResultProps {
  result: QuizResultData;
  onFinish: () => void;
  onRetry: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  isReview?: boolean;
  storyRewardMagicPower?: number;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  result,
  onFinish,
  onRetry,
  isSaving = false,
  saveError,
  isReview = false,
  storyRewardMagicPower = 0,
}) => {
  const isPassed = result.score >= 60;

  // 获取评价
  const getGrade = () => {
    if (result.score >= 90) return { emoji: '🏆', text: '太厉害了！', color: '#F59E0B' };
    if (result.score >= 80) return { emoji: '⭐', text: '非常棒！', color: '#10B981' };
    if (result.score >= 60) return { emoji: '👍', text: '做得不错', color: '#6B5CE7' };
    return { emoji: '💪', text: '继续努力', color: '#EF4444' };
  };

  const grade = getGrade();

  return (
    <div className={styles.container}>
      {/* 标题 */}
      <motion.div
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <span className={styles.emoji}>{grade.emoji}</span>
        <h1 className={styles.title} style={{ color: grade.color }}>
          {grade.text}
        </h1>
      </motion.div>

      {/* 分数圆环 */}
      <motion.div
        className={styles.scoreRing}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <svg className={styles.ringSvg} viewBox="0 0 100 100">
          {/* 背景圆 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* 进度圆 */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${result.score * 2.83} 283`}
            transform="rotate(-90 50 50)"
            initial={{ strokeDasharray: '0 283' }}
            animate={{ strokeDasharray: `${result.score * 2.83} 283` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </svg>
        <div className={styles.scoreText}>
          <span className={styles.scoreValue}>{result.score}</span>
          <span className={styles.scoreLabel}>分</span>
        </div>
      </motion.div>

      {/* 统计数据 */}
      <motion.div
        className={styles.stats}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className={styles.statItem}>
          <span className={styles.statIcon}>✅</span>
          <span className={styles.statValue}>{result.correctCount}</span>
          <span className={styles.statLabel}>正确</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statIcon}>❌</span>
          <span className={styles.statValue}>{result.wrongCount}</span>
          <span className={styles.statLabel}>错误</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statIcon}>⏱️</span>
          <span className={styles.statValue}>{result.timeSpent}s</span>
          <span className={styles.statLabel}>用时</span>
        </div>
      </motion.div>

      {/* 魔力值奖励 */}
      <motion.div
        className={styles.reward}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className={styles.rewardIcon}>✨</span>
        <span className={styles.rewardText}>
          {isReview ? (
            '复习结果保存后，本次不会重复发放奖励'
          ) : isPassed ? (
            <>保存本次通关后可获得 <strong>{result.earnedMagicPower + storyRewardMagicPower}</strong> 魔力值</>
          ) : (
            <>及格并保存后可获得 <strong>{result.earnedMagicPower + storyRewardMagicPower}</strong> 魔力值</>
          )}
        </span>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        className={styles.actions}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {!isPassed && (
          <Button variant="secondary" onClick={onRetry} disabled={isSaving}>
            🔄 再试一次
          </Button>
        )}
        <Button variant="primary" onClick={onFinish} disabled={isSaving}>
          {isSaving ? '正在保存…' : isPassed ? '🎯 完成' : '📖 返回学习'}
        </Button>
      </motion.div>
      {saveError && (
        <p className={styles.saveError} role="alert">
          {saveError}
        </p>
      )}
    </div>
  );
};

export default QuizResult;

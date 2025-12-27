/**
 * QuizProgress 组件
 * 进度指示器
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './QuizProgress.module.css';

interface QuizProgressProps {
  current: number;
  total: number;
  progress: number;
  onExit: () => void;
}

export const QuizProgress = memo<QuizProgressProps>(({
  current,
  total,
  progress,
  onExit,
}) => {
  return (
    <div className={styles.container}>
      <button className={styles.exitBtn} onClick={onExit}>
        ✕
      </button>
      
      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={styles.progressText}>
          {current} / {total}
        </span>
      </div>

      <div className={styles.placeholder} />
    </div>
  );
});

QuizProgress.displayName = 'QuizProgress';

export default QuizProgress;


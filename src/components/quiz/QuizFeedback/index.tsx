/**
 * QuizFeedback 组件
 * 正确/错误反馈动画
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './QuizFeedback.module.css';

interface QuizFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  onContinue: () => void;
}

export const QuizFeedback: React.FC<QuizFeedbackProps> = ({
  isCorrect,
  correctAnswer,
  onContinue,
}) => {
  // 自动继续
  useEffect(() => {
    const timer = setTimeout(onContinue, 2000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <motion.div
      className={`${styles.container} ${isCorrect ? styles.correct : styles.wrong}`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* 图标 */}
      <motion.div
        className={styles.icon}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
      >
        {isCorrect ? '🎉' : '😅'}
      </motion.div>

      {/* 标题 */}
      <motion.h2
        className={styles.title}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isCorrect ? '太棒了！' : '继续加油！'}
      </motion.h2>

      {/* 描述 */}
      <motion.p
        className={styles.description}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isCorrect 
          ? '你的魔力值 +3 ✨' 
          : `正确答案是：${correctAnswer}`
        }
      </motion.p>

      {/* 粒子效果 (仅正确时) */}
      {isCorrect && (
        <div className={styles.particles}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
              }}
              animate={{
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: Math.random() * 0.3,
              }}
            >
              {['⭐', '✨', '💫', '🌟'][i % 4]}
            </motion.div>
          ))}
        </div>
      )}

      {/* 点击继续 */}
      <motion.button
        className={styles.continueBtn}
        onClick={onContinue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        点击继续 →
      </motion.button>
    </motion.div>
  );
};

export default QuizFeedback;


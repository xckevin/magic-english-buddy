/**
 * Loading 组件
 * 全局加载状态展示
 */

import { motion } from 'framer-motion';
import styles from './Loading.module.css';

interface LoadingProps {
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 加载提示文字 */
  message?: string;
  /** 自定义大小 */
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({
  fullscreen = false,
  message = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 60,
  };

  const spinnerSize = sizeMap[size];

  const content = (
    <div className={styles.content}>
      <motion.div
        className={styles.spinner}
        style={{ width: spinnerSize, height: spinnerSize }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg viewBox="0 0 50 50" className={styles.svg}>
          <circle
            className={styles.track}
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
          <circle
            className={styles.path}
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
      {message && (
        <motion.p
          className={styles.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        className={styles.fullscreen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default Loading;


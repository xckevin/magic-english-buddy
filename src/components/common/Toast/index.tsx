/**
 * Toast 组件
 * 轻量级消息提示组件
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  /** 消息内容 */
  message: string;
  /** 消息类型 */
  type?: ToastType;
  /** 显示时长 (ms) */
  duration?: number;
  /** 关闭回调 */
  onClose?: () => void;
  /** 是否显示 */
  visible?: boolean;
}

// 图标映射
const iconMap: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

// 动画配置
const toastVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 }
  },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  visible = true,
}) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const content = (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.container}
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={clsx(styles.toast, styles[type])}>
            <span className={styles.icon}>{iconMap[type]}</span>
            <span className={styles.message}>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

// ============ Toast Manager ============

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const toast: ToastItem = { id, message, type, duration };
    
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    return this.show(message, 'warning', duration);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toast = new ToastManager();

// ============ Toast Container ============

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const content = (
    <div className={styles.containerWrapper}>
      <AnimatePresence>
        {toasts.map(item => (
          <motion.div
            key={item.id}
            className={clsx(styles.toast, styles[item.type])}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <span className={styles.icon}>{iconMap[item.type]}</span>
            <span className={styles.message}>{item.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return createPortal(content, document.body);
};

export default Toast;


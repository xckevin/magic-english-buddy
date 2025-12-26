/**
 * Modal 组件
 * 模态框弹窗组件，支持动画和多种尺寸
 */

import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Modal.module.css';

type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface ModalProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 标题 */
  title?: string;
  /** 模态框尺寸 */
  size?: ModalSize;
  /** 点击遮罩关闭 */
  closeOnOverlay?: boolean;
  /** 按 ESC 关闭 */
  closeOnEsc?: boolean;
  /** 显示关闭按钮 */
  showCloseButton?: boolean;
  /** 子元素 */
  children: ReactNode;
  /** 底部内容 */
  footer?: ReactNode;
  /** 自定义类名 */
  className?: string;
}

// 动画配置
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  },
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  footer,
  className,
}) => {
  // ESC 键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  // 监听键盘事件
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // 点击遮罩
  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      onClose();
    }
  };

  // 阻止内容区域点击冒泡
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleOverlayClick}
        >
          <motion.div
            className={clsx(styles.modal, styles[size], className)}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleContentClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* 头部 */}
            {(title || showCloseButton) && (
              <div className={styles.header}>
                {title && (
                  <h2 id="modal-title" className={styles.title}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="关闭"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* 内容 */}
            <div className={styles.content}>{children}</div>

            {/* 底部 */}
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 使用 Portal 渲染到 body
  return createPortal(modalContent, document.body);
};

export default Modal;


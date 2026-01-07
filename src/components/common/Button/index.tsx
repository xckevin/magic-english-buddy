/**
 * Button 组件
 * 支持多种变体和尺寸的按钮组件
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否填满宽度 */
  fullWidth?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 左侧图标 */
  leftIcon?: ReactNode;
  /** 右侧图标 */
  rightIcon?: ReactNode;
  /** 子元素 */
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClick?.(e);
    };

    // Framer Motion 配置
    const motionProps: HTMLMotionProps<'button'> = {
      whileTap: isDisabled ? {} : { scale: 0.97 },
      whileHover: isDisabled ? {} : { scale: 1.02 },
      transition: { duration: 0.15 },
    };

    return (
      <motion.button
        ref={ref}
        className={clsx(
          styles.button,
          styles[variant as keyof typeof styles],
          styles[size as keyof typeof styles],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          loading && styles.loading,
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...motionProps}
        {...props}
      >
        {loading && (
          <span className={styles.spinner}>
            <svg viewBox="0 0 24 24" className={styles.spinnerIcon}>
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="3"
                stroke="currentColor"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}
        {!loading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <span className={styles.label}>{children}</span>
        {!loading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;


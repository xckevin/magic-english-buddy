/**
 * useLongPress Hook
 * 长按交互，支持进度回调
 */

import { useCallback, useRef, useState, useEffect } from 'react';

interface UseLongPressOptions {
  /** 长按触发时间（毫秒） */
  duration?: number;
  /** 进度更新间隔（毫秒） */
  interval?: number;
  /** 开始回调 */
  onStart?: () => void;
  /** 进度回调 (0-1) */
  onProgress?: (progress: number) => void;
  /** 完成回调 */
  onComplete?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
}

interface UseLongPressResult {
  /** 当前进度 (0-1) */
  progress: number;
  /** 是否正在长按 */
  isPressed: boolean;
  /** 绑定到元素的事件处理器 */
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  /** 重置进度 */
  reset: () => void;
}

export const useLongPress = (options: UseLongPressOptions = {}): UseLongPressResult => {
  const {
    duration = 2000,
    interval = 50,
    onStart,
    onProgress,
    onComplete,
    onCancel,
  } = options;

  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  // 清理定时器
  const cleanup = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // 重置
  const reset = useCallback(() => {
    cleanup();
    setProgress(0);
    setIsPressed(false);
    startTimeRef.current = null;
    completedRef.current = false;
  }, [cleanup]);

  // 开始长按
  const handleStart = useCallback(() => {
    if (completedRef.current) return;
    
    setIsPressed(true);
    startTimeRef.current = Date.now();
    onStart?.();

    intervalIdRef.current = setInterval(() => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      onProgress?.(newProgress);

      if (newProgress >= 1) {
        completedRef.current = true;
        cleanup();
        setIsPressed(false);
        onComplete?.();
      }
    }, interval);
  }, [duration, interval, onStart, onProgress, onComplete, cleanup]);

  // 结束长按
  const handleEnd = useCallback(() => {
    if (!isPressed) return;
    
    cleanup();
    setIsPressed(false);

    if (!completedRef.current && progress < 1) {
      onCancel?.();
      // 逐渐减少进度（可选）
      // setProgress(0);
    }
  }, [isPressed, progress, cleanup, onCancel]);

  // 组件卸载时清理
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart();
    },
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      handleStart();
    },
    onTouchEnd: handleEnd,
  };

  return {
    progress,
    isPressed,
    handlers,
    reset,
  };
};

export default useLongPress;


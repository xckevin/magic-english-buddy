/**
 * 首次启动检测与数据初始化 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { getCurrentUser } from '@/db';
import {
  needsInitialization,
  initializeAppData,
  getDataStats,
} from '@/services/dataInitService';

interface InitializationState {
  isChecking: boolean;
  isInitializing: boolean;
  progress: number;
  message: string;
  error: string | null;
  isComplete: boolean;
}

interface InitializationResult {
  state: InitializationState;
  startInitialization: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * 首次启动检测与初始化 Hook
 */
export const useInitialization = (): InitializationResult => {
  const navigate = useNavigate();
  const { setCurrentUser, isFirstLaunch, setFirstLaunchComplete } = useAppStore();

  const [state, setState] = useState<InitializationState>({
    isChecking: true,
    isInitializing: false,
    progress: 0,
    message: '正在检查应用状态...',
    error: null,
    isComplete: false,
  });

  /**
   * 检查用户状态并决定导航
   */
  const checkUserAndNavigate = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      
      if (user) {
        // 已有用户，设置到 store
        setCurrentUser(user.id);
        
        // 如果不是首次启动，直接跳转到地图
        if (!isFirstLaunch) {
          navigate('/map', { replace: true });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Check user failed:', error);
      return false;
    }
  }, [navigate, setCurrentUser, isFirstLaunch]);

  /**
   * 执行数据初始化
   */
  const startInitialization = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isInitializing: true,
      error: null,
    }));

    try {
      const result = await initializeAppData((message, progress) => {
        setState(prev => ({
          ...prev,
          message,
          progress,
        }));
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          isInitializing: false,
          isComplete: true,
          message: `已加载 ${result.stories} 个故事，${result.words} 个单词`,
        }));
      } else {
        throw new Error('数据初始化失败');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: error instanceof Error ? error.message : '未知错误',
      }));
    }
  }, []);

  /**
   * 重试初始化
   */
  const retry = useCallback(async () => {
    setState({
      isChecking: false,
      isInitializing: false,
      progress: 0,
      message: '',
      error: null,
      isComplete: false,
    });
    await startInitialization();
  }, [startInitialization]);

  /**
   * 初始检查
   */
  useEffect(() => {
    const check = async () => {
      // 检查是否需要初始化数据
      const needsInit = needsInitialization();
      
      if (needsInit) {
        setState(prev => ({
          ...prev,
          isChecking: false,
          message: '首次启动，准备初始化数据...',
        }));
        await startInitialization();
      } else {
        // 数据已存在，检查用户
        const stats = await getDataStats();
        setState(prev => ({
          ...prev,
          isChecking: false,
          isComplete: true,
          message: `已加载 ${stats.stories} 个故事`,
        }));
        
        await checkUserAndNavigate();
      }
    };

    check();
  }, [checkUserAndNavigate, startInitialization]);

  return {
    state,
    startInitialization,
    retry,
  };
};

export default useInitialization;


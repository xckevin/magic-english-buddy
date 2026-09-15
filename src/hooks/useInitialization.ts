/**
 * 首次启动检测与数据初始化 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { db, getCurrentUser } from '@/db';
import { needsInitialization, initializeAppData, getDataStats } from '@/services/dataInitService';

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
  const { currentUserId, setCurrentUser } = useAppStore();

  const [state, setState] = useState<InitializationState>({
    isChecking: true,
    isInitializing: false,
    progress: 0,
    message: '正在检查应用状态...',
    error: null,
    isComplete: false,
  });

  /**
   * 选择当前学习档案；页面自身负责导航，避免与页面操作竞争。
   */
  const selectCurrentUser = useCallback(
    async (isCurrent: () => boolean = () => true) => {
      try {
        // activeProfileId is the authoritative cross-window selection. The
        // persisted store can lag behind a profile switch in another tab.
        const activeProfileId = (await db.learningMeta.get('activeProfileId'))?.value;
        const activeUser = activeProfileId ? await db.users.get(activeProfileId) : undefined;
        const persistedUser = currentUserId ? await db.users.get(currentUserId) : undefined;
        const selectedUser = activeUser ?? persistedUser ?? (await getCurrentUser());

        if (!isCurrent()) return false;
        if (selectedUser) setCurrentUser(selectedUser.id);

        return Boolean(selectedUser);
      } catch (error) {
        console.error('Check user failed:', error);
        return false;
      }
    },
    [currentUserId, setCurrentUser]
  );

  /**
   * 执行数据初始化
   */
  const startInitialization = useCallback(async (isCurrent: () => boolean = () => true) => {
    if (!isCurrent()) return;
    setState(prev => ({
      ...prev,
      isInitializing: true,
      error: null,
    }));

    try {
      const result = await initializeAppData((message, progress) => {
        if (!isCurrent()) return;
        setState(prev => ({
          ...prev,
          message,
          progress,
        }));
      });

      if (result.success && isCurrent()) {
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
      if (!isCurrent()) return;
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
    let cancelled = false;
    const isCurrent = () => !cancelled;
    const check = async () => {
      // 检查是否需要初始化数据
      const needsInit = needsInitialization();

      if (needsInit) {
        if (!isCurrent()) return;
        setState(prev => ({
          ...prev,
          isChecking: false,
          message: '首次启动，准备初始化数据...',
        }));
        await startInitialization(isCurrent);
      } else {
        // 数据已存在，检查用户
        const stats = await getDataStats();
        if (!isCurrent()) return;
        setState(prev => ({
          ...prev,
          isChecking: false,
          isComplete: true,
          message: `已加载 ${stats.stories} 个故事`,
        }));

        await selectCurrentUser(isCurrent);
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [selectCurrentUser, startInitialization]);

  return {
    state,
    startInitialization,
    retry,
  };
};

export default useInitialization;

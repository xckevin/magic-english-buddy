/**
 * Magic English Buddy - 全局状态管理
 * 使用 Zustand 管理应用级状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============ 类型定义 ============

/** 应用设置 */
interface AppSettings {
  ttsSpeed: 0.8 | 1.0 | 1.2;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoPlayTTS: boolean;
  showTranslation: boolean;
  language: 'zh-CN' | 'en-US';
}

/** 应用状态 */
interface AppState {
  // 用户信息
  currentUserId: string | null;
  isFirstLaunch: boolean;

  // 设置
  settings: AppSettings;

  // UI 状态
  isLoading: boolean;
  loadingMessage: string;

  // 网络状态
  isOffline: boolean;

  // 当前阅读状态
  currentStoryId: string | null;
  currentParagraphIndex: number;
  activeWordIndex: number | null;

  // 当前 Quiz 状态
  currentQuizIndex: number;
  quizAnswers: Record<string, string | string[]>;

  // 临时状态
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | null;
}

/** 应用操作 */
interface AppActions {
  // 用户操作
  setCurrentUser: (userId: string) => void;
  clearCurrentUser: () => void;
  setFirstLaunchComplete: () => void;

  // 设置操作
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // UI 操作
  setLoading: (loading: boolean, message?: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // 网络状态
  setOffline: (offline: boolean) => void;

  // 阅读状态
  setCurrentStory: (storyId: string | null) => void;
  setCurrentParagraph: (index: number) => void;
  setActiveWord: (index: number | null) => void;
  resetReadingState: () => void;

  // Quiz 状态
  setQuizIndex: (index: number) => void;
  setQuizAnswer: (questionId: string, answer: string | string[]) => void;
  resetQuizState: () => void;
}

// ============ 默认值 ============

const defaultSettings: AppSettings = {
  ttsSpeed: 1.0,
  soundEnabled: true,
  vibrationEnabled: true,
  autoPlayTTS: true,
  showTranslation: false,
  language: 'zh-CN',
};

const initialState: AppState = {
  currentUserId: null,
  isFirstLaunch: true,
  settings: defaultSettings,
  isLoading: false,
  loadingMessage: '',
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  currentStoryId: null,
  currentParagraphIndex: 0,
  activeWordIndex: null,
  currentQuizIndex: 0,
  quizAnswers: {},
  toastMessage: null,
  toastType: null,
};

// ============ Store 定义 ============

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set) => ({
      ...initialState,

      // 用户操作
      setCurrentUser: (userId) =>
        set((state) => {
          state.currentUserId = userId;
        }),

      clearCurrentUser: () =>
        set((state) => {
          state.currentUserId = null;
        }),

      setFirstLaunchComplete: () =>
        set((state) => {
          state.isFirstLaunch = false;
        }),

      // 设置操作
      updateSettings: (newSettings) =>
        set((state) => {
          state.settings = { ...state.settings, ...newSettings };
        }),

      resetSettings: () =>
        set((state) => {
          state.settings = defaultSettings;
        }),

      // UI 操作
      setLoading: (loading, message = '') =>
        set((state) => {
          state.isLoading = loading;
          state.loadingMessage = message;
        }),

      showToast: (message, type) =>
        set((state) => {
          state.toastMessage = message;
          state.toastType = type;
        }),

      hideToast: () =>
        set((state) => {
          state.toastMessage = null;
          state.toastType = null;
        }),

      // 网络状态
      setOffline: (offline) =>
        set((state) => {
          state.isOffline = offline;
        }),

      // 阅读状态
      setCurrentStory: (storyId) =>
        set((state) => {
          state.currentStoryId = storyId;
          state.currentParagraphIndex = 0;
          state.activeWordIndex = null;
        }),

      setCurrentParagraph: (index) =>
        set((state) => {
          state.currentParagraphIndex = index;
          state.activeWordIndex = null;
        }),

      setActiveWord: (index) =>
        set((state) => {
          state.activeWordIndex = index;
        }),

      resetReadingState: () =>
        set((state) => {
          state.currentStoryId = null;
          state.currentParagraphIndex = 0;
          state.activeWordIndex = null;
        }),

      // Quiz 状态
      setQuizIndex: (index) =>
        set((state) => {
          state.currentQuizIndex = index;
        }),

      setQuizAnswer: (questionId, answer) =>
        set((state) => {
          state.quizAnswers[questionId] = answer;
        }),

      resetQuizState: () =>
        set((state) => {
          state.currentQuizIndex = 0;
          state.quizAnswers = {};
        }),
    })),
    {
      name: 'magic-english-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        isFirstLaunch: state.isFirstLaunch,
        settings: state.settings,
      }),
    }
  )
);

// ============ 选择器 Hooks ============

/** 获取当前用户 ID */
export const useCurrentUserId = () => useAppStore((state) => state.currentUserId);

/** 获取是否首次启动 */
export const useIsFirstLaunch = () => useAppStore((state) => state.isFirstLaunch);

/** 获取设置 */
export const useSettings = () => useAppStore((state) => state.settings);

/** 获取 TTS 语速 */
export const useTTSSpeed = () => useAppStore((state) => state.settings.ttsSpeed);

/** 获取是否离线 */
export const useIsOffline = () => useAppStore((state) => state.isOffline);

/** 获取加载状态 */
export const useLoading = () =>
  useAppStore((state) => ({
    isLoading: state.isLoading,
    message: state.loadingMessage,
  }));

/** 获取 Toast 状态 */
export const useToast = () =>
  useAppStore((state) => ({
    message: state.toastMessage,
    type: state.toastType,
    show: state.showToast,
    hide: state.hideToast,
  }));

/** 获取当前阅读状态 */
export const useReadingState = () =>
  useAppStore((state) => ({
    storyId: state.currentStoryId,
    paragraphIndex: state.currentParagraphIndex,
    activeWordIndex: state.activeWordIndex,
  }));

/** 获取当前 Quiz 状态 */
export const useQuizState = () =>
  useAppStore((state) => ({
    quizIndex: state.currentQuizIndex,
    answers: state.quizAnswers,
  }));

export default useAppStore;


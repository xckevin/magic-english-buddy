/**
 * PWA 安装 Hook
 * 管理 PWA 安装状态和安装提示
 */

import { useState, useEffect, useCallback } from 'react';

/** BeforeInstallPromptEvent 类型定义 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/** PWA 安装状态 */
export interface PWAInstallState {
  /** 是否可以安装（浏览器支持且未安装） */
  canInstall: boolean;
  /** 是否已安装为 PWA */
  isInstalled: boolean;
  /** 是否是 iOS 设备 */
  isIOS: boolean;
  /** 是否是 Android 设备 */
  isAndroid: boolean;
  /** 是否在 standalone 模式（已添加到桌面） */
  isStandalone: boolean;
  /** 触发安装提示 */
  promptInstall: () => Promise<boolean>;
}

// 全局存储 beforeinstallprompt 事件
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * 检测是否为 iOS 设备
 */
const checkIsIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * 检测是否为 Android 设备
 */
const checkIsAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
};

/**
 * 检测是否在 standalone 模式（已添加到桌面）
 */
const checkIsStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // iOS Safari standalone 模式
  if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone) {
    return true;
  }
  
  // Android/Desktop PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // TWA (Trusted Web Activity)
  if (document.referrer.includes('android-app://')) {
    return true;
  }
  
  return false;
};

/**
 * PWA 安装 Hook
 */
export const usePWAInstall = (): PWAInstallState => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const isIOS = checkIsIOS();
  const isAndroid = checkIsAndroid();
  const isStandalone = checkIsStandalone();

  useEffect(() => {
    // 如果已经在 standalone 模式，说明已安装
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      // 阻止默认的安装提示
      e.preventDefault();
      // 保存事件以便后续使用
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    // 监听 appinstalled 事件
    const handleAppInstalled = () => {
      deferredPrompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS 特殊处理：虽然不支持 beforeinstallprompt，但可以引导用户手动添加
    if (isIOS && !isStandalone) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isIOS, isStandalone]);

  /**
   * 触发安装提示
   * @returns 是否成功安装
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // iOS 不支持 prompt，返回 false 让调用方显示手动引导
      return false;
    }

    try {
      // 显示安装提示
      await deferredPrompt.prompt();
      
      // 等待用户响应
      const { outcome } = await deferredPrompt.userChoice;
      
      // 清除已使用的 prompt
      deferredPrompt = null;
      setCanInstall(false);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA install prompt failed:', error);
      return false;
    }
  }, []);

  return {
    canInstall,
    isInstalled,
    isIOS,
    isAndroid,
    isStandalone,
    promptInstall,
  };
};

export default usePWAInstall;


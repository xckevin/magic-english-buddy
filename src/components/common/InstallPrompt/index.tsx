/**
 * InstallPrompt 组件
 * PWA 安装引导弹窗，支持 Android/Desktop 和 iOS
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../Modal';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useAppStore } from '@/stores/useAppStore';
import styles from './InstallPrompt.module.css';

/** 组件属性 */
interface InstallPromptProps {
  /** 是否显示（外部控制） */
  open?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 安装成功回调 */
  onInstalled?: () => void;
}

/** Safari 分享图标 SVG */
const SafariShareIcon = () => (
  <svg 
    className={styles.shareIcon} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L8 6h3v8h2V6h3L12 2z" />
    <path d="M19 9h-3v2h2v9H6v-9h2V9H5c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V10c0-.6-.4-1-1-1z" />
  </svg>
);

/** iOS 安装引导 */
const IOSGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className={styles.iosGuide}>
      <div className={styles.stepList}>
        <div className={styles.step}>
          <span className={styles.stepNumber}>1</span>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>
              点击底部分享按钮
              <span className={styles.stepIcon}>
                <SafariShareIcon />
              </span>
            </div>
            <div className={styles.stepDesc}>
              在 Safari 浏览器底部找到分享图标
            </div>
          </div>
        </div>
        
        <div className={styles.step}>
          <span className={styles.stepNumber}>2</span>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>选择"添加到主屏幕"</div>
            <div className={styles.stepDesc}>
              在弹出的菜单中向下滑动，找到并点击"添加到主屏幕"
            </div>
          </div>
        </div>
        
        <div className={styles.step}>
          <span className={styles.stepNumber}>3</span>
          <div className={styles.stepContent}>
            <div className={styles.stepTitle}>确认添加</div>
            <div className={styles.stepDesc}>
              点击右上角"添加"完成安装，应用图标会出现在主屏幕
            </div>
          </div>
        </div>
      </div>

      {/* 图示 */}
      <div className={styles.illustration}>
        <div className={styles.browserMock}>
          <div className={styles.safariBar}>
            <span>magic-english-buddy</span>
            <span className={styles.shareBtn}>
              <SafariShareIcon />
            </span>
          </div>
        </div>
      </div>

      <button className={styles.closeBtn} onClick={onClose}>
        我知道了
      </button>
    </div>
  );
};

/** 特性列表 */
const FEATURES = [
  { icon: '📱', text: '像原生应用一样全屏体验' },
  { icon: '✈️', text: '完全离线可用，随时学习' },
  { icon: '⚡', text: '一键快速启动' },
];

/**
 * PWA 安装引导组件
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({
  open: externalOpen,
  onClose: externalOnClose,
  onInstalled,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  
  const { canInstall, isInstalled, isIOS, isStandalone, promptInstall } = usePWAInstall();
  
  const pwaInstallDismissed = useAppStore((state) => state.pwaInstallDismissed);
  const setPwaInstallDismissed = useAppStore((state) => state.setPwaInstallDismissed);
  const isFirstLaunch = useAppStore((state) => state.isFirstLaunch);
  
  // 是否由外部控制
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  // 自动显示逻辑（仅在非控制模式下）
  useEffect(() => {
    if (isControlled) return;
    
    // 不显示的条件
    if (pwaInstallDismissed || isInstalled || isStandalone || isFirstLaunch) {
      return;
    }

    // 检查访问次数
    const visitCount = parseInt(localStorage.getItem('pwa_visit_count') || '0', 10);
    localStorage.setItem('pwa_visit_count', String(visitCount + 1));
    
    // 首次访问或访问 3 次后显示
    if (visitCount === 0 || visitCount >= 3) {
      // 延迟显示，让用户先看到应用内容
      const timer = setTimeout(() => {
        if (canInstall) {
          setInternalOpen(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isStandalone, pwaInstallDismissed, isFirstLaunch, isControlled]);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      setPwaInstallDismissed(true);
    }
    
    if (isControlled) {
      externalOnClose?.();
    } else {
      setInternalOpen(false);
    }
    
    setShowIOSGuide(false);
  }, [dontShowAgain, setPwaInstallDismissed, isControlled, externalOnClose]);

  // 点击安装
  const handleInstall = useCallback(async () => {
    if (isIOS) {
      // iOS 显示手动引导
      setShowIOSGuide(true);
      return;
    }

    const success = await promptInstall();
    if (success) {
      onInstalled?.();
      handleClose();
    }
  }, [isIOS, promptInstall, onInstalled, handleClose]);

  // 稍后提醒
  const handleLater = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // 不显示弹窗的情况
  if (!isOpen || isInstalled || isStandalone) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={showIOSGuide ? '📲 添加到主屏幕' : '✨ 添加到桌面'}
      size="sm"
      closeOnOverlay={false}
    >
      <div className={styles.container}>
        {showIOSGuide ? (
          <IOSGuide onClose={handleClose} />
        ) : (
          <>
            {/* 应用图标 */}
            <motion.div 
              className={styles.iconWrapper}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            >
              <div className={styles.iconGlow} />
              <div className={styles.appIcon}>🧙‍♂️</div>
            </motion.div>

            {/* 标题和描述 */}
            <h3 className={styles.title}>Magic English Buddy</h3>
            <p className={styles.description}>
              将应用添加到桌面，随时开始你的魔法英语之旅！
            </p>

            {/* 特性列表 */}
            <motion.div 
              className={styles.features}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {FEATURES.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* 按钮组 */}
            <div className={styles.actions}>
              <motion.button
                className={styles.installBtn}
                onClick={handleInstall}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                📲 {isIOS ? '查看步骤' : '立即安装'}
              </motion.button>
              <button className={styles.laterBtn} onClick={handleLater}>
                稍后提醒
              </button>
            </div>

            {/* 不再显示选项 */}
            <label className={styles.dismissOption}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span className={styles.dismissLabel}>不再显示此提示</span>
            </label>
          </>
        )}
      </div>
    </Modal>
  );
};

export default InstallPrompt;


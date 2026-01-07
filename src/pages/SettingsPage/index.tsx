/**
 * SettingsPage - 设置页面
 * 应用设置、用户信息、数据管理
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useSettings } from '@/stores/useAppStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallPrompt } from '@/components/common';
import { db } from '@/db';
import styles from './SettingsPage.module.css';

// 设置项组件
interface SettingItemProps {
    icon: string;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, children }) => (
    <div className={styles.settingItem}>
        <div className={styles.settingIcon}>{icon}</div>
        <div className={styles.settingContent}>
            <span className={styles.settingTitle}>{title}</span>
            {description && <span className={styles.settingDesc}>{description}</span>}
        </div>
        <div className={styles.settingControl}>{children}</div>
    </div>
);

// 开关组件
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled }) => (
    <button
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''} ${disabled ? styles.toggleDisabled : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        type="button"
    >
        <motion.div
            className={styles.toggleThumb}
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
    </button>
);

// 语速选择组件
interface SpeedSelectorProps {
    value: 0.8 | 1.0 | 1.2;
    onChange: (value: 0.8 | 1.0 | 1.2) => void;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({ value, onChange }) => {
    const options: Array<{ value: 0.8 | 1.0 | 1.2; label: string }> = [
        { value: 0.8, label: '慢' },
        { value: 1.0, label: '正常' },
        { value: 1.2, label: '快' },
    ];

    return (
        <div className={styles.speedSelector}>
            {options.map((option) => (
                <button
                    key={option.value}
                    className={`${styles.speedOption} ${value === option.value ? styles.speedOptionActive : ''}`}
                    onClick={() => onChange(option.value)}
                    type="button"
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

// 确认弹窗组件
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = '确认',
    cancelText = '取消',
    onConfirm,
    onCancel,
    danger,
}) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className={styles.dialogOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
            >
                <motion.div
                    className={styles.dialog}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className={styles.dialogTitle}>{title}</h3>
                    <p className={styles.dialogMessage}>{message}</p>
                    <div className={styles.dialogActions}>
                        <button className={styles.dialogCancel} onClick={onCancel} type="button">
                            {cancelText}
                        </button>
                        <button
                            className={`${styles.dialogConfirm} ${danger ? styles.dialogDanger : ''}`}
                            onClick={onConfirm}
                            type="button"
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const settings = useSettings();
    const { updateSettings, resetSettings } = useAppStore();
    const { canInstall, isInstalled, isStandalone } = usePWAInstall();

    // 弹窗状态
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showClearDataDialog, setShowClearDataDialog] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // 处理设置更新
    const handleToggle = useCallback(
        (key: keyof typeof settings, value: boolean) => {
            updateSettings({ [key]: value });
        },
        [updateSettings]
    );

    const handleSpeedChange = useCallback(
        (speed: 0.8 | 1.0 | 1.2) => {
            updateSettings({ ttsSpeed: speed });
        },
        [updateSettings]
    );

    // 重置设置
    const handleResetSettings = useCallback(() => {
        resetSettings();
        setShowResetDialog(false);
    }, [resetSettings]);

    // 清除所有数据
    const handleClearData = useCallback(async () => {
        setIsClearing(true);
        try {
            // 清除 IndexedDB 数据
            await db.delete();
            // 清除 localStorage
            localStorage.clear();
            // 刷新页面
            window.location.href = '/magic-english-buddy/onboarding';
        } catch (error) {
            console.error('清除数据失败:', error);
            setIsClearing(false);
            setShowClearDataDialog(false);
        }
    }, []);

    return (
        <div className={styles.container}>
            {/* 顶部导航栏 */}
            <header className={styles.header}>
                <motion.button
                    className={styles.backBtn}
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    ←
                </motion.button>
                <h1 className={styles.title}>设置</h1>
                <div className={styles.placeholder} />
            </header>

            {/* 设置内容 */}
            <main className={styles.content}>
                {/* 音效设置 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🔊 音效设置</h2>
                    <div className={styles.sectionContent}>
                        <SettingItem icon="🔔" title="音效" description="开启按钮点击等音效">
                            <Toggle
                                checked={settings.soundEnabled}
                                onChange={(v) => handleToggle('soundEnabled', v)}
                            />
                        </SettingItem>
                        <SettingItem icon="📳" title="震动反馈" description="操作时震动提示">
                            <Toggle
                                checked={settings.vibrationEnabled}
                                onChange={(v) => handleToggle('vibrationEnabled', v)}
                            />
                        </SettingItem>
                    </div>
                </section>

                {/* 朗读设置 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🎙️ 朗读设置</h2>
                    <div className={styles.sectionContent}>
                        <SettingItem icon="▶️" title="自动朗读" description="进入阅读页自动播放">
                            <Toggle
                                checked={settings.autoPlayTTS}
                                onChange={(v) => handleToggle('autoPlayTTS', v)}
                            />
                        </SettingItem>
                        <SettingItem icon="⏱️" title="朗读语速" description="调整语音播放速度">
                            <SpeedSelector value={settings.ttsSpeed} onChange={handleSpeedChange} />
                        </SettingItem>
                    </div>
                </section>

                {/* 显示设置 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>👁️ 显示设置</h2>
                    <div className={styles.sectionContent}>
                        <SettingItem icon="🌐" title="显示翻译" description="阅读时显示中文翻译">
                            <Toggle
                                checked={settings.showTranslation}
                                onChange={(v) => handleToggle('showTranslation', v)}
                            />
                        </SettingItem>
                    </div>
                </section>

                {/* 应用安装 - 仅在未安装时显示 */}
                {canInstall && !isInstalled && !isStandalone && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>📲 应用安装</h2>
                        <div className={styles.sectionContent}>
                            <motion.button
                                className={`${styles.actionButton} ${styles.actionHighlight}`}
                                onClick={() => setShowInstallPrompt(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className={styles.actionIcon}>✨</span>
                                <span className={styles.actionText}>
                                    <strong>添加到桌面</strong>
                                    <small>像原生应用一样快速启动</small>
                                </span>
                                <span className={styles.actionArrow}>›</span>
                            </motion.button>
                        </div>
                    </section>
                )}

                {/* 数据管理 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>📦 数据管理</h2>
                    <div className={styles.sectionContent}>
                        <motion.button
                            className={styles.actionButton}
                            onClick={() => setShowResetDialog(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className={styles.actionIcon}>🔄</span>
                            <span className={styles.actionText}>
                                <strong>重置设置</strong>
                                <small>恢复默认设置</small>
                            </span>
                            <span className={styles.actionArrow}>›</span>
                        </motion.button>

                        <motion.button
                            className={`${styles.actionButton} ${styles.actionDanger}`}
                            onClick={() => setShowClearDataDialog(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className={styles.actionIcon}>🗑️</span>
                            <span className={styles.actionText}>
                                <strong>清除所有数据</strong>
                                <small>删除学习进度和设置</small>
                            </span>
                            <span className={styles.actionArrow}>›</span>
                        </motion.button>
                    </div>
                </section>

                {/* 关于 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ℹ️ 关于</h2>
                    <div className={styles.sectionContent}>
                        <div className={styles.aboutCard}>
                            <div className={styles.appLogo}>🧙‍♂️</div>
                            <div className={styles.appInfo}>
                                <h3 className={styles.appName}>Magic English Buddy</h3>
                                <p className={styles.appVersion}>版本 1.0.0</p>
                                <p className={styles.appDesc}>让英语学习像魔法一样有趣！</p>
                            </div>
                        </div>
                        <div className={styles.aboutLinks}>
                            <a href="#" className={styles.aboutLink}>
                                📖 使用帮助
                            </a>
                            <a href="#" className={styles.aboutLink}>
                                💬 意见反馈
                            </a>
                            <a href="#" className={styles.aboutLink}>
                                📜 隐私政策
                            </a>
                        </div>
                    </div>
                </section>

                {/* 底部留白 */}
                <div className={styles.bottomSpacer} />
            </main>

            {/* 重置设置确认弹窗 */}
            <ConfirmDialog
                isOpen={showResetDialog}
                title="重置设置"
                message="确定要将所有设置恢复为默认值吗？"
                confirmText="重置"
                onConfirm={handleResetSettings}
                onCancel={() => setShowResetDialog(false)}
            />

            {/* 清除数据确认弹窗 */}
            <ConfirmDialog
                isOpen={showClearDataDialog}
                title="清除所有数据"
                message="此操作将删除所有学习进度、收藏内容和设置，且无法恢复。确定要继续吗？"
                confirmText={isClearing ? '清除中...' : '确定清除'}
                onConfirm={handleClearData}
                onCancel={() => setShowClearDataDialog(false)}
                danger
            />

            {/* PWA 安装引导弹窗 */}
            <InstallPrompt
                open={showInstallPrompt}
                onClose={() => setShowInstallPrompt(false)}
                onInstalled={() => setShowInstallPrompt(false)}
            />
        </div>
    );
};

export default SettingsPage;


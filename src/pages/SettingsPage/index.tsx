/** 应用设置与本地数据管理。 */

import { useCallback, useState, type ReactNode } from 'react';
import { useAppStore, useSettings } from '@/stores/useAppStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallPrompt, Modal } from '@/components/common';
import AppShell from '@/components/common/AppShell';
import { db } from '@/db';
import { OfflineAudioSettings } from '@/components/settings/OfflineAudioSettings';
import { BackupSettings } from '@/components/settings/BackupSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { audioDownloadService } from '@/services/audioDownloadService';
import styles from './SettingsPage.module.css';

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
  wideControl?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  children,
  wideControl,
}) => (
  <div className={`${styles.settingItem} ${wideControl ? styles.wideControl : ''}`}>
    <span className={styles.settingIcon} aria-hidden="true">
      {icon}
    </span>
    <div className={styles.settingContent}>
      <span className={styles.settingTitle}>{title}</span>
      <span className={styles.settingDesc}>{description}</span>
    </div>
    <div className={styles.settingControl}>{children}</div>
  </div>
);

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ label, checked, onChange, disabled }) => (
  <button
    className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
    onClick={() => onChange(!checked)}
    disabled={disabled}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
  >
    <span className={styles.toggleThumb} />
  </button>
);

const SpeedSelector: React.FC<{
  value: 0.8 | 1.0 | 1.2;
  onChange: (value: 0.8 | 1.0 | 1.2) => void;
}> = ({ value, onChange }) => (
  <div className={styles.speedSelector} role="group" aria-label="朗读语速">
    {(
      [
        { value: 0.8, label: '慢' },
        { value: 1.0, label: '正常' },
        { value: 1.2, label: '快' },
      ] as const
    ).map(option => (
      <button
        key={option.value}
        className={value === option.value ? styles.speedOptionActive : styles.speedOption}
        onClick={() => onChange(option.value)}
        aria-pressed={value === option.value}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);

const SettingsPage: React.FC = () => {
  const settings = useSettings();
  const { updateSettings, resetSettings } = useAppStore();
  const { canInstall, isInstalled, isStandalone, isIOS } = usePWAInstall();
  const [dialog, setDialog] = useState<'reset' | 'clear' | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);

  const save = useCallback(
    (changes: Partial<typeof settings>) => {
      try {
        updateSettings(changes);
        setSaveError(null);
      } catch (error) {
        console.error('保存设置失败:', error);
        setSaveError('设置没有保存成功，请再试一次。');
      }
    },
    [updateSettings]
  );

  const handleResetSettings = useCallback(() => {
    try {
      resetSettings();
      setSaveError(null);
      setDialog(null);
    } catch (error) {
      console.error('重置设置失败:', error);
      setSaveError('设置没有重置成功，请再试一次。');
    }
  }, [resetSettings]);

  const handleClearData = useCallback(async () => {
    setIsClearing(true);
    setSaveError(null);
    try {
      if (audioDownloadService.getSnapshot().supported) {
        await audioDownloadService.remove('all');
        if (audioDownloadService.getSnapshot().error) throw new Error('Audio removal failed');
      }
      await db.delete();
      localStorage.removeItem('magic-english-storage');
      localStorage.removeItem('magic_english_data_initialized');
      localStorage.removeItem('map_swipe_hint');
      window.location.assign('/magic-english-buddy/onboarding');
    } catch (error) {
      console.error('清除数据失败:', error);
      setIsClearing(false);
      setDialog(null);
      setSaveError('数据没有清除成功，请再试一次。');
    }
  }, []);

  const dialogContent =
    dialog === 'reset'
      ? {
          title: '重置设置',
          message: '将朗读和显示偏好恢复为默认值。学习进度不会受影响。',
          confirm: '重置',
          action: handleResetSettings,
          danger: false,
        }
      : {
          title: '清除所有数据',
          message: '这会删除本设备上的学习进度、收藏、设置和已下载音频。学习记录无法恢复。',
          confirm: isClearing ? '清除中…' : '确定清除',
          action: handleClearData,
          danger: true,
        };

  return (
    <AppShell title="设置" subtitle="调整共用设备上的阅读与学习体验">
      <div className={styles.page}>
        {saveError && (
          <p className={styles.inlineError} role="alert">
            {saveError}
          </p>
        )}

        <section className={styles.section} aria-labelledby="reading-settings">
          <h2 id="reading-settings" className={styles.sectionTitle}>
            朗读与显示
          </h2>
          <div className={styles.sectionContent}>
            <SettingItem
              icon="⏱️"
              title="朗读语速"
              description="阅读页朗读会使用此速度。"
              wideControl
            >
              <SpeedSelector value={settings.ttsSpeed} onChange={ttsSpeed => save({ ttsSpeed })} />
            </SettingItem>
            <SettingItem icon="🌐" title="显示翻译" description="阅读页会使用此偏好显示中文翻译。">
              <Toggle
                label="显示翻译"
                checked={settings.showTranslation}
                onChange={value => save({ showTranslation: value })}
              />
            </SettingItem>
          </div>
        </section>

        <ProfileSettings
          onProfileActivated={() =>
            window.location.replace(`${import.meta.env.BASE_URL}onboarding`)
          }
        />

        <OfflineAudioSettings showIOSInstallNote={isIOS && !isStandalone} />

        <BackupSettings />

        {canInstall && !isInstalled && !isStandalone && (
          <section className={styles.section} aria-labelledby="install-settings">
            <h2 id="install-settings" className={styles.sectionTitle}>
              应用安装
            </h2>
            <div className={styles.sectionContent}>
              <ActionButton
                icon="✨"
                title="添加到桌面"
                description="像应用一样从设备桌面打开"
                onClick={() => setShowInstallPrompt(true)}
              />
            </div>
          </section>
        )}

        <section className={styles.section} aria-labelledby="data-settings">
          <h2 id="data-settings" className={styles.sectionTitle}>
            数据管理
          </h2>
          <div className={styles.sectionContent}>
            <ActionButton
              icon="🔄"
              title="重置设置"
              description="恢复默认的阅读和显示偏好"
              onClick={() => setDialog('reset')}
            />
            <ActionButton
              icon="🗑️"
              title="清除所有数据"
              description="删除本设备上的学习进度和设置"
              onClick={() => setDialog('clear')}
              danger
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-settings">
          <h2 id="about-settings" className={styles.sectionTitle}>
            关于
          </h2>
          <div className={styles.sectionContent}>
            <div className={styles.aboutCard}>
              <span className={styles.appLogo} aria-hidden="true">
                🧙‍♂️
              </span>
              <div>
                <h3>Magic English Buddy</h3>
                <p>版本 1.0.0 · 让英语学习像魔法一样有趣。</p>
              </div>
            </div>
            <div className={styles.helpActions}>
              <a
                href={`${import.meta.env.BASE_URL}licenses/ECDICT-LICENSE.txt`}
                target="_blank"
                rel="noreferrer"
              >
                词典开源许可
              </a>
              <button
                type="button"
                onClick={() =>
                  setHelpText('阅读时可以点击单词查看释义；完成故事后，成长记录会更新。')
                }
              >
                📖 使用帮助
              </button>
              <button
                type="button"
                onClick={() =>
                  setHelpText(
                    '当前版本尚未接入反馈通道。你可以记录问题，并在下一次更新时查看支持入口。'
                  )
                }
              >
                💬 意见反馈
              </button>
              <button
                type="button"
                onClick={() =>
                  setHelpText('学习数据保存在这台设备上。使用“清除所有数据”会移除本应用的数据。')
                }
              >
                📜 隐私说明
              </button>
            </div>
            {helpText && (
              <p className={styles.helpText} role="status">
                {helpText}
              </p>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={dialog !== null}
        onClose={() => !isClearing && setDialog(null)}
        title={dialogContent.title}
        size="sm"
        showCloseButton={!isClearing}
        closeOnOverlay={!isClearing}
        footer={
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={() => setDialog(null)}
              disabled={isClearing}
              className={styles.modalCancel}
            >
              取消
            </button>
            <button
              type="button"
              onClick={dialogContent.action}
              disabled={isClearing}
              className={dialogContent.danger ? styles.modalDanger : styles.modalConfirm}
            >
              {dialogContent.confirm}
            </button>
          </div>
        }
      >
        <p className={styles.modalMessage}>{dialogContent.message}</p>
      </Modal>
      <InstallPrompt
        open={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        onInstalled={() => setShowInstallPrompt(false)}
      />
    </AppShell>
  );
};

const ActionButton: React.FC<{
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, title, description, onClick, danger }) => (
  <button
    className={danger ? `${styles.actionButton} ${styles.actionDanger}` : styles.actionButton}
    onClick={onClick}
    type="button"
  >
    <span className={styles.actionIcon} aria-hidden="true">
      {icon}
    </span>
    <span className={styles.actionText}>
      <strong>{title}</strong>
      <small>{description}</small>
    </span>
    <span className={styles.actionArrow} aria-hidden="true">
      ›
    </span>
  </button>
);

export default SettingsPage;

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/db';
import { Modal } from '@/components/common';
import {
  createLearningProfile,
  listLearningProfiles,
  PROFILE_NAME_MAX_LENGTH,
  renameLearningProfile,
  switchLearningProfile,
} from '@/services/profileService';
import { useAppStore } from '@/stores/useAppStore';
import styles from './ProfileSettings.module.css';

type Dialog = 'create' | 'rename' | null;

interface ProfileSettingsProps {
  /** Called only after a profile has been committed and activated. */
  onProfileActivated: () => void;
}

const profileDescription = (profile: User) =>
  `${profile.buddyName} · ${new Date(profile.lastActiveAt).toLocaleDateString('zh-CN')} 最近使用`;

export function ProfileSettings({ onProfileActivated }: ProfileSettingsProps) {
  const currentUserId = useAppStore(state => state.currentUserId);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [name, setName] = useState('');
  const [buddyName, setBuddyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const beginOperation = () => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    return true;
  };

  const finishOperation = () => {
    busyRef.current = false;
    setBusy(false);
  };

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const nextProfiles = await listLearningProfiles();
      setProfiles(nextProfiles);
    } catch {
      setError('暂时无法读取学习档案，请刷新后重试。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const activeProfile = profiles.find(profile => profile.id === currentUserId) ?? null;
  const closeDialog = () => {
    if (busyRef.current) return;
    setDialog(null);
    setError(null);
  };
  const openCreate = () => {
    setName('');
    setBuddyName('');
    setError(null);
    setDialog('create');
  };
  const openRename = () => {
    if (!activeProfile) return;
    setName(activeProfile.name);
    setBuddyName(activeProfile.buddyName);
    setError(null);
    setDialog('rename');
  };

  const activateProfile = async (profileId: string) => {
    if (profileId === currentUserId || !beginOperation()) return;
    setError(null);
    try {
      await switchLearningProfile(profileId);
      onProfileActivated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '切换学习档案失败，请再试一次。');
    } finally {
      finishOperation();
    }
  };

  const submitProfile = async () => {
    if (!beginOperation()) return;
    setError(null);
    try {
      if (dialog === 'create') {
        await createLearningProfile(name, buddyName);
        onProfileActivated();
        return;
      }
      if (!activeProfile) throw new Error('当前学习档案不可用，请刷新后重试。');
      const renamed = await renameLearningProfile(activeProfile.id, name, buddyName);
      setProfiles(existing =>
        existing.map(profile => (profile.id === renamed.id ? renamed : profile))
      );
      setDialog(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存学习档案失败，请再试一次。');
    } finally {
      finishOperation();
    }
  };

  return (
    <section className={styles.section} aria-labelledby="profile-settings-heading">
      <div className={styles.heading}>
        <div>
          <h2 id="profile-settings-heading">学习档案</h2>
          <p>每个档案保留自己的地图、练习、单词和成就。</p>
        </div>
        <button type="button" className={styles.createButton} onClick={openCreate} disabled={busy}>
          + 新建档案
        </button>
      </div>
      <div className={styles.panel} aria-busy={loading}>
        <p className={styles.note}>
          原有学习记录会保留在原档案；新档案从第一课和 0 魔力开始。下载的音频由这台设备共享。
        </p>
        {loading ? (
          <p role="status" className={styles.status}>
            正在读取学习档案…
          </p>
        ) : profiles.length === 0 ? (
          <p role="status" className={styles.status}>
            还没有学习档案。新建一个后就能开始学习。
          </p>
        ) : (
          <ul className={styles.profileList} aria-label="学习档案列表">
            {profiles.map(profile => {
              const active = profile.id === currentUserId;
              return (
                <li key={profile.id} className={active ? styles.profileActive : styles.profile}>
                  <button
                    type="button"
                    className={styles.profileButton}
                    onClick={() => void activateProfile(profile.id)}
                    disabled={busy || active}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className={styles.profileAvatar} aria-hidden="true">
                      {profile.name.slice(0, 1)}
                    </span>
                    <span className={styles.profileText}>
                      <strong>{profile.name}</strong>
                      <small>{profileDescription(profile)}</small>
                    </span>
                    <span className={styles.profileState}>{active ? '正在使用' : '切换'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {activeProfile && (
          <button
            type="button"
            className={styles.renameButton}
            onClick={openRename}
            disabled={busy}
          >
            重命名当前档案
          </button>
        )}
      </div>
      {error && dialog === null && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <Modal
        open={dialog !== null}
        onClose={closeDialog}
        title={dialog === 'create' ? '新建学习档案' : '重命名学习档案'}
        size="sm"
        showCloseButton={!busy}
        closeOnOverlay={!busy}
        closeOnEsc={!busy}
      >
        <form
          className={styles.form}
          onSubmit={event => {
            event.preventDefault();
            void submitProfile();
          }}
        >
          <p className={styles.formIntro}>
            {dialog === 'create'
              ? '新档案会从第一课开始，不会改动已有档案。'
              : '新名字会显示在这台设备的学习记录中。'}
          </p>
          <label htmlFor="profile-name">
            学习者名字
            <input
              id="profile-name"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={PROFILE_NAME_MAX_LENGTH}
              autoComplete="nickname"
              disabled={busy}
              required
              autoFocus
            />
          </label>
          <label htmlFor="profile-buddy-name">
            伙伴名字
            <input
              id="profile-buddy-name"
              value={buddyName}
              onChange={event => setBuddyName(event.target.value)}
              maxLength={PROFILE_NAME_MAX_LENGTH}
              autoComplete="off"
              disabled={busy}
              required
            />
          </label>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <div className={styles.formActions}>
            <button type="button" onClick={closeDialog} disabled={busy}>
              取消
            </button>
            <button type="submit" disabled={busy} className={styles.confirmButton}>
              {busy ? '保存中…' : dialog === 'create' ? '创建并开始' : '保存名字'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default ProfileSettings;

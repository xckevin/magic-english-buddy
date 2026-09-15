import { useAppStore } from '@/stores/useAppStore';
import type { LearningBackup } from './backupService';

const channelName = 'magic-buddy-backup-restored';
const pulseKey = 'magic-buddy-restore-revision';
let channel: BroadcastChannel | undefined;
let listening = false;

/** Other open windows discard their in-memory screens after a successful restore. */
export function installBackupWindowSync(): void {
  if (listening) return;
  listening = true;
  let reloading = false;
  const reload = () => {
    if (reloading) return;
    reloading = true;
    window.location.replace(`${import.meta.env.BASE_URL}onboarding`);
  };
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(channelName);
    } catch {
      /* Use storage events below. */
    }
  }
  if (channel) {
    channel.onmessage = event => {
      const profile = event.data;
      if (profile?.type !== 'restored') return;
      // localStorage is shared by tabs, but Safari may have temporarily disabled it.
      if (typeof profile.currentUserId === 'string') {
        try {
          useAppStore.setState({ currentUserId: profile.currentUserId, isFirstLaunch: false });
        } catch {
          /* Reload can still find the restored DB user. */
        }
      }
      reload();
    };
  }
  window.addEventListener('storage', event => {
    if (event.key === pulseKey && event.newValue) reload();
  });
}

export function announceBackupRestore(backup: LearningBackup): void {
  try {
    channel?.postMessage({ type: 'restored', currentUserId: backup.currentUserId });
  } catch {
    /* Use the storage event fallback. */
  }
  try {
    localStorage.setItem(pulseKey, `${Date.now()}:${Math.random()}`);
  } catch {
    /* BroadcastChannel still works when available. */
  }
}

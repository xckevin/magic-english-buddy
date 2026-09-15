import { db, generateId, type User } from '@/db';

const channelName = 'magic-buddy-profile-selected';
const pulseKey = 'magic-buddy-profile-selection';
let channel: BroadcastChannel | undefined;
let installed = false;

/** Commit the selected identity before updating any window's displayed profile. */
export async function recordProfileSelection(userId: string): Promise<User> {
  return db.transaction('rw', [db.users, db.learningMeta], async () => {
    const user = await db.users.get(userId);
    if (!user) throw new Error('这个学习档案已不存在，请重新选择。');
    const current = await db.learningMeta.get('activeProfileId');
    if (current?.value !== userId) {
      await db.learningMeta.bulkPut([
        { key: 'activeProfileId', value: userId },
        { key: 'profileRevision', value: generateId() },
      ]);
    }
    const lastActiveAt = Date.now();
    await db.users.update(userId, { lastActiveAt });
    return { ...user, lastActiveAt };
  });
}

/** Other tabs must release their old reading, quiz and recording screens. */
export function installProfileWindowSync(): void {
  if (installed) return;
  installed = true;
  let reloading = false;
  const reload = () => {
    if (reloading) return;
    reloading = true;
    window.location.replace(`${import.meta.env.BASE_URL}onboarding`);
  };
  try {
    if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel(channelName);
  } catch {
    // Storage events still notify other windows if BroadcastChannel is unavailable.
  }
  if (channel) channel.onmessage = event => {
    if (event.data?.type === 'selected') reload();
  };
  window.addEventListener('storage', event => {
    if (event.key === pulseKey && event.newValue) reload();
  });
}

export function announceProfileSwitch(userId: string): void {
  try {
    channel?.postMessage({ type: 'selected', userId });
  } catch {
    // Keep the local selection even if another window cannot be notified.
  }
  try {
    localStorage.setItem(pulseKey, `${Date.now()}:${generateId()}`);
  } catch {
    // Initialization can still recover the selected identity from IndexedDB.
  }
}

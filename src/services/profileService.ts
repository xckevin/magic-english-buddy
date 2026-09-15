import { createUser, db, type User } from '@/db';
import { audioRecorderService } from '@/services/audioRecorderService';
import { announceProfileSwitch, recordProfileSelection } from '@/services/profileWindowSync';
import { ttsService } from '@/services/ttsService';
import { useAppStore } from '@/stores/useAppStore';

export const PROFILE_NAME_MAX_LENGTH = 20;

const normalizeName = (value: string, label: string): string => {
  const normalized = value.trim();
  if (!normalized) throw new Error(`请填写${label}。`);
  if (Array.from(normalized).length > PROFILE_NAME_MAX_LENGTH)
    throw new Error(`${label}最多 ${PROFILE_NAME_MAX_LENGTH} 个字符。`);
  return normalized;
};

const releaseLearningSession = () => {
  // Playback and microphone sessions are process-wide. Release them before
  // changing identity, so a late audio callback cannot paint the old profile.
  ttsService.stop();
  audioRecorderService.reset();
};

const publishActivation = (user: User): User => {
  try {
    useAppStore.getState().activateLearningProfile(user);
  } catch {
    // The profile selection is already committed. Reload through onboarding so
    // initialization reads activeProfileId from IndexedDB instead of retaining
    // an old in-memory profile after a localStorage persistence failure.
    window.location.replace(`${import.meta.env.BASE_URL}onboarding`);
  }
  announceProfileSwitch(user.id);
  return user;
};

export const listLearningProfiles = async (): Promise<User[]> =>
  db.users.orderBy('createdAt').toArray();

/** Creates an independent learning record and makes it the active profile. */
export const createLearningProfile = async (name: string, buddyName: string): Promise<User> => {
  const normalizedName = normalizeName(name, '学习者名字');
  const normalizedBuddyName = normalizeName(buddyName, '伙伴名字');
  const user = await db.transaction(
    'rw',
    [db.users, db.userProgress, db.learningMeta],
    async () => {
      // Both helpers use compatible nested transactions. Dexie joins them to
      // this outer transaction, so a failed active-profile write rolls back
      // the new user and its fresh progress together.
      const created = await createUser(normalizedName, normalizedBuddyName);
      return recordProfileSelection(created.id);
    }
  );
  releaseLearningSession();
  return publishActivation(user);
};

/** Selects a persisted profile and clears all in-memory lesson state. */
export const switchLearningProfile = async (userId: string): Promise<User> => {
  releaseLearningSession();
  const user = await recordProfileSelection(userId);
  return publishActivation(user);
};

export const renameLearningProfile = async (
  userId: string,
  name: string,
  buddyName: string
): Promise<User> => {
  const normalizedName = normalizeName(name, '学习者名字');
  const normalizedBuddyName = normalizeName(buddyName, '伙伴名字');
  const existing = await db.users.get(userId);
  if (!existing) throw new Error('这个学习档案已不存在，请重新选择。');
  const lastActiveAt = Date.now();

  await db.users.update(userId, {
    name: normalizedName,
    buddyName: normalizedBuddyName,
    lastActiveAt,
  });
  return {
    ...existing,
    name: normalizedName,
    buddyName: normalizedBuddyName,
    lastActiveAt,
  };
};

export default {
  listLearningProfiles,
  createLearningProfile,
  switchLearningProfile,
  renameLearningProfile,
};

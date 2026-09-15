import { db, type User, type UserProgress } from '@/db';
import { getUserMapNodes } from './mapProgressService';
import { getEffectiveStreak } from './learningActivityService';

export interface CertificateData {
  userId: string;
  studentName: string;
  buddyName: string;
  level: number;
  storiesCompleted: number;
  magicPower: number;
  streakDays: number;
  issuedOn: string;
}

const displayName = (value: string, fallback: string) => {
  const normalized = value.trim();
  return normalized || fallback;
};

export const formatCertificateDate = (date = new Date()): string => date.toLocaleDateString('zh-CN');

export const toCertificateData = (
  user: User,
  progress: UserProgress,
  completedStories: number,
  date = new Date()
): CertificateData => ({
  userId: user.id,
  studentName: displayName(user.name, '小学习者'),
  buddyName: displayName(user.buddyName, '学习伙伴'),
  level: progress.level,
  storiesCompleted: completedStories,
  magicPower: progress.magicPower,
  streakDays: getEffectiveStreak(progress, date.getTime()),
  issuedOn: formatCertificateDate(date),
});

/**
 * Returns a certificate only for this profile's passed map courses. Reading a
 * lesson without passing its course does not create a certificate milestone.
 */
export const getCertificateData = async (userId: string): Promise<CertificateData | null> => {
  const [user, progress, nodes, stories] = await Promise.all([
    db.users.get(userId),
    db.userProgress.get(userId),
    getUserMapNodes(userId),
    db.stories.toArray(),
  ]);
  if (!user || !progress) return null;

  const storyIds = new Set(stories.map(story => story.id));
  const completedStories = new Set(
    nodes
      .filter(node => node.completed && node.storyId && storyIds.has(node.storyId))
      .map(node => node.storyId as string)
  );
  if (!completedStories.size) return null;

  return toCertificateData(user, progress, completedStories.size);
};

export default { getCertificateData, toCertificateData, formatCertificateDate };

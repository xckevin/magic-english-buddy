import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db';
import { getCertificateData, toCertificateData } from '@/services/certificateService';
import { createTestDatabase, mockUser, mockUserProgress } from '../mocks';

const anotherUser = { ...mockUser, id: 'test-user-002', name: '另一位学习者' };
const anotherProgress = { ...mockUserProgress, id: anotherUser.id, completedNodes: [], unlockedNodes: [] };

describe('certificateService', () => {
  beforeEach(async () => {
    await createTestDatabase();
    await db.users.bulkAdd([mockUser, anotherUser]);
    await db.userProgress.bulkAdd([
      { ...mockUserProgress, completedNodes: ['done-a', 'done-a-duplicate'], unlockedNodes: ['done-a'] },
      anotherProgress,
    ]);
    await db.stories.bulkAdd([
      { id: 'story-a', level: 1, regionId: 'r', title: 'A', titleCn: 'A', coverImage: '', audioFile: '', content: [], quiz: [], rewards: { magicPower: 0, cards: [] }, metadata: { wordCount: 0, estimatedTime: 0, difficulty: 1 } },
    ]);
    await db.mapNodes.bulkAdd([
      { id: 'done-a', regionId: 'r', type: 'story', storyId: 'story-a', position: { x: 0, y: 0 }, prerequisites: [], rewards: {} },
      { id: 'done-a-duplicate', regionId: 'r', type: 'bonus', storyId: 'story-a', position: { x: 1, y: 0 }, prerequisites: [], rewards: {} },
      { id: 'invalid-story', regionId: 'r', type: 'story', storyId: 'unknown', position: { x: 2, y: 0 }, prerequisites: [], rewards: {} },
    ]);
  });

  afterEach(async () => createTestDatabase());

  it('counts only this profile’s completed, valid course stories once', async () => {
    const certificate = await getCertificateData(mockUser.id);
    expect(certificate).toMatchObject({ userId: mockUser.id, storiesCompleted: 1, studentName: mockUser.name });
    await expect(getCertificateData(anotherUser.id)).resolves.toBeNull();
  });

  it('does not issue a milestone from an invalid completed node', async () => {
    await db.userProgress.update(mockUser.id, { completedNodes: ['invalid-story'] });
    await expect(getCertificateData(mockUser.id)).resolves.toBeNull();
  });

  it('keeps a legacy long name intact for the wrapping certificate layout', () => {
    const data = toCertificateData(
      { ...mockUser, name: '学习者学习者学习者学习者学习者学习者学习者学习者学习者学习者学习者', buddyName: '' },
      mockUserProgress,
      1,
      new Date(2026, 8, 15)
    );
    expect(data.studentName).toContain('学习者学习者学习者');
    expect(data.buddyName).toBe('学习伙伴');
    expect(data.issuedOn).toContain('2026');
  });
});

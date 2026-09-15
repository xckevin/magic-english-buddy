import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { db, createUser, createDefaultSettings } from '@/db';
import { initMapData, initStories } from '@/services/dataInitService';
import { convertToCard } from '@/services/cardCollectionService';
import { exportBackup, parseBackup, restoreBackup } from '@/services/backupService';
import { getUserMapNodes } from '@/services/mapProgressService';

beforeEach(async () => {
  for (const table of db.tables) await table.clear();
  await initStories();
  await initMapData();
});
afterEach(() => vi.restoreAllMocks());
async function fixture() {
  const user = await createUser('小明', '云朵');
  await db.userProgress.update(user.id, { magicPower: 37, totalStoriesRead: 1 });
  const first = await db.mapNodes.where('storyId').equals('l1_001').first();
  await db.userProgress.update(user.id, { completedNodes: [first!.id] });
  await convertToCard(user.id, 'apple', '苹果', '🍎');
  await db.achievements.put({
    id: `${user.id}_first_story`,
    userId: user.id,
    achievementId: 'first_story',
    unlockedAt: 1,
    claimed: true,
  });
  await db.quizDrafts.put({
    id: `${user.id}:l1_002`,
    userId: user.id,
    storyId: 'l1_002',
    questionFingerprint: 'test',
    startedAt: 10,
    updatedAt: 15,
    stage: 'playing',
    currentQuestionIndex: 1,
    answers: [{ questionId: 'q1', userAnswer: 'cat' }],
    hintsUsed: 1,
  });
  const text = await exportBackup(user.id, createDefaultSettings());
  return { user, text, backup: parseBackup(text) };
}
describe('Learning backups', () => {
  it('restores progress, map, cards, achievements and drafts on a fresh installation', async () => {
    const { user, backup } = await fixture();
    for (const table of db.tables) await table.clear();
    await restoreBackup(backup);
    expect((await db.users.get(user.id))?.name).toBe('小明');
    expect((await db.userProgress.get(user.id))?.magicPower).toBe(37);
    const map = await getUserMapNodes(user.id);
    expect(map.find(node => node.storyId === 'l1_001')?.completed).toBe(true);
    expect(map.find(node => node.storyId === 'l1_002')?.unlocked).toBe(true);
    expect(await db.userVocabulary.count()).toBe(1);
    expect((await db.achievements.toArray())[0].claimed).toBe(true);
    expect((await db.quizDrafts.toArray())[0].hintsUsed).toBe(1);
    expect(await db.stories.count()).toBe(90);
    expect(await db.mapNodes.count()).toBe(90);
    expect(await db.dictionary.count()).toBeGreaterThan(700);
    expect(() => parseBackup(JSON.stringify(backup))).not.toThrow();
  });
  it('rejects malformed, duplicate, orphaned or unknown-course records before changing the DB', async () => {
    const { backup, user } = await fixture();
    for (const mutate of [
      (x: typeof backup) => {
        x.version = 99 as 1;
      },
      (x: typeof backup) => {
        x.users.push(x.users[0]);
      },
      (x: typeof backup) => {
        x.userProgress[0].magicPower = -1;
      },
      (x: typeof backup) => {
        x.userVocabulary[0].userId = 'unknown';
      },
      (x: typeof backup) => {
        x.quizDrafts[0].storyId = 'future_story';
      },
      (x: typeof backup) => {
        x.quizDrafts[0].id = 'wrong';
      },
      (x: typeof backup) => {
        x.userProgress[0].completedNodes = ['injected-node'];
      },
      (x: typeof backup) => {
        delete x.userProgress[0].completedNodes;
      },
    ]) {
      const copy = JSON.parse(JSON.stringify(backup)) as typeof backup;
      mutate(copy);
      await expect(restoreBackup(copy)).rejects.toThrow();
      expect((await db.userProgress.get(user.id))?.magicPower).toBe(37);
    }
  });
  it('rolls back every replacement when a write fails after tables have been cleared', async () => {
    const { backup, user } = await fixture();
    await db.userProgress.update(user.id, { magicPower: 999 });
    await db.learningMeta.put({ key: 'restoreRevision', value: 'before-failed-restore' });
    vi.spyOn(db.quizHistory, 'bulkPut').mockRejectedValueOnce(new Error('disk full'));
    await expect(restoreBackup(backup)).rejects.toThrow('disk full');
    expect((await db.userProgress.get(user.id))?.magicPower).toBe(999);
    expect(await db.userVocabulary.count()).toBe(1);
    expect(await db.quizDrafts.count()).toBe(1);
    expect((await db.learningMeta.get('restoreRevision'))?.value).toBe('before-failed-restore');
  });
  it('rotates the restore revision only after a successful replacement', async () => {
    const { backup } = await fixture();
    await db.learningMeta.put({ key: 'restoreRevision', value: 'before-successful-restore' });

    await restoreBackup(backup);

    const revision = (await db.learningMeta.get('restoreRevision'))?.value;
    expect(revision).toBeTruthy();
    expect(revision).not.toBe('before-successful-restore');
  });
  it('maps legacy node IDs to current story IDs and discards injected fields', async () => {
    const { backup, user } = await fixture();
    const first = backup.mapStates.find(state => state.storyId === 'l1_001')!;
    first.id = 'node_l1_001';
    backup.userProgress[0].currentMapNode = first.id;
    const malicious = { ...backup, mapNodes: [{ id: 'extra', unlocked: true }] };
    const decoded = parseBackup(JSON.stringify(malicious));
    expect(decoded).not.toHaveProperty('mapNodes');
    await restoreBackup(decoded);
    const node = await db.mapNodes.where('storyId').equals('l1_001').first();
    expect((await db.userProgress.get(user.id))?.currentMapNode).toBe(node?.id);
    expect((await getUserMapNodes(user.id)).find(item => item.id === node?.id)?.completed).toBe(true);
    expect(await db.mapNodes.get('extra')).toBeUndefined();
  });
  it('preserves each profile unlocked-node list while remapping legacy map IDs', async () => {
    const { user: firstUser } = await fixture();
    const secondUser = await createUser('小红', '星星');
    const backup = parseBackup(await exportBackup(firstUser.id, createDefaultSettings()));
    const firstStory = backup.mapStates.find(state => state.storyId === 'l1_001')!;
    const secondStory = backup.mapStates.find(state => state.storyId === 'l1_002')!;
    firstStory.id = 'legacy-first-story';
    secondStory.id = 'legacy-second-story';
    const firstProgress = backup.userProgress.find(progress => progress.id === firstUser.id)!;
    const secondProgress = backup.userProgress.find(progress => progress.id === secondUser.id)!;
    firstProgress.currentMapNode = firstStory.id;
    firstProgress.unlockedNodes = [firstStory.id];
    secondProgress.currentMapNode = secondStory.id;
    secondProgress.unlockedNodes = [firstStory.id, secondStory.id];

    await restoreBackup(backup);

    const currentFirst = await db.mapNodes.where('storyId').equals('l1_001').first();
    const currentSecond = await db.mapNodes.where('storyId').equals('l1_002').first();
    expect((await db.userProgress.get(firstUser.id))?.unlockedNodes).toEqual([currentFirst!.id, currentSecond!.id]);
    expect((await db.userProgress.get(secondUser.id))?.unlockedNodes).toEqual([
      currentFirst!.id,
      currentSecond!.id,
    ]);
    expect((await db.userProgress.get(firstUser.id))?.currentMapNode).toBe(currentFirst!.id);
    expect((await db.userProgress.get(secondUser.id))?.currentMapNode).toBe(currentSecond!.id);
    expect((await db.userProgress.get(secondUser.id))?.completedNodes).toEqual([]);
  });
  it('round-trips multiple profiles without giving a fresh profile another profile\'s progress', async () => {
    const { user: firstUser } = await fixture();
    const secondUser = await createUser('小红', '星星');
    const backup = parseBackup(await exportBackup(firstUser.id, createDefaultSettings()));
    expect(backup.version).toBe(2);
    for (const table of db.tables) await table.clear();
    await restoreBackup(backup);
    expect((await getUserMapNodes(firstUser.id)).find(node => node.storyId === 'l1_001')?.completed).toBe(true);
    const secondMap = await getUserMapNodes(secondUser.id);
    expect(secondMap.filter(node => node.completed)).toHaveLength(0);
    expect(secondMap.find(node => node.storyId === 'l1_002')?.unlocked).toBe(false);
    expect((await db.learningMeta.get('activeProfileId'))?.value).toBe(firstUser.id);
    expect((await db.mapNodes.toArray()).some(node => node.completed || node.unlocked)).toBe(false);
  });
  it('imports a version 1 shared map only into the selected legacy profile', async () => {
    const { user: firstUser } = await fixture();
    const secondUser = await createUser('小红', '星星');
    const legacy = parseBackup(await exportBackup(firstUser.id, createDefaultSettings()));
    legacy.version = 1;
    for (const progress of legacy.userProgress) delete progress.completedNodes;
    // Version 1 has no per-user completion field; extra fields cannot assign
    // the old shared map to another profile.
    legacy.userProgress.find(progress => progress.id === secondUser.id)!.completedNodes = legacy.mapStates.filter(node => node.completed).map(node => node.id);
    await restoreBackup(legacy);
    expect((await getUserMapNodes(firstUser.id)).find(node => node.storyId === 'l1_001')?.completed).toBe(true);
    expect((await getUserMapNodes(secondUser.id)).filter(node => node.completed)).toHaveLength(0);
    expect((await getUserMapNodes(secondUser.id)).find(node => node.storyId === 'l1_002')?.unlocked).toBe(false);
  });
  it('excludes large temporary shadowing recordings while retaining their metadata', async () => {
    const { user } = await fixture();
    await db.readingHistory.put({
      id: 'large-recording',
      userId: user.id,
      storyId: 'l1_001',
      startTime: 1,
      endTime: 2,
      duration: 1,
      progress: 100,
      wordsLookedUp: [],
      completed: true,
      shadowingRecords: [
        {
          paragraphId: 'p1',
          timestamp: 1,
          audioBlob: new Blob([new Uint8Array(21 * 1024 * 1024)], { type: 'audio/webm' }),
        },
      ],
    });

    const backup = parseBackup(await exportBackup(user.id, createDefaultSettings()));
    const exportedReading = backup.readingHistory.find(reading => reading.id === 'large-recording')!;

    expect(exportedReading.shadowingRecords).toEqual([{ paragraphId: 'p1', timestamp: 1 }]);
  });
});

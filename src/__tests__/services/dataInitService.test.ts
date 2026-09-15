import { beforeEach, describe, expect, it } from 'vitest';
import { createUser, db } from '@/db';
import { allStories } from '@/data';
import { generateUnifiedMapData } from '@/data/unifiedMap';
import { initMapData, initStories } from '@/services/dataInitService';
import { getUserMapNodes } from '@/services/mapProgressService';

describe('Existing learning content compatibility', () => {
  beforeEach(async () => {
    await db.mapNodes.clear();
    await db.mapRegions.clear();
    await db.stories.clear();
    await db.users.clear();
    await db.userProgress.clear();
    await db.quizHistory.clear();
    await db.learningMeta.clear();
    localStorage.removeItem('magic-english-storage');
  });
  it('fills missing stories without resetting existing content', async () => {
    await db.stories.put({ ...allStories[0]!, title: 'Existing title' });
    await initStories();
    expect(await db.stories.count()).toBe(allStories.length);
    expect((await db.stories.get(allStories[0]!.id))?.title).toBe('Existing title');
  });
  it('moves old node completion to the selected profile while keeping map nodes structural', async () => {
    const legacyUser = await createUser('旧档案', '伙伴');
    await db.userProgress.update(legacyUser.id, { completedNodes: undefined });
    localStorage.setItem(
      'magic-english-storage',
      JSON.stringify({ state: { currentUserId: legacyUser.id } })
    );
    await db.mapNodes.put({
      id: 'node_l1_001',
      storyId: 'l1_001',
      regionId: 'region_l1',
      type: 'story',
      position: { x: 0, y: 0 },
      prerequisites: [],
      rewards: { magicPower: 10 },
      unlocked: true,
      completed: true,
    });
    await initMapData();
    const saved = await db.mapNodes.toArray();
    const first = saved.find(node => node.storyId === 'l1_001')!;
    const second = saved.find(node => node.storyId === 'l1_002')!;
    expect(first.id).toBe('node_l1_001');
    expect(first.completed).toBe(false);
    expect(second.prerequisites).toContain(first.id);
    expect(second.unlocked).toBe(false);
    const displayed = await getUserMapNodes(legacyUser.id);
    expect(displayed.find(node => node.id === first.id)).toMatchObject({ completed: true });
    await initMapData();
    expect(await db.mapNodes.count()).toBe(saved.length);
    expect((await db.mapNodes.get(first.id))?.completed).toBe(false);
  });
  it('preserves completed legacy boss progress and rewards while adding its real boss lesson', async () => {
    const legacyUser = await createUser('旧档案', '伙伴');
    await db.userProgress.update(legacyUser.id, { completedNodes: undefined });
    localStorage.setItem(
      'magic-english-storage',
      JSON.stringify({ state: { currentUserId: legacyUser.id } })
    );
    const legacyBossReward = {
      magicPower: 50,
      cards: ['princess', 'moon', 'night'],
      buddyAccessory: 'valley_crown',
    };
    await db.mapNodes.bulkPut([
      {
        // Old maps used this boss-shaped node for the numbered Moon Princess
        // story. Its ID and reward record must survive the course expansion.
        id: 'node_l2_boss',
        storyId: 'l2_010',
        regionId: 'region_l2',
        type: 'boss',
        position: { x: 0, y: 0 },
        prerequisites: ['node_l2_010'],
        rewards: legacyBossReward,
        unlocked: true,
        completed: true,
      },
      {
        id: 'node_l3_01',
        storyId: 'l3_001',
        regionId: 'region_l3',
        type: 'story',
        position: { x: 0, y: 0 },
        prerequisites: ['node_l2_boss'],
        rewards: { magicPower: 20 },
        unlocked: true,
        completed: false,
      },
    ]);

    await initMapData();

    const saved = await db.mapNodes.toArray();
    const legacyMoonPrincess = saved.find(node => node.storyId === 'l2_010')!;
    const newEchoSpirit = saved.find(node => node.storyId === 'l2_boss')!;
    const unlockedOceanStart = saved.find(node => node.storyId === 'l3_001')!;

    expect(legacyMoonPrincess.id).toBe('node_l2_boss');
    expect(legacyMoonPrincess.completed).toBe(false);
    expect(legacyMoonPrincess.unlocked).toBe(false);
    expect(legacyMoonPrincess.rewards).toEqual(legacyBossReward);
    expect(newEchoSpirit.id).not.toBe(legacyMoonPrincess.id);
    expect(newEchoSpirit.type).toBe('boss');
    expect(newEchoSpirit.completed).toBe(false);
    expect(unlockedOceanStart.unlocked).toBe(false);
    const personalNodes = await getUserMapNodes(legacyUser.id);
    expect(personalNodes.find(node => node.id === legacyMoonPrincess.id)).toMatchObject({
      completed: true,
    });
    expect(personalNodes.find(node => node.id === unlockedOceanStart.id)).toMatchObject({
      unlocked: true,
    });
  });
  it('provides a persisted node for every visible lesson and prerequisite', async () => {
    await initMapData();
    const saved = await db.mapNodes.toArray();
    expect(
      saved
        .filter(node => !allStories.some(story => story.id === node.storyId))
        .map(node => ({ id: node.id, story: node.storyId }))
    ).toEqual([]);
    for (const node of saved) {
      for (const prerequisite of node.prerequisites) {
        expect(
          saved.some(candidate => candidate.id === prerequisite),
          `${node.id}: ${prerequisite}`
        ).toBe(true);
      }
    }
  });
});

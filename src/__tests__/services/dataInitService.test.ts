import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db';
import { allStories } from '@/data';
import { generateUnifiedMapData, mergeNodeStates } from '@/data/unifiedMap';
import { initMapData, initStories } from '@/services/dataInitService';

describe('Existing learning content compatibility', () => {
  beforeEach(async () => {
    await db.mapNodes.clear();
    await db.mapRegions.clear();
    await db.stories.clear();
  });
  it('fills missing stories without resetting existing content', async () => {
    await db.stories.put({ ...allStories[0]!, title: 'Existing title' });
    await initStories();
    expect(await db.stories.count()).toBe(allStories.length);
    expect((await db.stories.get(allStories[0]!.id))?.title).toBe('Existing title');
  });
  it('preserves old node IDs and completion while connecting the visible map', async () => {
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
    expect(first.completed).toBe(true);
    expect(second.prerequisites).toContain(first.id);
    expect(second.unlocked).toBe(true);
    const displayed = mergeNodeStates(generateUnifiedMapData().nodes, saved);
    expect(displayed[0]?.completed).toBe(true);
    expect(displayed[0]?.id).toBe(first.id);
    await initMapData();
    expect(await db.mapNodes.count()).toBe(saved.length);
    expect((await db.mapNodes.get(first.id))?.completed).toBe(true);
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

import { describe, expect, it } from 'vitest';
import { allStories } from '@/data';
import { generateUnifiedMapData } from '@/data/unifiedMap';

describe('bundled course integrity', () => {
  it('maps all 90 bundled stories into one reachable, ordered course', () => {
    const { nodes, sections, totalNodes } = generateUnifiedMapData();
    const ids = new Set(nodes.map(node => node.id));
    const storyIds = new Set(nodes.map(node => node.storyId));
    const indexById = new Map(nodes.map((node, index) => [node.id, index]));

    expect(totalNodes).toBe(90);
    expect(nodes).toHaveLength(allStories.length);
    expect(storyIds).toEqual(new Set(allStories.map(story => story.id)));
    expect(ids.size).toBe(nodes.length);
    expect(sections.reduce((total, section) => total + section.nodeCount, 0)).toBe(totalNodes);

    for (const [index, node] of nodes.entries()) {
      for (const prerequisite of node.prerequisites) {
        const prerequisiteIndex = indexById.get(prerequisite);
        expect(prerequisiteIndex, `${node.id}: ${prerequisite}`).toBeTypeOf('number');
        expect(prerequisiteIndex!, `${node.id}: ${prerequisite}`).toBeLessThan(index);
      }
    }
  });

  it('keeps source-map bonus and challenge slots while inserting missing stories before bosses', () => {
    const nodes = generateUnifiedMapData().nodes;
    const storyIdsForLevel = (level: number) =>
      nodes.filter(node => node.level === level).map(node => node.storyId);

    expect(storyIdsForLevel(2)).toEqual([
      'l2_001',
      'l2_002',
      'l2_003',
      'l2_004',
      'l2_005',
      'l2_006',
      'l2_007',
      'l2_008',
      'l2_009',
      'l2_010',
      'l2_boss',
    ]);
    expect(storyIdsForLevel(4)).toEqual([
      'l4_001',
      'l4_002',
      'l4_003',
      'l4_004',
      'l4_b01',
      'l4_005',
      'l4_006',
      'l4_007',
      'l4_008',
      'l4_c01',
      'l4_009',
      'l4_010',
      'l4_boss',
    ]);
  });

  it('every visible lesson has content and answerable questions', () => {
    for (const node of generateUnifiedMapData().nodes) {
      const story = allStories.find(item => item.id === node.storyId);
      expect(story, node.id).toBeDefined();
      expect(story!.content.length, node.id).toBeGreaterThan(0);
      expect(story!.quiz.length, node.id).toBeGreaterThan(0);
      for (const question of story!.quiz) {
        const label = `${story!.id}/${question.id}`;
        expect(['image_choice', 'word_builder', 'sentence_order', 'fill_blank'], label).toContain(
          question.type
        );
        if (question.type === 'word_builder') {
          expect([...question.shuffledWords!].sort(), label).toEqual(
            [...question.correctAnswer!].sort()
          );
        } else if (question.type === 'sentence_order') {
          expect([...question.shuffledWords!].sort(), label).toEqual(
            [...question.correctOrder!].sort()
          );
        } else {
          expect(
            question.options?.map(option => option.value),
            label
          ).toContain(question.correctAnswer);
        }
      }
    }
  });
});

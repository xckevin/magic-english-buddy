import { describe, expect, it } from 'vitest';
import { allStories } from '@/data';
import { generateUnifiedMapData } from '@/data/unifiedMap';

describe('bundled course integrity', () => {
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

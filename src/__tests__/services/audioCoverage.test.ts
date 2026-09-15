import { describe, expect, it } from 'vitest';
import { allStories, allDictionary } from '@/data';
import { getBundledSpeech } from '@/services/bundledAudioService';
import { audioFiles, audioPacks } from '@/services/audioCatalog';

describe('pre-generated audio coverage', () => {
  it('resolves every story, paragraph, clickable word and listening question through the real player lookup', () => {
    expect(allStories).toHaveLength(90);
    for (const story of allStories) {
      const clips = getBundledSpeech(story.content.map(paragraph => paragraph.text).join(' '));
      expect(clips, story.id).toHaveLength(story.content.length);
      for (const paragraph of story.content) {
        const timedWords = getBundledSpeech(paragraph.text)![0].words;
        expect(timedWords, paragraph.text).toHaveLength(paragraph.words.length);
        paragraph.words.forEach((word, index) => {
          const pronunciation = getBundledSpeech(word.word);
          expect(pronunciation, `${story.id}: ${word.word}`).not.toBeNull();
          // Ignore outer punctuation differences, but require the same word in
          // the same position. Equal counts alone do not guarantee alignment.
          expect(getBundledSpeech(timedWords[index].word)?.[0].file, `${story.id}: word ${index}`)
            .toBe(pronunciation![0].file);
        });
      }
      for (const question of story.quiz.filter(question => question.type === 'image_choice')) {
        expect(getBundledSpeech(question.question), question.question).not.toBeNull();
      }
    }
  });

  it('resolves every dictionary pronunciation and includes every clip in a downloadable package', () => {
    for (const entry of allDictionary)
      expect(getBundledSpeech(entry.word), entry.word).not.toBeNull();
    expect(audioPacks.map(pack => pack.id)).toEqual([
      'l1',
      'l2',
      'l3',
      'l4',
      'l5',
      'l6',
      'l7',
      'dictionary',
    ]);
    const packaged = new Set(audioPacks.flatMap(pack => pack.files));
    expect(packaged).toEqual(new Set(audioFiles.map(file => file.file)));
    for (const file of audioFiles) {
      expect(file.bytes).toBeGreaterThan(0);
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });
});

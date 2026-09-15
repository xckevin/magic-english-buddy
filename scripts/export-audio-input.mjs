import { createServer } from 'vite';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const selectedLevel = process.argv[2] === undefined ? undefined : Number(process.argv[2]);
if (selectedLevel !== undefined && (!Number.isInteger(selectedLevel) || selectedLevel < 1 || selectedLevel > 7)) {
  throw new Error('Expected an optional level 1–7');
}
const isEnglishPrompt = text => /^[\x20-\x7E]+$/.test(text);
const normalizeWord = word => {
  const normalized = word.normalize('NFKC').replace(/^[^\p{L}\p{N}'’-]+|[^\p{L}\p{N}'’-]+$/gu, '').toLowerCase();
  return normalized === 'i' ? 'I' : normalized;
};

const server = await createServer({
  configFile: false,
  cacheDir: 'test-results/vite-audio-cache',
  resolve: { alias: { '@': path.resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
});
try {
  const { allStories, allDictionary, getDictionary } = await server.ssrLoadModule('/src/data/index.ts');
  const stories = allStories
    .filter(story => selectedLevel === undefined || story.level === selectedLevel)
    .map(story => {
      const prompts = story.quiz.filter(question => question.type === 'image_choice').map(question => question.question);
      return {
        id: story.id,
        level: story.level,
        paragraphs: story.content.map(paragraph => ({ text: paragraph.text, words: paragraph.words.map(word => word.word) })),
        listeningQuestions: prompts.filter(isEnglishPrompt),
        skippedListeningQuestions: prompts.filter(question => !isEnglishPrompt(question)),
        // Retained solely to assign pre-existing L1 non-listening English clips
        // to their real source pack; these are not newly synthesized.
        allEnglishQuizQuestions: story.quiz.map(question => question.question).filter(isEnglishPrompt),
      };
    });
  const dictionary = selectedLevel === undefined ? allDictionary : getDictionary(selectedLevel);
  for (const story of stories) {
    for (const paragraph of story.paragraphs) {
      assert.deepEqual(
        paragraph.words.map(normalizeWord),
        paragraph.text.trim().split(/\s+/).map(normalizeWord),
        `Reader/audio word sequence mismatch in ${story.id}: ${paragraph.text}`
      );
    }
  }
  const dictionaryWords = [...new Set(dictionary.map(entry => normalizeWord(entry.word)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'en'));
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/audio-input.json', JSON.stringify({
    levels: selectedLevel === undefined ? [1, 2, 3, 4, 5, 6, 7] : [selectedLevel], stories, dictionaryWords,
  }, null, 2) + '\n');
  const skippedListeningQuestions = stories.flatMap(story => story.skippedListeningQuestions.map(question => ({ id: story.id, question })));
  console.log(JSON.stringify({
    levels: selectedLevel === undefined ? 'all' : [selectedLevel], stories: stories.length,
    listeningQuestions: stories.reduce((sum, story) => sum + story.listeningQuestions.length, 0),
    skippedListeningQuestions, dictionaryWords: dictionaryWords.length,
  }));
} finally {
  await server.close();
}

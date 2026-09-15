import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const level = Number(process.argv[2] ?? 1);
if (!Number.isInteger(level) || level < 1 || level > 7) throw new Error('Expected level 1–7');
const server = await createServer({
  configFile: false,
  cacheDir: 'test-results/vite-audio-cache',
  resolve: { alias: { '@': path.resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
});
try {
  const { allStories } = await server.ssrLoadModule('/src/data/index.ts');
  const input = allStories
    .filter(s => s.level === level)
    .map(s => ({
      id: s.id,
      paragraphs: s.content.map(p => ({ text: p.text, words: p.words.map(w => w.word) })),
      questions: s.quiz.map(q => q.question).filter(q => /^[\x20-\x7E]+$/.test(q)),
    }));
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/audio-input.json', JSON.stringify(input, null, 2) + '\n');
  console.log(`Exported ${input.length} L${level} stories to test-results/audio-input.json`);
} finally {
  await server.close();
}

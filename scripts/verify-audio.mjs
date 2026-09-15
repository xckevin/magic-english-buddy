import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioDirectory = path.join(root, 'public/audio');
const manifest = JSON.parse(await readFile(path.join(root, 'src/data/audio/manifest.json'), 'utf8'));
const hashFile = async file => createHash('sha256').update(await readFile(file)).digest('hex');

assert.ok(Array.isArray(manifest.packs), 'Missing complete pack list');
assert.equal(manifest.packs.length, 8, 'Expected L1–L7 and dictionary packs');
const files = new Set();
let bytes = 0;
for (const [text, clip] of Object.entries(manifest.clips)) {
  assert.match(clip.file, /^[a-f0-9]{20}\.mp3$/);
  assert.equal(typeof clip.bytes, 'number', `${text}: missing byte size`);
  assert.match(clip.sha256, /^[a-f0-9]{64}$/, `${text}: missing SHA-256`);
  const file = path.join(audioDirectory, clip.file);
  const fileStat = await stat(file);
  assert.equal(fileStat.size, clip.bytes, `${text}: byte size mismatch`);
  assert.equal(await hashFile(file), clip.sha256, `${text}: SHA-256 mismatch`);
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' }).trim());
  assert.ok(Number.isFinite(duration) && duration > 0, `${text}: invalid MP3`);
  execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', file, '-f', 'null', '-']);
  assert.ok(Math.abs(duration - clip.duration) < 0.2, `${text}: duration mismatch`);
  const words = text.trim().split(/\s+/);
  assert.equal(clip.words.length, words.length, `${text}: word count mismatch`);
  assert.ok(Number.isFinite(clip.duration) && clip.duration > 0, `${text}: invalid source duration`);
  let previousEnd = 0;
  clip.words.forEach((word, index) => {
    assert.equal(word.index, index);
    assert.equal(word.word, words[index]);
    assert.ok(
      Number.isFinite(word.start) && Number.isFinite(word.end) &&
      word.start >= previousEnd && word.end > word.start && word.end <= clip.duration,
      `${text}: invalid timestamp for ${word.word}`
    );
    previousEnd = word.end;
  });
  if (!files.has(clip.file)) bytes += fileStat.size;
  files.add(clip.file);
}
for (const [text, paragraphs] of Object.entries(manifest.stories)) {
  assert.equal(paragraphs.join(' '), text);
  paragraphs.forEach(paragraph => assert.ok(manifest.clips[paragraph], `Missing paragraph: ${paragraph}`));
}
const packIds = new Set();
const packedFiles = new Set();
for (const pack of manifest.packs) {
  assert.ok(!packIds.has(pack.id), `Duplicate pack: ${pack.id}`);
  packIds.add(pack.id);
  assert.ok(Array.isArray(pack.files) && pack.files.length, `${pack.id}: no files`);
  assert.equal(new Set(pack.files).size, pack.files.length, `${pack.id}: duplicate file`);
  const packStats = await Promise.all(pack.files.map(file => stat(path.join(audioDirectory, file))));
  assert.equal(pack.bytes, packStats.reduce((total, file) => total + file.size, 0), `${pack.id}: byte size mismatch`);
  pack.files.forEach(file => {
    assert.ok(files.has(file), `${pack.id}: unreferenced file ${file}`);
    packedFiles.add(file);
  });
}
assert.deepEqual(packIds, new Set(['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'dictionary']));
assert.deepEqual(packedFiles, files, 'A manifest clip is outside every download pack');
assert.deepEqual(new Set((await readdir(audioDirectory)).filter(file => file.endsWith('.mp3'))), files, 'Unreferenced or missing MP3 files');

const server = await createServer({
  configFile: false, cacheDir: path.join(root, 'test-results/vite-audio-cache'),
  resolve: { alias: { '@': path.join(root, 'src') } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true },
});
try {
  const { allStories, allDictionary } = await server.ssrLoadModule('/src/data/index.ts');
  const normalizeWord = word => {
    const normalized = word.normalize('NFKC').replace(/^[^\p{L}\p{N}'’-]+|[^\p{L}\p{N}'’-]+$/gu, '').toLowerCase();
    return normalized === 'i' ? 'I' : normalized;
  };
  let imageQuestions = 0;
  for (const story of allStories) {
    const storyText = story.content.map(paragraph => paragraph.text).join(' ');
    assert.ok(manifest.stories[storyText], `Missing story: ${story.id}`);
    story.content.forEach(paragraph => {
      assert.ok(manifest.clips[paragraph.text], `Missing course paragraph: ${story.id}`);
      assert.deepEqual(
        paragraph.words.map(word => normalizeWord(word.word)),
        manifest.clips[paragraph.text].words.map(word => normalizeWord(word.word)),
        `Reader/audio word sequence mismatch: ${story.id}: ${paragraph.text}`
      );
      paragraph.words.forEach(word => assert.ok(manifest.clips[normalizeWord(word.word)], `Missing course word: ${word.word}`));
    });
    story.quiz.filter(question => question.type === 'image_choice').forEach(question => {
      assert.match(question.question, /^[\x20-\x7E]+$/, `Non-English listening prompt: ${story.id}`);
      assert.ok(manifest.clips[question.question], `Missing listening question: ${question.question}`);
      imageQuestions += 1;
    });
  }
  allDictionary.forEach(entry => assert.ok(manifest.clips[normalizeWord(entry.word)], `Missing dictionary word: ${entry.word}`));
  console.log(JSON.stringify({ clips: Object.keys(manifest.clips).length, stories: Object.keys(manifest.stories).length, bytes, imageQuestions, packs: manifest.packs.map(pack => ({ id: pack.id, files: pack.files.length, bytes: pack.bytes })), errors: [] }));
} finally {
  await server.close();
}

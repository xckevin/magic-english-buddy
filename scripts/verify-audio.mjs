import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run after generation. ffprobe checks the encoded audio, not just its filename.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  await readFile(path.join(root, 'src/data/audio/manifest.json'), 'utf8')
);
const files = new Set();
let bytes = 0;
for (const [text, clip] of Object.entries(manifest.clips)) {
  assert.match(clip.file, /^[a-f0-9]{20}\.mp3$/);
  const file = path.join(root, 'public/audio', clip.file);
  const duration = Number(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
      { encoding: 'utf8' }
    ).trim()
  );
  assert.ok(Number.isFinite(duration) && duration > 0, `${text}: invalid MP3`);
  execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', file, '-f', 'null', '-']);
  assert.ok(Math.abs(duration - clip.duration) < 0.2, `${text}: duration mismatch`);
  const words = text.trim().split(/\s+/);
  assert.equal(clip.words.length, words.length, `${text}: word count mismatch`);
  let previousStart = 0;
  clip.words.forEach((word, index) => {
    assert.equal(word.index, index);
    assert.equal(word.word, words[index]);
    assert.ok(
      word.start >= previousStart && word.end >= word.start && word.end <= duration,
      `${text}: invalid timestamp for ${word.word}`
    );
    previousStart = word.start;
  });
  if (!files.has(clip.file)) bytes += (await stat(file)).size;
  files.add(clip.file);
}
for (const [text, paragraphs] of Object.entries(manifest.stories)) {
  assert.equal(paragraphs.join(' '), text);
  paragraphs.forEach(paragraph =>
    assert.ok(manifest.clips[paragraph], `Missing paragraph: ${paragraph}`)
  );
}
const diskFiles = (await readdir(path.join(root, 'public/audio'))).filter(file =>
  file.endsWith('.mp3')
);
assert.deepEqual(new Set(diskFiles), files, 'Unreferenced or missing MP3 files');
console.log(
  JSON.stringify({
    clips: Object.keys(manifest.clips).length,
    stories: Object.keys(manifest.stories).length,
    bytes,
    errors: [],
  })
);

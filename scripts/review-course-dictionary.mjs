#!/usr/bin/env node

/**
 * Review the course words that are not currently covered by the bundled
 * dictionary against a local copy of ECDICT.  The source file is deliberately
 * kept outside the repository; see docs/course-dictionary-sources.md.
 *
 * Usage: node scripts/review-course-dictionary.mjs /path/to/ecdict.csv
 */

import fs from 'node:fs';
import { createServer } from 'vite';

const csvPath = process.argv[2];
if (!csvPath) throw new Error('Pass the path to ecdict.csv.');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += char;
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) rows.push([...row, field]);
  return rows;
}

const csvRows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const source = new Map(csvRows.slice(1).map(row => [row[0]?.toLocaleLowerCase('en-US'), {
  phonetic: row[1], definition: row[2], translation: row[3], pos: row[4], exchange: row[10],
}]));

const server = await createServer({
  configFile: new URL('../vite.config.ts', import.meta.url).pathname,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { allStories, allDictionary } = await server.ssrLoadModule('/src/data/index.ts');
  const { getDictionaryLookupForms, normalizeDictionaryWord } = await server.ssrLoadModule(
    '/src/data/dictionary/wordForms.ts'
  );
  const dictionary = new Set(allDictionary.map(({ word }) => normalizeDictionaryWord(word)));
  const missing = new Map();
  for (const story of allStories) {
    for (const paragraph of story.content) {
      for (const { word } of paragraph.words) {
        const normalized = normalizeDictionaryWord(word);
        if (!normalized || getDictionaryLookupForms(normalized).some(form => dictionary.has(form))) continue;
        const row = missing.get(normalized) ?? { word: normalized, level: story.level, examples: [] };
        row.level = Math.min(row.level, story.level);
        if (!row.examples.includes(paragraph.text)) row.examples.push(paragraph.text);
        missing.set(normalized, row);
      }
    }
  }
  const output = [...missing.values()]
    .sort((left, right) => left.word.localeCompare(right.word))
    .map(row => ({ ...row, source: source.get(row.word) ?? null }));
  process.stdout.write(JSON.stringify(output, null, 2));
} finally {
  await server.close();
}

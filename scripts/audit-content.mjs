#!/usr/bin/env node

import { createServer } from 'vite';

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
  const rows = new Map();
  const textRows = new Map();

  for (const story of allStories) {
    for (const paragraph of story.content) {
      for (const { word } of paragraph.words) {
        const normalized = normalizeDictionaryWord(word);
        if (!normalized) continue;
        const row = rows.get(normalized) ?? { count: 0, stories: new Set(), raw: new Set() };
        row.count += 1;
        row.stories.add(story.id);
        row.raw.add(word);
        rows.set(normalized, row);
      }
      for (const rawWord of paragraph.text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? []) {
        const normalized = normalizeDictionaryWord(rawWord);
        if (!normalized) continue;
        textRows.set(normalized, (textRows.get(normalized) ?? 0) + 1);
      }
    }
  }

  const missing = [];
  let directTokens = 0;
  let inflectedTokens = 0;
  for (const [word, row] of rows) {
    const forms = getDictionaryLookupForms(word);
    const match = forms.find(form => dictionary.has(form));
    if (match === word) directTokens += row.count;
    else if (match) inflectedTokens += row.count;
    else missing.push({ word, ...row });
  }

  const tokenCount = [...rows.values()].reduce((total, row) => total + row.count, 0);
  const textTokenCount = [...textRows.values()].reduce((total, count) => total + count, 0);
  const coveredTokens = directTokens + inflectedTokens;
  const coveredTextTokens = [...textRows].reduce(
    (total, [word, count]) =>
      total + (getDictionaryLookupForms(word).some(form => dictionary.has(form)) ? count : 0),
    0
  );
  const byLevel = Object.fromEntries(
    [...new Set(allStories.map(({ level }) => level))].map(level => {
      const levelWords = new Map();
      for (const story of allStories.filter(item => item.level === level)) {
        for (const paragraph of story.content) {
          for (const { word } of paragraph.words) {
            const normalized = normalizeDictionaryWord(word);
            if (normalized) levelWords.set(normalized, (levelWords.get(normalized) ?? 0) + 1);
          }
        }
      }
      const total = [...levelWords.values()].reduce((sum, count) => sum + count, 0);
      const covered = [...levelWords].reduce(
        (sum, [word, count]) =>
          sum + (getDictionaryLookupForms(word).some(form => dictionary.has(form)) ? count : 0),
        0
      );
      return [
        level,
        {
          tokens: total,
          coveredTokens: covered,
          coverage: Number(((covered / total) * 100).toFixed(2)),
        },
      ];
    })
  );

  const report = {
    stories: allStories.length,
    dictionaryEntries: allDictionary.length,
    // Reader interaction uses `content[].words`; prose is measured separately
    // to reveal any authoring mismatch between the displayed text and tokens.
    storyTokens: tokenCount,
    textTokens: textTokenCount,
    uniqueStoryWords: rows.size,
    directTokens,
    inflectedTokens,
    coveredTokens,
    tokenCoverage: Number(((coveredTokens / tokenCount) * 100).toFixed(2)),
    textTokenCoverage: Number(((coveredTextTokens / textTokenCount) * 100).toFixed(2)),
    uniqueCoverage: Number((((rows.size - missing.length) / rows.size) * 100).toFixed(2)),
    textOnlyWords: [...textRows]
      .filter(([word]) => !rows.has(word))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([word, count]) => ({ word, count })),
    byLevel,
    missing: missing
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .map(({ word, count, stories, raw }) => ({
        word,
        count,
        stories: [...stories],
        raw: [...raw],
      })),
  };
  console.log(JSON.stringify(report, null, 2));
} finally {
  await server.close();
}

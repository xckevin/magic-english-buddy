#!/usr/bin/env node

/**
 * Freeze the reviewed ECDICT seed entries used by the course supplement.
 *
 * This script is intentionally not part of the application build. It is a
 * repeatable data-maintenance tool; its one input is an ECDICT CSV checkout at
 * the revision recorded in docs/course-dictionary-sources.md.
 *
 * Usage: node scripts/build-course-dictionary.mjs /path/to/ecdict.csv
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

const overrides = {
  '1000': ['一千', 'the number one thousand', 'number', 'θaʊzənd'],
  '2150': ['2150年', 'the year two thousand one hundred and fifty', 'number', 'tuː ˈθaʊzənd wʌn ˈhʌndrəd ænd ˈfɪfti'],
  alex: ['亚历克斯（故事人物名）', 'Alex, a character in the story', 'proper n.', 'ˈælɪks'],
  alexander: ['亚历山大（故事中的国王）', 'Alexander, the king in this story', 'proper n.', 'ˌælɪɡˈzændər'],
  atlanteans: ['亚特兰蒂斯人（传说中的居民）', 'the legendary people of Atlantis', 'proper n.', 'ætˈlæn tiənz'],
  atlantis: ['亚特兰蒂斯（传说中的失落城市）', 'a legendary lost city', 'proper n.', 'ætˈlæntɪs'],
  'b-a-l-l': ['B-A-L-L（ball的拼写）', 'the letters used to spell ball', 'spelling', 'biː eɪ ɛl ɛl'],
  'c-a-t': ['C-A-T（cat的拼写）', 'the letters used to spell cat', 'spelling', 'siː eɪ tiː'],
  "chang'e": ['嫦娥（中国月亮传说中的女神）', 'Chang’e, the moon goddess in Chinese legend', 'proper n.', 'tʃɑːŋ ə'],
  chen: ['陈（故事人物的姓）', 'Chen, a character’s family name', 'proper n.', 'tʃɛn'],
  'd-o-g': ['D-O-G（dog的拼写）', 'the letters used to spell dog', 'spelling', 'diː oʊ dʒiː'],
  danny: ['丹尼（故事中的海豚名）', 'Danny, the dolphin in this story', 'proper n.', 'ˈdæni'],
  edison: ['爱迪生（发明家托马斯·爱迪生）', 'Thomas Edison, an inventor', 'proper n.', 'ˈɛdɪsən'],
  genesis: ['创世；起源', 'the beginning or origin of something', 'n.', 'ˈdʒɛnəsɪs'],
  luna: ['露娜（故事人物名）', 'Luna, a character in the story', 'proper n.', 'ˈluːnə'],
  marina: ['玛丽娜（故事人物名）', 'Marina, a character in the story', 'proper n.', 'məˈriːnə'],
  maya: ['玛雅（故事人物名）', 'Maya, a character in the story', 'proper n.', 'ˈmaɪə'],
  nova: ['诺娃（故事中的船长）', 'Nova, the captain in this story', 'proper n.', 'ˈnoʊvə'],
  orion: ['猎户座；俄里翁（传说人物）', 'Orion, a constellation and legendary hunter', 'proper n.', 'əˈraɪən'],
  oscar: ['奥斯卡（故事中的章鱼名）', 'Oscar, the octopus in this story', 'proper n.', 'ˈɒskər'],
  's-u-n': ['S-U-N（sun的拼写）', 'the letters used to spell sun', 'spelling', 'ɛs juː ɛn'],
  scorpius: ['天蝎座；斯科皮乌斯（故事人物）', 'Scorpius, a constellation and story character', 'proper n.', 'ˈskɔːrpiəs'],
  stardust: ['星尘；“星尘号”（故事中的飞船）', 'stardust; the name of Nova’s spaceship', 'n./proper n.', 'ˈstɑːrdʌst'],
  stella: ['斯特拉（故事人物名）', 'Stella, a character in the story', 'proper n.', 'ˈstɛlə'],
  thomas: ['托马斯（故事人物名）', 'Thomas, a name used in the story', 'proper n.', 'ˈtɒməs'],
  tom: ['汤姆（故事人物名）', 'Tom, a character in the story', 'proper n.', 'tɒm'],
  "tomorrow's": ['明天的', 'belonging to or happening tomorrow', 'det.', 'təˈmɒroʊz'],
  wells: ['韦尔斯（故事中教授的姓）', 'Wells, the professor in this story', 'proper n.', 'wɛlz'],
  "yesterday's": ['昨天的', 'belonging to or happening yesterday', 'det.', 'ˈjɛstərdeɪz'],
  zephyr: ['西风；泽菲尔（故事中的风精灵/龙）', 'a gentle breeze; the name of a story character', 'n./proper n.', 'ˈzɛfər'],
};

const contextualOverrides = {
  also: ['也；还', 'in addition; too', 'adv.'],
  ages: ['很长的时间；时代', 'long periods of time or historical eras', 'n.'],
  any: ['任何的；任一', 'one or some without choosing a particular one', 'det./pron.'],
  born: ['出生；诞生', 'coming into life or beginning to exist', 'v./adj.'],
  countless: ['无数的', 'too many to count', 'adj.'],
  creates: ['创造；产生', 'makes or causes something new to exist', 'v.'],
  even: ['甚至；即使', 'used to emphasize an unexpected example', 'adv.'],
  eternal: ['永恒的', 'lasting forever or for a very long time', 'adj.'],
  great: ['伟大的；非常好的', 'very good, important, or large', 'adj.'],
  human: ['人；人类的', 'a person; relating to people', 'n./adj.'],
  just: ['只是；刚刚；正好', 'only; exactly; a short time ago', 'adv.'],
  lay: ['躺；位于', 'was lying or was located', 'v.'],
  lies: ['在于', 'is found or exists in a particular place or idea', 'v.', 'laɪz'],
  milky: ['乳白色的；银河的', 'like milk in colour; used in Milky Way', 'adj.'],
  much: ['许多；很', 'a large amount or to a great degree', 'det./adv.'],
  olympic: ['奥林匹克的', 'connected with the Olympic Games', 'adj.'],
  pure: ['纯净的；完全的', 'not mixed with anything else', 'adj.'],
  realm: ['领域；王国', 'an area, kingdom, or kind of activity', 'n.'],
  sent: ['派去；送去', 'caused or told to go somewhere', 'v.'],
  shown: ['显示；表明', 'made clear or demonstrated', 'v.'],
  speaks: ['说话；表达', 'uses words or communicates', 'v.'],
  spoken: ['被说出的；口语的', 'said aloud or expressed in words', 'v./adj.'],
  so: ['如此；这么；因此', 'to this degree; for this reason', 'adv./conj.'],
  thousands: ['数千；成千上万', 'groups or a very large number of thousands', 'number'],
  tool: ['工具', 'an object or method used to do a job', 'n.'],
  upon: ['在……之上；一……就', 'on; used in the phrase once upon a time', 'prep.'],
  well: ['好地；妥善地', 'in a good or suitable way', 'adv.'],
};

function firstSense(value) {
  return value
    .split('\\n')
    .map(line => line.trim())
    .find(line => line && !line.startsWith('[网络]'))
    ?.replace(/^(?:(?:n|v|a|s|r|c|adj|adv|prep|conj|art|abbr|pron)\.?\s*)+/i, '')
    .replace(/^\[.*?]\s*/, '')
    .trim() ?? '';
}

function partOfSpeech(source) {
  const prefix = source.definition.match(/^([a-z]+)\.?\s/i)?.[1];
  return ({ n: 'n.', v: 'v.', a: 'adj.', s: 'adj.', r: 'adv.', p: 'prep.', c: 'conj.' })[prefix] ?? 'word';
}

const csvRows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const source = new Map(csvRows.slice(1).map(row => [row[0]?.toLocaleLowerCase('en-US'), {
  phonetic: row[1], definition: row[2], translation: row[3],
}]));

const server = await createServer({
  configFile: new URL('../vite.config.ts', import.meta.url).pathname,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { allStories, allDictionary } = await server.ssrLoadModule('/src/data/index.ts');
  const { courseSupplementDictionary } = await server.ssrLoadModule(
    '/src/data/dictionary/course-supplement.ts'
  );
  const { getDictionaryLookupForms, normalizeDictionaryWord } = await server.ssrLoadModule(
    '/src/data/dictionary/wordForms.ts'
  );
  const supplementWords = new Set(courseSupplementDictionary.map(({ word }) => normalizeDictionaryWord(word)));
  const dictionary = new Set(
    allDictionary
      .filter(({ word }) => !supplementWords.has(normalizeDictionaryWord(word)))
      .map(({ word }) => normalizeDictionaryWord(word))
  );
  const missing = new Map();
  for (const story of allStories) {
    for (const paragraph of story.content) {
      for (const { word } of paragraph.words) {
        const normalized = normalizeDictionaryWord(word);
        if (!normalized || getDictionaryLookupForms(normalized).some(form => dictionary.has(form))) continue;
        const item = missing.get(normalized) ?? { word: normalized, level: story.level, count: 0, examples: [] };
        item.level = Math.min(item.level, story.level);
        item.count += 1;
        if (!item.examples.includes(paragraph.text)) item.examples.push(paragraph.text);
        missing.set(normalized, item);
      }
    }
  }

  const entries = [...missing.values()].sort((left, right) => left.word.localeCompare(right.word)).map(item => {
    const record = source.get(item.word) ?? { phonetic: '', definition: '', translation: '' };
    const override = overrides[item.word] ?? contextualOverrides[item.word];
    const [meaningCn, meaningEn, partOfSpeechOverride, phoneticOverride] = override ?? [
      firstSense(record.translation), firstSense(record.definition), partOfSpeech(record), '',
    ];
    if (!meaningCn || !meaningEn) throw new Error(`No reviewed meaning for ${item.word}.`);
    return {
      word: item.word,
      // ECDICT sometimes omits a derived form's IPA. Reuse the seed lemma's
      // pronunciation when the conservative lookup rules can identify it.
      phonetic: phoneticOverride || record.phonetic || getDictionaryLookupForms(item.word)
        .map(form => source.get(form)?.phonetic)
        .find(Boolean) || '',
      meaningCn,
      meaningEn,
      partOfSpeech: partOfSpeechOverride,
      examples: item.examples.slice(0, 2),
      emoji: '📘',
      level: item.level,
      frequency: Math.min(90, 48 + item.count * 8),
    };
  });

  const output = `/**\n * Course-word supplement generated from the reviewed ECDICT seed.\n *\n * Entries retain a course sentence as their example, while proper names,\n * spelling exercises, numerals, and context-sensitive senses are authored in\n * scripts/build-course-dictionary.mjs. See docs/course-dictionary-sources.md\n * for source revision and MIT attribution.\n */\n\nimport type { DictionaryEntry } from '@/db';\n\nexport const courseSupplementDictionary: DictionaryEntry[] = ${JSON.stringify(entries, null, 2)};\n\nexport default courseSupplementDictionary;\n`;
  fs.writeFileSync('src/data/dictionary/course-supplement.ts', output);
  console.log(`Wrote ${entries.length} course dictionary entries.`);
} finally {
  await server.close();
}

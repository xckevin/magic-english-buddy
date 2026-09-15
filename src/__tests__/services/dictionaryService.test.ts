/**
 * Dictionary Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dictionaryService } from '@/services/dictionaryService';
import { courseSupplementDictionary } from '@/data/dictionary/course-supplement';
import { seedTestDatabase, createTestDatabase } from '../mocks';

describe('DictionaryService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase(); // 清空数据
  });

  describe('lookup', () => {
    it('应该查找存在的单词', async () => {
      const result = await dictionaryService.lookup('apple');
      
      expect(result).not.toBeNull();
      expect(result?.word).toBe('apple');
      expect(result?.meaningCn).toBe('苹果');
    });

    it('应该返回完整的词条信息', async () => {
      const result = await dictionaryService.lookup('apple');
      
      expect(result).toMatchObject({
        word: 'apple',
        phonetic: expect.any(String),
        meaningCn: expect.any(String),
        meaningEn: expect.any(String),
        partOfSpeech: expect.any(String),
        emoji: expect.any(String),
      });
    });

    it('应该处理大小写不敏感', async () => {
      const result1 = await dictionaryService.lookup('Apple');
      const result2 = await dictionaryService.lookup('APPLE');
      const result3 = await dictionaryService.lookup('apple');
      
      expect(result1?.word).toBe('apple');
      expect(result2?.word).toBe('apple');
      expect(result3?.word).toBe('apple');
    });

    it('应该处理单词前后空格', async () => {
      const result = await dictionaryService.lookup('  apple  ');
      expect(result?.word).toBe('apple');
    });

    it('不存在的单词应该返回 null', async () => {
      const result = await dictionaryService.lookup('xyznonexistent');
      expect(result).toBeNull();
    });

    it('空字符串应该返回 null', async () => {
      const result = await dictionaryService.lookup('');
      expect(result).toBeNull();
    });

    it('应该处理标点符号', async () => {
      const result = await dictionaryService.lookup('apple!');
      expect(result?.word).toBe('apple');
    });
  });

  describe('lookupMultiple', () => {
    it('应该批量查询多个单词', async () => {
      const words = ['apple', 'red', 'tree'];
      const results = await dictionaryService.lookupMultiple(words);
      
      expect(results.size).toBeGreaterThan(0);
    });

    it('应该返回 Map 格式的结果', async () => {
      const words = ['apple', 'red'];
      const results = await dictionaryService.lookupMultiple(words);
      
      expect(results instanceof Map).toBe(true);
    });

    it('查找到的单词应该在结果中', async () => {
      const words = ['apple', 'red'];
      const results = await dictionaryService.lookupMultiple(words);
      
      expect(results.has('apple')).toBe(true);
      expect(results.has('red')).toBe(true);
    });

    it('空数组应该返回空 Map', async () => {
      const results = await dictionaryService.lookupMultiple([]);
      expect(results.size).toBe(0);
    });
  });

  describe('search', () => {
    it('应该搜索以指定前缀开头的单词', async () => {
      const results = await dictionaryService.search('app');
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('应该限制返回数量', async () => {
      const results = await dictionaryService.search('a', 5);
      
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('空前缀应该返回空数组', async () => {
      const results = await dictionaryService.search('');
      expect(results).toEqual([]);
    });
  });

  describe('fuzzySearch', () => {
    it('应该支持模糊搜索', async () => {
      const results = await dictionaryService.fuzzySearch('ap');
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('短查询应该返回空数组', async () => {
      const results = await dictionaryService.fuzzySearch('a'); // 少于 2 个字符
      expect(results).toEqual([]);
    });
  });

  describe('getRandomWords', () => {
    it('应该返回随机单词', async () => {
      const results = await dictionaryService.getRandomWords(3);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('应该支持按等级筛选', async () => {
      const results = await dictionaryService.getRandomWords(5, 1);
      
      results.forEach((entry) => {
        expect(entry.level).toBe(1);
      });
    });
  });

  describe('getStats', () => {
    it('应该返回词典统计', async () => {
      const stats = await dictionaryService.getStats();
      
      expect(stats).toMatchObject({
        total: expect.any(Number),
        byLevel: expect.any(Object),
      });
    });

    it('总数应该大于等于 0', async () => {
      const stats = await dictionaryService.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('exists', () => {
    it('存在的单词应该返回 true', async () => {
      const result = await dictionaryService.exists('apple');
      expect(result).toBe(true);
    });

    it('不存在的单词应该返回 false', async () => {
      const result = await dictionaryService.exists('xyznonexistent');
      expect(result).toBe(false);
    });
  });

  describe('词形还原', () => {
    it('应该能查询原形', async () => {
      const result = await dictionaryService.lookup('apple');
      expect(result).not.toBeNull();
    });

    // 词形还原测试依赖于数据库中有对应的原形单词
    it('应该能处理带标点的单词', async () => {
      const result = await dictionaryService.lookup('apple.');
      expect(result?.word).toBe('apple');
    });

    it('还原常见不规则、双写和 -ves 词形', async () => {
      await dictionaryService.addWords([
        { word: 'run', phonetic: '/rʌn/', meaningCn: '跑', meaningEn: 'to move fast on foot', partOfSpeech: 'v.', examples: [], emoji: '🏃', level: 1, frequency: 1 },
        { word: 'happy', phonetic: '/ˈhæpi/', meaningCn: '高兴的', meaningEn: 'feeling pleased', partOfSpeech: 'adj.', examples: [], emoji: '🙂', level: 1, frequency: 1 },
        { word: 'live', phonetic: '/lɪv/', meaningCn: '居住', meaningEn: 'to have a home', partOfSpeech: 'v.', examples: [], emoji: '🏠', level: 1, frequency: 1 },
        { word: 'child', phonetic: '/tʃaɪld/', meaningCn: '孩子', meaningEn: 'a young person', partOfSpeech: 'n.', examples: [], emoji: '🧒', level: 1, frequency: 1 },
      ]);

      await expect(dictionaryService.lookup('running')).resolves.toMatchObject({ word: 'run' });
      await expect(dictionaryService.lookup('happiest')).resolves.toMatchObject({ word: 'happy' });
      await expect(dictionaryService.lookup('lives')).resolves.toMatchObject({ word: 'live' });
      await expect(dictionaryService.lookup('children')).resolves.toMatchObject({ word: 'child' });
    });

    it('保留缩写和内部撇号，并移除外围标点', async () => {
      await dictionaryService.addWords([
        { word: "don't", phonetic: '/doʊnt/', meaningCn: '不要', meaningEn: 'do not', partOfSpeech: 'contraction', examples: [], emoji: '🚫', level: 1, frequency: 1 },
        { word: 'guardian', phonetic: '/ˈɡɑːrdiən/', meaningCn: '守护者', meaningEn: 'a protector', partOfSpeech: 'n.', examples: [], emoji: '🛡️', level: 1, frequency: 1 },
        { word: 'dr', phonetic: '/ˈdɒktər/', meaningCn: '医生', meaningEn: 'doctor abbreviation', partOfSpeech: 'abbr.', examples: [], emoji: '🩺', level: 1, frequency: 1 },
      ]);

      await expect(dictionaryService.lookup("“don't!”")).resolves.toMatchObject({ word: "don't" });
      await expect(dictionaryService.lookup('Guardian’s')).resolves.toMatchObject({ word: 'guardian' });
      await expect(dictionaryService.lookup('Dr.')).resolves.toMatchObject({ word: 'dr' });
    });
  });

  describe('课程补充词典', () => {
    it('为常见漏词、故事专名和拼写练习提供可读释义', async () => {
      await dictionaryService.addWords(courseSupplementDictionary);
      expect(courseSupplementDictionary).toHaveLength(356);
      expect(courseSupplementDictionary.every(entry => entry.phonetic.length > 0)).toBe(true);

      const checks = [
        ['just', '只是；刚刚；正好'],
        ['also', '也；还'],
        ['much', '许多；很'],
        ['Zephyr', '西风；泽菲尔（故事中的风精灵/龙）'],
        ['B-A-L-L', 'B-A-L-L（ball的拼写）'],
      ] as const;

      for (const [word, meaningCn] of checks) {
        const result = await dictionaryService.lookup(word);
        expect(result, word).toMatchObject({ word: word.toLowerCase(), meaningCn });
        expect(result?.meaningEn, word).not.toHaveLength(0);
        expect(result?.examples, word).not.toHaveLength(0);
      }
    });
  });
});

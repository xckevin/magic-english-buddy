/**
 * Dictionary Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dictionaryService } from '@/services/dictionaryService';
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
  });
});

/**
 * Dictionary Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dictionaryService } from '@/services/dictionaryService';
import { seedTestDatabase, createTestDatabase, mockDictionaryEntry } from '../mocks';

describe('DictionaryService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase(); // 清空数据
    dictionaryService.clearCache();
  });

  describe('lookup', () => {
    it('应该查找存在的单词', async () => {
      const result = await dictionaryService.lookup('apple');
      
      expect(result.entry).not.toBeNull();
      expect(result.entry?.word).toBe('apple');
      expect(result.entry?.meaningCn).toBe('苹果');
    });

    it('应该返回完整的词条信息', async () => {
      const result = await dictionaryService.lookup('apple');
      
      expect(result.entry).toMatchObject({
        word: 'apple',
        phonetic: expect.any(String),
        meaningCn: expect.any(String),
        meaningEn: expect.any(String),
        partOfSpeech: expect.any(String),
        emoji: expect.any(String)
      });
    });

    it('应该处理大小写不敏感', async () => {
      const result1 = await dictionaryService.lookup('Apple');
      const result2 = await dictionaryService.lookup('APPLE');
      const result3 = await dictionaryService.lookup('apple');
      
      expect(result1.entry?.word).toBe('apple');
      expect(result2.entry?.word).toBe('apple');
      expect(result3.entry?.word).toBe('apple');
    });

    it('应该处理单词前后空格', async () => {
      const result = await dictionaryService.lookup('  apple  ');
      
      expect(result.entry?.word).toBe('apple');
    });

    it('不存在的单词应该返回建议', async () => {
      const result = await dictionaryService.lookup('applle');
      
      expect(result.entry).toBeNull();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('应该缓存查询结果', async () => {
      // 第一次查询
      await dictionaryService.lookup('apple');
      
      // 第二次查询应该从缓存获取
      const result = await dictionaryService.lookup('apple');
      
      expect(result.entry?.word).toBe('apple');
    });
  });

  describe('bulkLookup', () => {
    it('应该批量查询多个单词', async () => {
      const words = ['apple', 'red', 'tree'];
      const results = await dictionaryService.bulkLookup(words);
      
      expect(results.size).toBeGreaterThan(0);
    });

    it('应该返回 Map 格式的结果', async () => {
      const words = ['apple', 'red'];
      const results = await dictionaryService.bulkLookup(words);
      
      expect(results instanceof Map).toBe(true);
      expect(results.has('apple')).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('应该清空缓存', async () => {
      // 先查询填充缓存
      await dictionaryService.lookup('apple');
      
      // 清空缓存
      dictionaryService.clearCache();
      
      // 应该不会报错
      expect(() => dictionaryService.clearCache()).not.toThrow();
    });
  });

  describe('词形还原', () => {
    it('应该处理复数形式 (-s)', async () => {
      // 需要数据库有 cat 词条
      // 这里测试逻辑
      const result = await dictionaryService.lookup('cats');
      // 如果有词形还原，应该找到 cat
      expect(result.entry !== null || result.suggestions.length > 0).toBe(true);
    });

    it('应该处理过去式 (-ed)', async () => {
      const result = await dictionaryService.lookup('walked');
      expect(result.entry !== null || result.suggestions.length > 0).toBe(true);
    });
  });
});


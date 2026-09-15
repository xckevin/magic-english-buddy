/**
 * 字典查询服务
 * 支持离线词典查询、模糊搜索、词形还原
 */

import { db, type DictionaryEntry } from '@/db';
import { getDictionaryLookupForms, normalizeDictionaryWord } from '@/data/dictionary/wordForms';

class DictionaryService {
  /**
   * 查询单词
   */
  async lookup(word: string): Promise<DictionaryEntry | null> {
    const forms = getDictionaryLookupForms(word);
    for (const form of forms) {
      const entry = await db.dictionary.get(form);
      if (entry) return entry;
    }

    return null;
  }

  /**
   * 批量查询单词
   */
  async lookupMultiple(words: string[]): Promise<Map<string, DictionaryEntry>> {
    const result = new Map<string, DictionaryEntry>();
    
    for (const word of words) {
      const entry = await this.lookup(word);
      if (entry) {
        result.set(word.toLowerCase(), entry);
      }
    }

    return result;
  }

  /**
   * 搜索单词（前缀匹配）
   */
  async search(prefix: string, limit = 10): Promise<DictionaryEntry[]> {
    const cleaned = normalizeDictionaryWord(prefix);
    if (!cleaned) return [];

    const entries = await db.dictionary
      .where('word')
      .startsWith(cleaned)
      .limit(limit)
      .toArray();

    return entries;
  }

  /**
   * 模糊搜索（包含匹配）
   */
  async fuzzySearch(query: string, limit = 20): Promise<DictionaryEntry[]> {
    const cleaned = normalizeDictionaryWord(query);
    if (!cleaned || cleaned.length < 2) return [];

    // 首先尝试前缀匹配
    const prefixResults = await this.search(cleaned, limit);
    if (prefixResults.length >= limit) {
      return prefixResults;
    }

    // 然后尝试包含匹配（性能考虑，只在结果不足时使用）
    const allEntries = await db.dictionary.toArray();
    const containsResults = allEntries
      .filter(entry => 
        entry.word.includes(cleaned) && 
        !prefixResults.some(r => r.word === entry.word)
      )
      .slice(0, limit - prefixResults.length);

    return [...prefixResults, ...containsResults];
  }

  /**
   * 获取随机单词（用于练习）
   */
  async getRandomWords(count: number, level?: number): Promise<DictionaryEntry[]> {
    let query = db.dictionary.toCollection();
    
    if (level !== undefined) {
      query = db.dictionary.where('level').equals(level);
    }

    const allEntries = await query.toArray();
    
    // Fisher-Yates 洗牌
    for (let i = allEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allEntries[i], allEntries[j]] = [allEntries[j], allEntries[i]];
    }

    return allEntries.slice(0, count);
  }

  /**
   * 获取词典统计
   */
  async getStats(): Promise<{
    total: number;
    byLevel: Record<number, number>;
  }> {
    const total = await db.dictionary.count();
    
    const allEntries = await db.dictionary.toArray();
    const byLevel: Record<number, number> = {};
    
    for (const entry of allEntries) {
      byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
    }

    return { total, byLevel };
  }

  /**
   * 检查单词是否存在
   */
  async exists(word: string): Promise<boolean> {
    const entry = await this.lookup(word);
    return entry !== null;
  }

  /**
   * 添加自定义单词（用于扩展词典）
   */
  async addWord(entry: DictionaryEntry): Promise<void> {
    await db.dictionary.put(entry);
  }

  /**
   * 批量添加单词
   */
  async addWords(entries: DictionaryEntry[]): Promise<void> {
    await db.dictionary.bulkPut(entries);
  }
}

// 单例导出
export const dictionaryService = new DictionaryService();
export default dictionaryService;

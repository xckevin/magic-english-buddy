/**
 * 字典查询服务
 * 支持离线词典查询、模糊搜索、词形还原
 */

import { db, type DictionaryEntry } from '@/db';

// 常见词形变化规则
const WORD_FORMS: Record<string, (word: string) => string[]> = {
  // 动词过去式/过去分词 -ed
  ed: (word) => {
    if (word.endsWith('ed')) {
      const base = word.slice(0, -2);
      return [
        base,                    // played -> play
        base + 'e',              // liked -> like
        base.slice(0, -1),       // stopped -> stop (双写)
        base.replace(/i$/, 'y'), // cried -> cry
      ];
    }
    return [];
  },
  // 动词进行时 -ing
  ing: (word) => {
    if (word.endsWith('ing')) {
      const base = word.slice(0, -3);
      return [
        base,                    // playing -> play
        base + 'e',              // liking -> like
        base.slice(0, -1),       // running -> run (双写)
      ];
    }
    return [];
  },
  // 名词复数 -s/-es
  plural: (word) => {
    if (word.endsWith('ies')) {
      return [word.slice(0, -3) + 'y']; // babies -> baby
    }
    if (word.endsWith('es')) {
      return [
        word.slice(0, -2),       // boxes -> box
        word.slice(0, -1),       // likes -> like
      ];
    }
    if (word.endsWith('s')) {
      return [word.slice(0, -1)]; // cats -> cat
    }
    return [];
  },
  // 动词第三人称 -s/-es
  thirdPerson: (word) => {
    if (word.endsWith('ies')) {
      return [word.slice(0, -3) + 'y']; // flies -> fly
    }
    if (word.endsWith('es')) {
      return [word.slice(0, -2)]; // goes -> go
    }
    if (word.endsWith('s')) {
      return [word.slice(0, -1)]; // runs -> run
    }
    return [];
  },
  // 形容词比较级/最高级
  comparative: (word) => {
    if (word.endsWith('er')) {
      const base = word.slice(0, -2);
      return [
        base,                    // bigger -> big
        base + 'e',              // nicer -> nice
        base.slice(0, -1),       // bigger -> big (双写)
      ];
    }
    if (word.endsWith('est')) {
      const base = word.slice(0, -3);
      return [
        base,                    // biggest -> big
        base + 'e',              // nicest -> nice
      ];
    }
    return [];
  },
};

/**
 * 获取单词的所有可能原形
 */
function getWordBaseForms(word: string): string[] {
  const normalized = word.toLowerCase().trim();
  const forms = new Set<string>([normalized]);

  // 应用所有词形变化规则
  for (const transform of Object.values(WORD_FORMS)) {
    const baseForms = transform(normalized);
    baseForms.forEach(form => {
      if (form && form.length > 0) {
        forms.add(form);
      }
    });
  }

  return Array.from(forms);
}

/**
 * 清理单词（移除标点）
 */
function cleanWord(word: string): string {
  return word.replace(/[.,!?;:'"()\[\]{}]/g, '').toLowerCase().trim();
}

class DictionaryService {
  /**
   * 查询单词
   */
  async lookup(word: string): Promise<DictionaryEntry | null> {
    const cleaned = cleanWord(word);
    if (!cleaned) return null;

    // 直接查询
    let entry = await db.dictionary.get(cleaned);
    if (entry) return entry;

    // 尝试词形还原
    const baseForms = getWordBaseForms(cleaned);
    for (const form of baseForms) {
      entry = await db.dictionary.get(form);
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
    const cleaned = cleanWord(prefix);
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
    const cleaned = cleanWord(query);
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


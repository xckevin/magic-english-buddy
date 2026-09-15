/**
 * 数据初始化服务
 * 首次启动时导入故事和词典数据
 */

import { db, type MapNode } from '@/db';
import { allStories, allDictionary, allRegions } from '@/data';
import { generateUnifiedMapData } from '@/data/unifiedMap';
import { migrateLegacyMapProgressInTransaction } from '@/services/mapProgressService';

const INIT_KEY = 'magic_english_data_initialized';
// Re-run the append-only initializers when bundled course data grows, so old
// installs receive newly added stories, dictionary entries, and map nodes.
const INIT_VERSION = '3.4.0';

/**
 * 检查是否需要初始化
 */
export const needsInitialization = (): boolean => {
  const stored = localStorage.getItem(INIT_KEY);
  if (!stored) return true;

  try {
    const data = JSON.parse(stored);
    return data.version !== INIT_VERSION;
  } catch {
    return true;
  }
};

/**
 * 标记初始化完成
 */
const markInitialized = (): void => {
  localStorage.setItem(
    INIT_KEY,
    JSON.stringify({
      version: INIT_VERSION,
      timestamp: Date.now(),
    })
  );
};

/**
 * 初始化故事数据
 */
export const initStories = async (): Promise<number> =>
  db.transaction('rw', db.stories, async () => {
    const ids = new Set(await db.stories.toCollection().primaryKeys());
    const missing = allStories.filter(story => !ids.has(story.id));
    if (missing.length) await db.stories.bulkPut(missing);
    return db.stories.count();
  });

/** Add bundled dictionary entries without overwriting local entries. */
export const initDictionary = async (): Promise<number> =>
  db.transaction('rw', db.dictionary, async () => {
    const words = new Set(await db.dictionary.toCollection().primaryKeys());
    const missing = allDictionary.filter(entry => {
      if (words.has(entry.word)) return false;
      words.add(entry.word);
      return true;
    });
    if (missing.length) await db.dictionary.bulkPut(missing);
    return db.dictionary.count();
  });

/**
 * Keep existing IDs and progress while connecting the current map to old installs.
 * Versions before 3 used node_l1_001; the visible map uses node_l1_01.
 */
export const initMapData = async (): Promise<void> =>
  db.transaction(
    'rw',
    [db.mapRegions, db.mapNodes, db.users, db.userProgress, db.quizHistory, db.learningMeta],
    async () => {
      const existing = await db.mapNodes.toArray();
      // Snapshot the shared pre-profile flags into the one eligible profile
      // before replacing map nodes with course structure only.
      await migrateLegacyMapProgressInTransaction();
      const canonical = generateUnifiedMapData().nodes;
      const oldId = new Map(
        canonical.map(node => {
          const saved =
            existing.find(item => item.id === node.id) ??
            existing.find(item => item.storyId === node.storyId);
          return [node.id, saved?.id ?? node.id];
        })
      );
      const nodes: MapNode[] = canonical.map(node => {
        const saved = existing.filter(item => item.id === node.id || item.storyId === node.storyId);
        const savedNode = saved[0];
        return {
          ...node,
          id: oldId.get(node.id)!,
          prerequisites: node.prerequisites.map(id => oldId.get(id) ?? id),
          rewards: savedNode?.rewards ?? node.rewards,
          // Runtime state belongs to UserProgress. Map nodes remain a canonical
          // course graph after migration, never another profile's progress.
          completed: false,
          unlocked: false,
        };
      });
      await db.mapRegions.bulkPut(allRegions);
      await db.mapNodes.bulkPut(nodes);
    }
  );

/**
 * 执行完整的数据初始化
 */
export const initializeAppData = async (
  onProgress?: (message: string, progress: number) => void
): Promise<{
  stories: number;
  words: number;
  success: boolean;
}> => {
  try {
    onProgress?.('正在检查数据...', 0);

    // 初始化故事
    onProgress?.('正在加载故事数据...', 20);
    const storiesCount = await initStories();

    // 初始化词典
    onProgress?.('正在加载词典数据...', 50);
    const wordsCount = await initDictionary();

    // 初始化地图
    onProgress?.('正在生成魔法地图...', 80);
    await initMapData();

    // 标记完成
    markInitialized();
    onProgress?.('初始化完成！', 100);

    return {
      stories: storiesCount,
      words: wordsCount,
      success: true,
    };
  } catch (error) {
    console.error('Data initialization failed:', error);
    return {
      stories: 0,
      words: 0,
      success: false,
    };
  }
};

/**
 * 重置所有数据（用于测试）
 */
export const resetAllData = async (): Promise<void> => {
  await db.delete();
  localStorage.removeItem(INIT_KEY);
  window.location.reload();
};

/**
 * 获取数据统计
 */
export const getDataStats = async (): Promise<{
  stories: number;
  words: number;
  regions: number;
  nodes: number;
}> => {
  const [stories, words, regions, nodes] = await Promise.all([
    db.stories.count(),
    db.dictionary.count(),
    db.mapRegions.count(),
    db.mapNodes.count(),
  ]);

  return { stories, words, regions, nodes };
};

export default {
  needsInitialization,
  initializeAppData,
  initStories,
  initDictionary,
  initMapData,
  resetAllData,
  getDataStats,
};

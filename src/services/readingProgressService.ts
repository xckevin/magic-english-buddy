/**
 * 阅读进度服务
 * 管理阅读历史、进度保存、统计数据
 */

import { db, type ReadingRecord, type Story, type ShadowingRecord, generateId } from '@/db';
import { assertLearningRevision, getLearningRevision } from './learningRevisionService';
import { completeUserStoryMapNodeInTransaction } from './mapProgressService';
import { getEffectiveStreak, recordLearningActivityInTransaction } from './learningActivityService';

interface ReadingSession {
  databaseRevision: Promise<string | null>;
  storyId: string;
  startTime: number;
  currentParagraph: number;
  totalParagraphs: number;
  wordsLookedUp: string[];
  shadowingRecords: ShadowingRecord[];
}

class ReadingProgressService {
  private currentSession: ReadingSession | null = null;
  private endingSessionPromise: Promise<ReadingRecord | null> | null = null;

  /**
   * 开始阅读会话
   */
  startSession(storyId: string, totalParagraphs: number = 1): void {
    this.currentSession = {
      databaseRevision: getLearningRevision().catch(() => null),
      storyId,
      startTime: Date.now(),
      currentParagraph: 0,
      totalParagraphs,
      wordsLookedUp: [],
      shadowingRecords: [],
    };
  }

  /**
   * 更新当前段落
   */
  updateParagraph(paragraphIndex: number): void {
    if (this.currentSession) {
      this.currentSession.currentParagraph = paragraphIndex;
    }
  }

  /**
   * 添加查询的单词
   */
  addLookedUpWord(word: string): void {
    if (this.currentSession) {
      const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
      if (!this.currentSession.wordsLookedUp.includes(normalizedWord)) {
        this.currentSession.wordsLookedUp.push(normalizedWord);
      }
    }
  }

  /**
   * 添加影子跟读记录
   */
  addShadowingRecord(record: ShadowingRecord): void {
    if (this.currentSession) {
      this.currentSession.shadowingRecords.push(record);
    }
  }

  /**
   * 结束阅读会话并保存
   */
  async endSession(userId: string, completed: boolean = true): Promise<ReadingRecord | null> {
    if (this.endingSessionPromise) {
      return this.endingSessionPromise;
    }
    if (!this.currentSession) return null;

    const session = this.currentSession;
    const endTime = Date.now();
    const duration = Math.floor((endTime - session.startTime) / 1000);
    const progress = completed
      ? 100
      : Math.round((session.currentParagraph / session.totalParagraphs) * 100);

    const record: ReadingRecord = {
      id: generateId(),
      userId,
      storyId: session.storyId,
      startTime: session.startTime,
      endTime,
      duration,
      progress,
      wordsLookedUp: session.wordsLookedUp,
      shadowingRecords: session.shadowingRecords,
      completed,
    };

    const savePromise = this.saveSession(userId, record, session);
    this.endingSessionPromise = savePromise;
    try {
      return await savePromise;
    } finally {
      if (this.endingSessionPromise === savePromise) {
        this.endingSessionPromise = null;
      }
    }
  }

  private async saveSession(
    userId: string,
    record: ReadingRecord,
    session: ReadingSession
  ): Promise<ReadingRecord | null> {
    try {
      const revision = await session.databaseRevision;
      if (revision === null) throw new Error('Learning records unavailable');
      await db.transaction('rw', db.readingHistory, db.userProgress, db.learningMeta, async () => {
        await assertLearningRevision(revision);
        await db.readingHistory.add(record);

        const userProgress = await db.userProgress.get(userId);
        if (!userProgress) {
          throw new Error('Cannot save reading progress without a user progress record');
        }

        const records = await db.readingHistory.where('userId').equals(userId).toArray();
        const completedStoryIds = new Set(
          records.filter(item => item.completed).map(item => item.storyId)
        );
        const totalReadingTime = Math.floor(
          records.reduce((total, item) => total + item.duration, 0) / 60
        );
        const updates: Partial<typeof userProgress> = {
          totalStoriesRead: completedStoryIds.size,
          totalReadingTime,
        };
        await db.userProgress.update(userId, updates);
        if (record.completed) await recordLearningActivityInTransaction(userId);
      });

      if (this.currentSession === session) {
        this.currentSession = null;
      }
      return record;
    } catch (error) {
      console.error('Failed to save reading history:', error);
      return null;
    }
  }

  /**
   * 获取故事的阅读历史
   */
  async getStoryHistory(storyId: string): Promise<ReadingRecord[]> {
    return db.readingHistory.where('storyId').equals(storyId).reverse().toArray();
  }

  /**
   * 获取用户的所有阅读历史
   */
  async getUserHistory(userId: string, limit = 50): Promise<ReadingRecord[]> {
    return db.readingHistory.where('userId').equals(userId).reverse().limit(limit).toArray();
  }

  /**
   * 获取今日阅读统计
   */
  async getTodayStats(userId: string): Promise<{
    storiesRead: number;
    totalDuration: number;
    wordsLookedUp: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTime = todayStart.getTime();

    const todayRecords = await db.readingHistory
      .where('userId')
      .equals(userId)
      .filter(record => record.startTime >= todayStartTime)
      .toArray();

    const uniqueStories = new Set(todayRecords.map(r => r.storyId));
    const totalDuration = todayRecords.reduce((sum, r) => sum + r.duration, 0);
    const uniqueWords = new Set(todayRecords.flatMap(r => r.wordsLookedUp));

    return {
      storiesRead: uniqueStories.size,
      totalDuration,
      wordsLookedUp: uniqueWords.size,
    };
  }

  /**
   * 获取总阅读统计
   */
  async getTotalStats(userId: string): Promise<{
    totalStories: number;
    totalDuration: number;
    totalWordsLookedUp: number;
    streakDays: number;
  }> {
    const [allRecords, progress] = await Promise.all([
      db.readingHistory.where('userId').equals(userId).toArray(),
      db.userProgress.get(userId),
    ]);

    const uniqueStories = new Set(allRecords.map(r => r.storyId));
    const totalDuration = allRecords.reduce((sum, r) => sum + r.duration, 0);
    const uniqueWords = new Set(allRecords.flatMap(r => r.wordsLookedUp));

    return {
      totalStories: uniqueStories.size,
      totalDuration,
      totalWordsLookedUp: uniqueWords.size,
      streakDays: progress ? getEffectiveStreak(progress) : 0,
    };
  }

  /**
   * 检查故事是否已完成
   */
  async isStoryCompleted(storyId: string, userId: string): Promise<boolean> {
    const records = await db.readingHistory
      .where('userId')
      .equals(userId)
      .filter(r => r.storyId === storyId && r.completed)
      .count();

    return records > 0;
  }

  /**
   * 标记故事为已完成（更新地图节点状态）
   */
  async markStoryCompleted(userId: string, storyId: string): Promise<void> {
    await db.transaction(
      'rw',
      [db.users, db.userProgress, db.quizHistory, db.mapNodes, db.learningMeta],
      async () => {
        await this.markStoryCompletedInTransaction(userId, storyId);
      }
    );
  }

  /**
   * Marks a node and its newly available dependents while an enclosing Dexie
   * transaction is active. Completion settlement uses this so map state cannot
   * be committed without the accompanying rewards and quiz history.
   */
  async markStoryCompletedInTransaction(userId: string, storyId: string): Promise<string[]> {
    return (await completeUserStoryMapNodeInTransaction(userId, storyId)).newlyUnlockedNodeIds;
  }

  /**
   * 添加学习的单词
   */
  addLearnedWord(word: string): void {
    this.addLookedUpWord(word);
  }

  /**
   * 获取下一个未完成的故事
   */
  async getNextUncompletedStory(level: number): Promise<Story | null> {
    const story = await db.stories.where('level').equals(level).first();

    return story || null;
  }

  /**
   * 获取当前会话信息
   */
  getCurrentSession(): ReadingSession | null {
    return this.currentSession;
  }

  /**
   * 取消当前会话
   */
  cancelSession(): void {
    this.currentSession = null;
  }
}

// 单例导出
export const readingProgressService = new ReadingProgressService();
export default readingProgressService;

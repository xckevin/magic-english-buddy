/**
 * 阅读进度服务
 * 管理阅读历史、进度保存、统计数据
 */

import { db, type ReadingRecord, type Story, type ShadowingRecord, generateId } from '@/db';

interface ReadingSession {
  storyId: string;
  startTime: number;
  currentParagraph: number;
  totalParagraphs: number;
  wordsLookedUp: string[];
  shadowingRecords: ShadowingRecord[];
}

class ReadingProgressService {
  private currentSession: ReadingSession | null = null;

  /**
   * 开始阅读会话
   */
  startSession(storyId: string, totalParagraphs: number = 1): void {
    this.currentSession = {
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
    if (!this.currentSession) return null;

    const endTime = Date.now();
    const duration = Math.floor((endTime - this.currentSession.startTime) / 1000);
    const progress = completed 
      ? 100 
      : Math.round((this.currentSession.currentParagraph / this.currentSession.totalParagraphs) * 100);
    
    const record: ReadingRecord = {
      id: generateId(),
      userId,
      storyId: this.currentSession.storyId,
      startTime: this.currentSession.startTime,
      endTime,
      duration,
      progress,
      wordsLookedUp: this.currentSession.wordsLookedUp,
      shadowingRecords: this.currentSession.shadowingRecords,
      completed,
    };

    try {
      await db.readingHistory.add(record);
      this.currentSession = null;
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
    return db.readingHistory
      .where('storyId')
      .equals(storyId)
      .reverse()
      .toArray();
  }

  /**
   * 获取用户的所有阅读历史
   */
  async getUserHistory(userId: string, limit = 50): Promise<ReadingRecord[]> {
    return db.readingHistory
      .where('userId')
      .equals(userId)
      .reverse()
      .limit(limit)
      .toArray();
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
    const allRecords = await db.readingHistory
      .where('userId')
      .equals(userId)
      .toArray();

    const uniqueStories = new Set(allRecords.map(r => r.storyId));
    const totalDuration = allRecords.reduce((sum, r) => sum + r.duration, 0);
    const uniqueWords = new Set(allRecords.flatMap(r => r.wordsLookedUp));

    // 计算连续学习天数
    const dates = [...new Set(allRecords.map(r => {
      const date = new Date(r.startTime);
      return date.toISOString().split('T')[0];
    }))].sort().reverse();

    let streakDays = 0;
    const today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (dates.includes(expectedDateStr)) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalStories: uniqueStories.size,
      totalDuration,
      totalWordsLookedUp: uniqueWords.size,
      streakDays,
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
  async markStoryCompleted(storyId: string): Promise<void> {
    try {
      // 查找对应的地图节点并标记为完成
      const node = await db.mapNodes
        .where('storyId')
        .equals(storyId)
        .first();
      
      if (node) {
        await db.mapNodes.update(node.id, { 
          completed: true,
        });
        
        // 解锁后续节点：查找所有将当前节点作为前置条件的节点
        const dependentNodes = await db.mapNodes
          .filter(n => n.prerequisites?.includes(node.id))
          .toArray();
        
        for (const nextNode of dependentNodes) {
          // 检查该节点的所有前置条件是否都已完成
          const allPrereqsCompleted = await this.checkAllPrerequisitesCompleted(nextNode.prerequisites);
          if (allPrereqsCompleted) {
            await db.mapNodes.update(nextNode.id, { unlocked: true });
          }
        }
      }
    } catch (error) {
      console.error('Failed to mark story as completed:', error);
    }
  }

  /**
   * 检查所有前置条件是否已完成
   */
  private async checkAllPrerequisitesCompleted(prerequisites: string[]): Promise<boolean> {
    if (!prerequisites || prerequisites.length === 0) {
      return true;
    }
    
    for (const prereqId of prerequisites) {
      const prereqNode = await db.mapNodes.get(prereqId);
      if (!prereqNode || !prereqNode.completed) {
        return false;
      }
    }
    return true;
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
    const story = await db.stories
      .where('level')
      .equals(level)
      .first();
    
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

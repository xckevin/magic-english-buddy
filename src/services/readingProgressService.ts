/**
 * 阅读进度服务
 * 管理阅读历史、进度保存、统计数据
 */

import { db, type ReadingHistory, type Story } from '@/db';

interface ReadingSession {
  storyId: string;
  startTime: number;
  currentParagraph: number;
  wordsLearned: string[];
}

class ReadingProgressService {
  private currentSession: ReadingSession | null = null;

  /**
   * 开始阅读会话
   */
  startSession(storyId: string): void {
    this.currentSession = {
      storyId,
      startTime: Date.now(),
      currentParagraph: 0,
      wordsLearned: [],
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
   * 添加学习的单词
   */
  addLearnedWord(word: string): void {
    if (this.currentSession) {
      const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
      if (!this.currentSession.wordsLearned.includes(normalizedWord)) {
        this.currentSession.wordsLearned.push(normalizedWord);
      }
    }
  }

  /**
   * 结束阅读会话并保存
   */
  async endSession(userId: number): Promise<ReadingHistory | null> {
    if (!this.currentSession) return null;

    const duration = Math.floor((Date.now() - this.currentSession.startTime) / 1000);
    
    const history: ReadingHistory = {
      odIndex: '', // 将由数据库自动生成
      odNumber: 0,
      odDate: new Date().toISOString().split('T')[0],
      odStoryId: this.currentSession.storyId,
      userId,
      storyId: this.currentSession.storyId,
      readDate: new Date(),
      duration,
      wordsLearned: this.currentSession.wordsLearned,
      completed: true,
    };

    try {
      const id = await db.readingHistory.add(history);
      this.currentSession = null;
      return { ...history, id };
    } catch (error) {
      console.error('Failed to save reading history:', error);
      return null;
    }
  }

  /**
   * 获取故事的阅读历史
   */
  async getStoryHistory(storyId: string): Promise<ReadingHistory[]> {
    return db.readingHistory
      .where('storyId')
      .equals(storyId)
      .reverse()
      .toArray();
  }

  /**
   * 获取用户的所有阅读历史
   */
  async getUserHistory(userId: number, limit = 50): Promise<ReadingHistory[]> {
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
  async getTodayStats(userId: number): Promise<{
    storiesRead: number;
    totalDuration: number;
    wordsLearned: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecords = await db.readingHistory
      .where('userId')
      .equals(userId)
      .filter(record => {
        const recordDate = new Date(record.readDate).toISOString().split('T')[0];
        return recordDate === today;
      })
      .toArray();

    const uniqueStories = new Set(todayRecords.map(r => r.storyId));
    const totalDuration = todayRecords.reduce((sum, r) => sum + r.duration, 0);
    const uniqueWords = new Set(todayRecords.flatMap(r => r.wordsLearned));

    return {
      storiesRead: uniqueStories.size,
      totalDuration,
      wordsLearned: uniqueWords.size,
    };
  }

  /**
   * 获取总阅读统计
   */
  async getTotalStats(userId: number): Promise<{
    totalStories: number;
    totalDuration: number;
    totalWordsLearned: number;
    streakDays: number;
  }> {
    const allRecords = await db.readingHistory
      .where('userId')
      .equals(userId)
      .toArray();

    const uniqueStories = new Set(allRecords.map(r => r.storyId));
    const totalDuration = allRecords.reduce((sum, r) => sum + r.duration, 0);
    const uniqueWords = new Set(allRecords.flatMap(r => r.wordsLearned));

    // 计算连续学习天数
    const dates = [...new Set(allRecords.map(r => 
      new Date(r.readDate).toISOString().split('T')[0]
    ))].sort().reverse();

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
      totalWordsLearned: uniqueWords.size,
      streakDays,
    };
  }

  /**
   * 检查故事是否已完成
   */
  async isStoryCompleted(storyId: string, userId: number): Promise<boolean> {
    const records = await db.readingHistory
      .where(['storyId', 'userId'])
      .equals([storyId, userId])
      .filter(r => r.completed)
      .count();
    
    return records > 0;
  }

  /**
   * 标记故事为已完成
   */
  async markStoryCompleted(storyId: string): Promise<void> {
    await db.stories.update(storyId, { completed: true });
  }

  /**
   * 获取下一个未完成的故事
   */
  async getNextUncompletedStory(level: number): Promise<Story | null> {
    const stories = await db.stories
      .where('level')
      .equals(level)
      .filter(s => s.unlocked && !s.completed)
      .first();
    
    return stories || null;
  }
}

// 单例导出
export const readingProgressService = new ReadingProgressService();
export default readingProgressService;


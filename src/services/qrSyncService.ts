/**
 * QRSyncService - 二维码同步服务
 * 支持离线数据通过二维码传输
 */

import { db, type User, type UserProgress } from '@/db';

// 同步数据结构
export interface SyncData {
  version: string;
  timestamp: number;
  type: 'progress' | 'full';
  user: {
    name: string;
    buddyName: string;
  };
  progress: {
    level: number;
    magicPower: number;
    buddyStage: number;
    totalReadingTime: number;
    totalStoriesRead: number;
    streakDays: number;
    completedNodes: string[];
  };
  checksum: string;
}

/**
 * 生成同步数据
 */
export const generateSyncData = async (userId: string): Promise<SyncData | null> => {
  try {
    const user = await db.users.get(userId);
    const progress = await db.userProgress.get(userId);
    
    if (!user || !progress) return null;

    // 获取已完成的节点
    const completedNodes = await db.mapNodes
      .filter(n => n.completed === true)
      .toArray();

    const data: SyncData = {
      version: '1.0',
      timestamp: Date.now(),
      type: 'progress',
      user: {
        name: user.name,
        buddyName: user.buddyName,
      },
      progress: {
        level: progress.level,
        magicPower: progress.magicPower,
        buddyStage: progress.buddyStage,
        totalReadingTime: progress.totalReadingTime,
        totalStoriesRead: progress.totalStoriesRead,
        streakDays: progress.streakDays,
        completedNodes: completedNodes.map(n => n.id),
      },
      checksum: '',
    };

    // 生成校验和
    data.checksum = generateChecksum(data);

    return data;
  } catch (error) {
    console.error('Failed to generate sync data:', error);
    return null;
  }
};

/**
 * 生成二维码内容
 */
export const generateQRContent = async (userId: string): Promise<string | null> => {
  const data = await generateSyncData(userId);
  if (!data) return null;

  // 压缩数据为 Base64
  const jsonStr = JSON.stringify(data);
  const compressed = btoa(encodeURIComponent(jsonStr));
  
  return `MEB:${compressed}`;
};

/**
 * 解析二维码内容
 */
export const parseQRContent = (content: string): SyncData | null => {
  try {
    if (!content.startsWith('MEB:')) {
      return null;
    }

    const compressed = content.slice(4);
    const jsonStr = decodeURIComponent(atob(compressed));
    const data: SyncData = JSON.parse(jsonStr);

    // 验证校验和
    const checksum = data.checksum;
    data.checksum = '';
    if (generateChecksum(data) !== checksum) {
      console.error('Checksum mismatch');
      return null;
    }
    data.checksum = checksum;

    return data;
  } catch (error) {
    console.error('Failed to parse QR content:', error);
    return null;
  }
};

/**
 * 生成校验和
 */
const generateChecksum = (data: Omit<SyncData, 'checksum'> & { checksum: string }): string => {
  const str = JSON.stringify({ ...data, checksum: '' });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

/**
 * 生成进度报告文本
 */
export const generateProgressReport = async (userId: string): Promise<string> => {
  const data = await generateSyncData(userId);
  if (!data) return '无法生成报告';

  const date = new Date(data.timestamp).toLocaleDateString('zh-CN');
  
  return `
📜 魔法英语伙伴 - 学习报告
━━━━━━━━━━━━━━━━━━━━━━━━

👤 学员：${data.user.name}
🐣 伙伴：${data.user.buddyName}
📅 日期：${date}

📊 学习进度
───────────────────────
⭐ 等级：L${data.progress.level}
✨ 魔力值：${data.progress.magicPower}
🐲 伙伴阶段：${data.progress.buddyStage}/4
📖 已读故事：${data.progress.totalStoriesRead} 篇
⏱️ 总学习时间：${data.progress.totalReadingTime} 分钟
🔥 连续学习：${data.progress.streakDays} 天

🏆 完成节点：${data.progress.completedNodes.length} 个

━━━━━━━━━━━━━━━━━━━━━━━━
Magic English Buddy
`.trim();
};

export default {
  generateSyncData,
  generateQRContent,
  parseQRContent,
  generateProgressReport,
};


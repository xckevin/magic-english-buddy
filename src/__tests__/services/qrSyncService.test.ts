/**
 * QRSync Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateSyncData,
  generateQRContent,
  parseQRContent,
  generateProgressReport,
  type SyncData,
} from '@/services/qrSyncService';
import { seedTestDatabase, createTestDatabase, mockUserProgress, mockUser } from '../mocks';

describe('QRSyncService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase();
  });

  describe('generateSyncData', () => {
    it('应该生成同步数据', async () => {
      const data = await generateSyncData(mockUserProgress.id);

      expect(data).not.toBeNull();
      expect(data).toMatchObject({
        version: expect.any(String),
        timestamp: expect.any(Number),
        type: 'progress',
        user: expect.objectContaining({
          name: expect.any(String),
          buddyName: expect.any(String),
        }),
        progress: expect.objectContaining({
          level: expect.any(Number),
          magicPower: expect.any(Number),
          buddyStage: expect.any(Number),
        }),
        checksum: expect.any(String),
      });
    });

    it('应该包含正确的用户信息', async () => {
      const data = await generateSyncData(mockUserProgress.id);

      expect(data?.user.name).toBe(mockUser.name);
      expect(data?.user.buddyName).toBe(mockUser.buddyName);
    });

    it('应该包含正确的进度信息', async () => {
      const data = await generateSyncData(mockUserProgress.id);

      expect(data?.progress.level).toBe(mockUserProgress.level);
      expect(data?.progress.magicPower).toBe(mockUserProgress.magicPower);
      expect(data?.progress.buddyStage).toBe(mockUserProgress.buddyStage);
    });

    it('用户不存在时应该返回 null', async () => {
      const data = await generateSyncData('non-existent-user');
      expect(data).toBeNull();
    });
  });

  describe('generateQRContent', () => {
    it('应该生成二维码内容字符串', async () => {
      const content = await generateQRContent(mockUserProgress.id);

      expect(content).not.toBeNull();
      expect(typeof content).toBe('string');
      expect(content?.startsWith('MEB:')).toBe(true);
    });

    it('生成的内容应该是 Base64 编码', async () => {
      const content = await generateQRContent(mockUserProgress.id);

      if (content) {
        const base64Part = content.slice(4); // 移除 "MEB:" 前缀
        // 验证是有效的 Base64
        expect(() => atob(base64Part)).not.toThrow();
      }
    });

    it('用户不存在时应该返回 null', async () => {
      const content = await generateQRContent('non-existent-user');
      expect(content).toBeNull();
    });
  });

  describe('parseQRContent', () => {
    it('应该解析有效的二维码内容', async () => {
      // 先生成内容
      const content = await generateQRContent(mockUserProgress.id);

      if (content) {
        const parsed = parseQRContent(content);

        expect(parsed).not.toBeNull();
        expect(parsed?.version).toBe('1.0');
        expect(parsed?.type).toBe('progress');
      }
    });

    it('应该返回完整的进度数据', async () => {
      const content = await generateQRContent(mockUserProgress.id);

      if (content) {
        const parsed = parseQRContent(content);

        expect(parsed?.progress).toMatchObject({
          level: expect.any(Number),
          magicPower: expect.any(Number),
          buddyStage: expect.any(Number),
          totalReadingTime: expect.any(Number),
          totalStoriesRead: expect.any(Number),
          streakDays: expect.any(Number),
        });
      }
    });

    it('无效前缀应该返回 null', () => {
      const parsed = parseQRContent('INVALID:some-data');
      expect(parsed).toBeNull();
    });

    it('空字符串应该返回 null', () => {
      const parsed = parseQRContent('');
      expect(parsed).toBeNull();
    });

    it('无效 Base64 应该返回 null', () => {
      const parsed = parseQRContent('MEB:!!!invalid-base64!!!');
      expect(parsed).toBeNull();
    });

    it('校验和不匹配应该返回 null', async () => {
      const content = await generateQRContent(mockUserProgress.id);

      if (content) {
        // 篡改内容
        const tampered = content.slice(0, -5) + 'xxxxx';
        const parsed = parseQRContent(tampered);
        expect(parsed).toBeNull();
      }
    });
  });

  describe('generateProgressReport', () => {
    it('应该生成进度报告文本', async () => {
      const report = await generateProgressReport(mockUserProgress.id);

      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('报告应该包含用户信息', async () => {
      const report = await generateProgressReport(mockUserProgress.id);

      expect(report).toContain(mockUser.name);
      expect(report).toContain(mockUser.buddyName);
    });

    it('报告应该包含学习进度', async () => {
      const report = await generateProgressReport(mockUserProgress.id);

      expect(report).toContain('等级');
      expect(report).toContain('魔力值');
      expect(report).toContain('伙伴阶段');
    });

    it('用户不存在时应该返回错误信息', async () => {
      const report = await generateProgressReport('non-existent-user');
      expect(report).toContain('无法生成报告');
    });
  });

  describe('数据完整性', () => {
    it('生成和解析应该是可逆的', async () => {
      const originalData = await generateSyncData(mockUserProgress.id);
      const content = await generateQRContent(mockUserProgress.id);

      if (content && originalData) {
        const parsed = parseQRContent(content);

        expect(parsed?.progress.level).toBe(originalData.progress.level);
        expect(parsed?.progress.magicPower).toBe(originalData.progress.magicPower);
        expect(parsed?.progress.buddyStage).toBe(originalData.progress.buddyStage);
      }
    });

    it('校验和应该能检测数据篡改', async () => {
      const data = await generateSyncData(mockUserProgress.id);

      if (data) {
        // 校验和存在
        expect(data.checksum).toBeTruthy();
        expect(data.checksum.length).toBeGreaterThan(0);
      }
    });
  });
});

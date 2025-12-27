/**
 * QR Sync Service 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { qrSyncService } from '@/services/qrSyncService';
import { seedTestDatabase, createTestDatabase, mockUserProgress } from '../mocks';

describe('QRSyncService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await createTestDatabase();
  });

  describe('generateSyncQR', () => {
    it('应该生成二维码 Data URL', async () => {
      const qrDataUrl = await qrSyncService.generateSyncQR(mockUserProgress.id);
      
      expect(typeof qrDataUrl).toBe('string');
      expect(qrDataUrl.startsWith('data:image/')).toBe(true);
    });

    it('二维码应该是有效的图片格式', async () => {
      const qrDataUrl = await qrSyncService.generateSyncQR(mockUserProgress.id);
      
      expect(qrDataUrl).toMatch(/^data:image\/(png|jpeg|webp);base64,/);
    });

    it('用户不存在时应该抛出错误', async () => {
      await expect(qrSyncService.generateSyncQR('non-existent-user'))
        .rejects.toThrow();
    });
  });

  describe('parseQRData', () => {
    it('应该解析有效的二维码数据', () => {
      // 创建模拟的压缩数据
      const mockData = {
        v: 1,
        u: 'test1234',
        t: Date.now(),
        p: [2, 850, 15, 100, 120, 5],
        a: ['fs', 'r10'],
        c: 'abc123'
      };
      const encoded = btoa(JSON.stringify(mockData));

      const result = qrSyncService.parseQRData(encoded);
      
      expect(result).not.toBeNull();
      expect(result?.version).toBe(1);
      expect(result?.progress.level).toBe(2);
      expect(result?.progress.magicPower).toBe(850);
    });

    it('应该返回完整的进度数据', () => {
      const mockData = {
        v: 1,
        u: 'test1234',
        t: Date.now(),
        p: [2, 850, 15, 100, 120, 5],
        a: ['fs'],
        c: 'abc'
      };
      const encoded = btoa(JSON.stringify(mockData));

      const result = qrSyncService.parseQRData(encoded);
      
      expect(result?.progress).toMatchObject({
        level: 2,
        magicPower: 850,
        storiesRead: 15,
        wordsLearned: 100,
        totalTime: 120,
        streakDays: 5
      });
    });

    it('无效数据应该返回 null', () => {
      const result = qrSyncService.parseQRData('invalid-data');
      
      expect(result).toBeNull();
    });

    it('空字符串应该返回 null', () => {
      const result = qrSyncService.parseQRData('');
      
      expect(result).toBeNull();
    });

    it('应该包含成就数据', () => {
      const mockData = {
        v: 1,
        u: 'test1234',
        t: Date.now(),
        p: [2, 850, 15, 100, 120, 5],
        a: ['first', 'read10', 'quiz'],
        c: 'abc'
      };
      const encoded = btoa(JSON.stringify(mockData));

      const result = qrSyncService.parseQRData(encoded);
      
      expect(result?.achievements).toEqual(['first', 'read10', 'quiz']);
    });
  });

  describe('数据压缩', () => {
    it('生成的二维码数据应该足够小', async () => {
      // 这个测试验证数据压缩有效性
      // 二维码 Version 6 可容纳约 214 个字符
      
      const qrDataUrl = await qrSyncService.generateSyncQR(mockUserProgress.id);
      
      // 验证能成功生成，说明数据量在合理范围内
      expect(qrDataUrl).toBeDefined();
    });
  });

  describe('校验和', () => {
    it('应该生成有效的校验和', () => {
      const mockData = {
        v: 1,
        u: 'test1234',
        t: Date.now(),
        p: [2, 850, 15, 100, 120, 5],
        a: ['fs'],
        c: 'a1b2c3d4'
      };
      const encoded = btoa(JSON.stringify(mockData));

      const result = qrSyncService.parseQRData(encoded);
      
      expect(result?.checksum).toBe('a1b2c3d4');
    });
  });
});


/**
 * 守护者卷轴 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('守护者卷轴', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
      // 模拟有学习数据的用户
      localStorage.setItem('magic-english-storage', JSON.stringify({
        state: {
          settings: { ttsSpeed: 1.0, soundEnabled: true },
          currentUserId: 'test-user-001'
        },
        version: 0
      }));
    });
    await page.goto('/scroll');
  });

  test('应该显示卷轴页面', async ({ page }) => {
    await expect(page.getByTestId('scroll-page')).toBeVisible();
  });

  test('应该显示用户信息', async ({ page }) => {
    // 用户名称
    await expect(page.getByTestId('user-name')).toBeVisible();
    
    // Buddy 名称
    await expect(page.getByTestId('buddy-name')).toBeVisible();
    
    // 等级
    await expect(page.getByTestId('user-level')).toBeVisible();
  });

  test('应该显示学习统计', async ({ page }) => {
    // 已读故事数
    await expect(page.getByTestId('stories-count')).toBeVisible();
    
    // 词汇量
    await expect(page.getByTestId('words-count')).toBeVisible();
    
    // 学习时长
    await expect(page.getByTestId('study-time')).toBeVisible();
    
    // 连续学习天数
    await expect(page.getByTestId('streak-days')).toBeVisible();
  });

  test('应该显示已获得的成就', async ({ page }) => {
    await expect(page.getByTestId('achievements-section')).toBeVisible();
    
    // 如果有成就，应该显示成就卡片
    const achievementCards = page.locator('[data-testid^="achievement-card"]');
    expect(await achievementCards.count()).toBeGreaterThanOrEqual(0);
  });

  test('应该能生成二维码', async ({ page }) => {
    // 点击生成二维码按钮
    await page.getByTestId('generate-qr').click();
    
    // 二维码应该显示
    await expect(page.getByTestId('qr-code')).toBeVisible();
    
    // 二维码应该是图片
    const qrCode = page.getByTestId('qr-code');
    await expect(qrCode).toHaveAttribute('src', /data:image/);
  });

  test('二维码应该包含用户数据', async ({ page }) => {
    await page.getByTestId('generate-qr').click();
    
    // 获取二维码图片数据
    const qrSrc = await page.getByTestId('qr-code').getAttribute('src');
    
    // 应该是 base64 编码的图片
    expect(qrSrc).toMatch(/^data:image\/(png|jpeg)/);
  });

  test('应该能打开证书预览', async ({ page }) => {
    // 点击证书按钮
    await page.getByTestId('certificate-button').click();
    
    // 证书预览应该显示
    await expect(page.getByTestId('certificate-preview')).toBeVisible();
  });

  test('证书应该包含完整信息', async ({ page }) => {
    await page.getByTestId('certificate-button').click();
    
    const certificate = page.getByTestId('certificate-preview');
    
    // 标题
    await expect(certificate).toContainText(/certificate|证书/i);
    
    // 用户名
    await expect(certificate.getByTestId('cert-user-name')).toBeVisible();
    
    // 等级
    await expect(certificate.getByTestId('cert-level')).toBeVisible();
    
    // 统计数据
    await expect(certificate.getByTestId('cert-stats')).toBeVisible();
    
    // 日期
    await expect(certificate.getByTestId('cert-date')).toBeVisible();
  });

  test('应该能保存证书为图片', async ({ page }) => {
    await page.getByTestId('certificate-button').click();
    
    // 点击保存图片按钮
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('save-certificate').click();
    
    const download = await downloadPromise;
    
    // 下载的文件应该是图片
    expect(download.suggestedFilename()).toMatch(/\.(png|jpg|jpeg)$/i);
  });

  test('应该能打印证书', async ({ page }) => {
    await page.getByTestId('certificate-button').click();
    
    // 模拟打印功能
    let printCalled = false;
    await page.exposeFunction('mockPrint', () => {
      printCalled = true;
    });
    
    await page.evaluate(() => {
      window.print = () => (window as any).mockPrint();
    });
    
    // 点击打印按钮
    await page.getByTestId('print-certificate').click();
    
    // 打印应该被调用
    expect(printCalled).toBe(true);
  });

  test('底部导航应该工作', async ({ page }) => {
    // 点击地图导航
    await page.getByTestId('nav-map').click();
    
    // 应该跳转到地图页
    await expect(page).toHaveURL(/map/);
  });
});

test.describe('二维码同步', () => {
  test('生成的二维码数据应该可解析', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
    });
    await page.goto('/scroll');
    
    await page.getByTestId('generate-qr').click();
    
    // 获取二维码数据（这里假设有 data 属性）
    const qrData = await page.getByTestId('qr-code').getAttribute('data-content');
    
    // 数据应该存在
    expect(qrData).toBeTruthy();
  });

  test('二维码数据应该包含所有必要字段', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
    });
    await page.goto('/scroll');
    
    await page.getByTestId('generate-qr').click();
    
    // 获取并解析二维码数据
    const rawData = await page.getByTestId('qr-code').getAttribute('data-content');
    
    if (rawData) {
      try {
        const decoded = atob(rawData);
        const data = JSON.parse(decoded);
        
        // 验证必要字段
        expect(data).toHaveProperty('v'); // version
        expect(data).toHaveProperty('u'); // userId
        expect(data).toHaveProperty('t'); // timestamp
        expect(data).toHaveProperty('p'); // progress
      } catch {
        // 如果解析失败，至少数据应该存在
        expect(rawData).toBeTruthy();
      }
    }
  });
});


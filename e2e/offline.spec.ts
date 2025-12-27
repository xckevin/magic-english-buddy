/**
 * 离线功能 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('离线功能', () => {
  test.beforeEach(async ({ page }) => {
    // 先在线加载应用，确保 Service Worker 注册
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
    });
    
    // 等待 Service Worker 激活
    await page.waitForFunction(() => {
      return navigator.serviceWorker.controller !== null;
    }, { timeout: 10000 }).catch(() => {
      // SW 可能未注册，继续测试
    });
    
    // 访问一些页面以缓存资源
    await page.goto('/map');
    await page.waitForTimeout(2000);
  });

  test('离线时应用应该可以加载', async ({ page, context }) => {
    // 设置离线模式
    await context.setOffline(true);
    
    // 刷新页面
    await page.reload();
    
    // 应用应该正常显示
    await expect(page.getByTestId('map-page')).toBeVisible({ timeout: 10000 });
  });

  test('离线时应该能浏览地图', async ({ page, context }) => {
    await context.setOffline(true);
    await page.reload();
    
    // 地图应该可见
    await expect(page.getByTestId('map-canvas')).toBeVisible();
    
    // 节点应该可见
    await expect(page.locator('[data-testid^="map-node"]').first()).toBeVisible();
  });

  test('离线时应该能阅读已缓存的故事', async ({ page, context }) => {
    // 先在线访问故事以缓存
    await page.goto('/reader/l1_001');
    await page.waitForTimeout(2000);
    
    // 切换到离线
    await context.setOffline(true);
    
    // 重新加载
    await page.reload();
    
    // 故事应该正常显示
    await expect(page.getByTestId('story-content')).toBeVisible();
  });

  test('离线时 TTS 应该工作', async ({ page, context }) => {
    // 先在线访问
    await page.goto('/reader/l1_001');
    await page.waitForTimeout(1000);
    
    // 切换到离线
    await context.setOffline(true);
    
    // 点击播放
    await page.getByTestId('play-button').click();
    
    // 应该开始播放（按钮变为暂停）
    await expect(page.getByTestId('pause-button')).toBeVisible();
  });

  test('离线时应该能查词', async ({ page, context }) => {
    await page.goto('/reader/l1_001');
    await page.waitForTimeout(1000);
    
    await context.setOffline(true);
    
    // 长按查词
    const word = page.getByText('apple').first();
    const box = await word.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(600);
      await page.mouse.up();
    }
    
    // 词典应该显示
    await expect(page.getByTestId('dictionary-popup')).toBeVisible();
  });

  test('离线时应该能完成 Quiz', async ({ page, context }) => {
    // 先在线访问 Quiz
    await page.goto('/quiz/l1_001');
    await page.waitForTimeout(1000);
    
    await context.setOffline(true);
    await page.reload();
    
    // Quiz 应该正常显示
    await expect(page.getByTestId('quiz-page')).toBeVisible();
    
    // 应该能答题
    await page.getByTestId('option-red').click();
    
    // 应该有反馈
    await expect(page.locator('[data-testid^="feedback"]')).toBeVisible();
  });

  test('离线时应该能生成二维码', async ({ page, context }) => {
    await page.goto('/scroll');
    await page.waitForTimeout(1000);
    
    await context.setOffline(true);
    await page.reload();
    
    // 卷轴页应该显示
    await expect(page.getByTestId('scroll-page')).toBeVisible();
    
    // 点击生成二维码
    await page.getByTestId('generate-qr').click();
    
    // 二维码应该显示
    await expect(page.getByTestId('qr-code')).toBeVisible();
  });

  test('离线学习数据应该保存', async ({ page, context }) => {
    await page.goto('/quiz/l1_001');
    await page.waitForTimeout(1000);
    
    await context.setOffline(true);
    
    // 完成一道题
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500);
    
    // 刷新页面
    await page.reload();
    
    // 进度应该保持（不再是第一题或者有记录）
    // 这里需要根据实际实现调整断言
  });

  test('网络恢复后应该正常工作', async ({ page, context }) => {
    await context.setOffline(true);
    await page.goto('/map');
    await page.waitForTimeout(1000);
    
    // 恢复网络
    await context.setOffline(false);
    
    // 应该没有错误
    await expect(page.getByTestId('map-page')).toBeVisible();
    
    // 应该能正常导航
    await page.getByTestId('map-node-l1_001').click();
    await expect(page.getByTestId('node-preview')).toBeVisible();
  });
});

test.describe('Service Worker', () => {
  test('Service Worker 应该注册成功', async ({ page }) => {
    await page.goto('/');
    
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('静态资源应该被缓存', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const cacheNames = await page.evaluate(async () => {
      const names = await caches.keys();
      return names;
    });
    
    expect(cacheNames.length).toBeGreaterThan(0);
  });
});


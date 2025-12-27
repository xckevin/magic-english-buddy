/**
 * 阅读流程 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('阅读流程', () => {
  // 在每个测试前设置已完成引导的状态
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 模拟已完成引导的用户
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
      localStorage.setItem('magic-english-storage', JSON.stringify({
        state: {
          settings: { ttsSpeed: 1.0, soundEnabled: true },
          currentUserId: 'test-user-001'
        },
        version: 0
      }));
    });
    
    await page.goto('/map');
  });

  test('应该能从地图进入故事', async ({ page }) => {
    // 等待地图加载
    await expect(page.getByTestId('map-page')).toBeVisible();
    
    // 点击第一个节点
    await page.getByTestId('map-node-l1_001').click();
    
    // 应该显示预览弹窗
    await expect(page.getByTestId('node-preview')).toBeVisible();
    
    // 点击进入
    await page.getByRole('button', { name: /enter|进入|start/i }).click();
    
    // 应该进入阅读器
    await expect(page).toHaveURL(/reader/);
    await expect(page.getByTestId('reader-page')).toBeVisible();
  });

  test('阅读器应该显示故事内容', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 应该显示故事标题
    await expect(page.getByTestId('story-title')).toBeVisible();
    
    // 应该显示故事文本
    await expect(page.getByTestId('story-content')).toBeVisible();
    
    // 应该显示控制栏
    await expect(page.getByTestId('reader-controls')).toBeVisible();
  });

  test('点击播放应该开始 TTS 朗读', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 点击播放按钮
    await page.getByTestId('play-button').click();
    
    // 播放状态应该改变
    await expect(page.getByTestId('pause-button')).toBeVisible();
  });

  test('朗读时应该高亮当前单词', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 点击播放
    await page.getByTestId('play-button').click();
    
    // 等待一段时间让朗读开始
    await page.waitForTimeout(500);
    
    // 应该有单词被高亮
    await expect(page.locator('.word.active')).toBeVisible();
  });

  test('点击单词应该单独发音', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 点击一个单词
    const word = page.getByText('apple').first();
    await word.click();
    
    // 单词应该短暂高亮
    await expect(word).toHaveClass(/active|highlight/);
  });

  test('长按单词应该显示词典', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 长按单词
    const word = page.getByText('apple').first();
    const box = await word.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(600);
      await page.mouse.up();
    }
    
    // 应该显示词典弹窗
    await expect(page.getByTestId('dictionary-popup')).toBeVisible();
  });

  test('词典应该显示完整信息', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 长按单词
    const word = page.getByText('apple').first();
    const box = await word.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(600);
      await page.mouse.up();
    }
    
    // 检查词典内容
    await expect(page.getByTestId('dictionary-popup')).toContainText('apple');
    await expect(page.getByTestId('dictionary-popup')).toContainText(/苹果|fruit/i);
    await expect(page.getByTestId('dictionary-emoji')).toBeVisible();
  });

  test('应该能切换语速', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 点击语速按钮
    await page.getByTestId('speed-button').click();
    
    // 选择 0.8x
    await page.getByText('0.8x').click();
    
    // 语速应该改变
    await expect(page.getByTestId('speed-button')).toContainText('0.8');
  });

  test('完成阅读应该跳转到 Quiz', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 滚动到底部或点击完成按钮
    await page.getByRole('button', { name: /finish|完成|quiz/i }).click();
    
    // 应该进入 Quiz 页面
    await expect(page).toHaveURL(/quiz/);
  });

  test('应该能返回地图', async ({ page }) => {
    await page.goto('/reader/l1_001');
    
    // 点击返回按钮
    await page.getByTestId('back-button').click();
    
    // 应该返回地图
    await expect(page).toHaveURL(/map/);
  });
});

test.describe('影子跟读', () => {
  test.beforeEach(async ({ page }) => {
    // 设置已完成引导
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
    });
    await page.goto('/reader/l1_001');
  });

  test('应该能进入 Echo 模式', async ({ page }) => {
    // 点击跟读按钮
    await page.getByTestId('echo-button').click();
    
    // 应该显示跟读界面
    await expect(page.getByTestId('shadowing-recorder')).toBeVisible();
  });

  test('Echo 模式应该先播放示范', async ({ page }) => {
    await page.getByTestId('echo-button').click();
    
    // 点击播放示范
    await page.getByTestId('play-original').click();
    
    // 应该显示播放状态
    await expect(page.getByTestId('original-playing')).toBeVisible();
  });

  test('应该能录制用户声音', async ({ page, context }) => {
    // 授予麦克风权限
    await context.grantPermissions(['microphone']);
    
    await page.getByTestId('echo-button').click();
    
    // 点击录音按钮
    await page.getByTestId('record-button').click();
    
    // 应该显示录音状态
    await expect(page.getByTestId('recording-indicator')).toBeVisible();
    
    // 等待一段时间
    await page.waitForTimeout(2000);
    
    // 停止录音
    await page.getByTestId('stop-record-button').click();
    
    // 应该显示录音完成
    await expect(page.getByTestId('recording-complete')).toBeVisible();
  });

  test('应该显示波形对比', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    await page.getByTestId('echo-button').click();
    await page.getByTestId('record-button').click();
    await page.waitForTimeout(2000);
    await page.getByTestId('stop-record-button').click();
    
    // 应该显示波形对比
    await expect(page.getByTestId('waveform-original')).toBeVisible();
    await expect(page.getByTestId('waveform-recorded')).toBeVisible();
  });
});


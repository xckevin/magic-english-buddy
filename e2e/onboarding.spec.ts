/**
 * 新手引导 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('新手引导流程', () => {
  test.beforeEach(async ({ page }) => {
    // 清除存储，模拟新用户
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('MagicEnglishBuddy');
    });
    await page.reload();
  });

  test('新用户应该看到引导页', async ({ page }) => {
    await page.goto('/');
    
    // 等待页面加载
    await expect(page.getByTestId('onboarding-page')).toBeVisible();
    
    // 应该显示魔法蛋
    await expect(page.getByTestId('magic-egg')).toBeVisible();
  });

  test('应该显示星空背景', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByTestId('magic-background')).toBeVisible();
  });

  test('应该显示引导文字', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/touch.*hold.*awaken/i)).toBeVisible();
  });

  test('长按魔法蛋应该触发孵化', async ({ page }) => {
    await page.goto('/');
    
    // 找到魔法蛋
    const egg = page.getByTestId('magic-egg');
    await expect(egg).toBeVisible();
    
    // 模拟长按 (2秒)
    const box = await egg.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(2000);
      await page.mouse.up();
    }
    
    // 应该显示孵化动画
    await expect(page.getByTestId('hatch-animation')).toBeVisible({ timeout: 5000 });
  });

  test('孵化后应该显示起名界面', async ({ page }) => {
    await page.goto('/');
    
    // 触发孵化
    const egg = page.getByTestId('magic-egg');
    const box = await egg.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(2000);
      await page.mouse.up();
    }
    
    // 等待动画完成
    await page.waitForTimeout(3000);
    
    // 应该显示名字输入框
    await expect(page.getByPlaceholder(/name/i)).toBeVisible({ timeout: 5000 });
  });

  test('输入名字后应该进入地图', async ({ page }) => {
    await page.goto('/');
    
    // 触发孵化
    const egg = page.getByTestId('magic-egg');
    const box = await egg.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(2000);
      await page.mouse.up();
    }
    
    // 等待动画
    await page.waitForTimeout(3000);
    
    // 输入名字
    await page.getByPlaceholder(/name/i).fill('TestBuddy');
    await page.getByRole('button', { name: /confirm|确认|start/i }).click();
    
    // 应该跳转到地图页
    await expect(page).toHaveURL(/map/);
    await expect(page.getByTestId('map-page')).toBeVisible({ timeout: 5000 });
  });

  test('空名字应该显示错误提示', async ({ page }) => {
    await page.goto('/');
    
    // 快速跳过孵化（如果有跳过按钮）或触发孵化
    const egg = page.getByTestId('magic-egg');
    const box = await egg.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(2000);
      await page.mouse.up();
    }
    
    await page.waitForTimeout(3000);
    
    // 不输入名字直接点击确认
    await page.getByRole('button', { name: /confirm|确认|start/i }).click();
    
    // 应该显示错误提示
    await expect(page.getByText(/please enter|请输入|required/i)).toBeVisible();
  });

  test('完成引导后刷新应该直接进入地图', async ({ page }) => {
    await page.goto('/');
    
    // 完成引导流程
    const egg = page.getByTestId('magic-egg');
    const box = await egg.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(2000);
      await page.mouse.up();
    }
    
    await page.waitForTimeout(3000);
    await page.getByPlaceholder(/name/i).fill('TestBuddy');
    await page.getByRole('button', { name: /confirm|确认|start/i }).click();
    
    // 等待进入地图
    await expect(page).toHaveURL(/map/);
    
    // 刷新页面
    await page.reload();
    
    // 应该直接在地图页，不再显示引导
    await expect(page).toHaveURL(/map/);
    await expect(page.getByTestId('onboarding-page')).not.toBeVisible();
  });
});


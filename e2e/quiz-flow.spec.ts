/**
 * Quiz 流程 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('Quiz 流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('app_initialized', 'true');
    });
    await page.goto('/quiz/l1_001');
  });

  test('应该显示 Quiz 页面', async ({ page }) => {
    await expect(page.getByTestId('quiz-page')).toBeVisible();
  });

  test('应该显示进度指示器', async ({ page }) => {
    await expect(page.getByTestId('quiz-progress')).toBeVisible();
    await expect(page.getByText(/1.*\/.*\d+/)).toBeVisible();
  });

  test('听音辨图 - 选择正确答案', async ({ page }) => {
    // 等待第一道题加载
    await expect(page.getByTestId('image-choice-quiz')).toBeVisible();
    
    // 选择正确选项
    await page.getByTestId('option-red').click();
    
    // 应该显示正确反馈
    await expect(page.getByTestId('feedback-correct')).toBeVisible();
  });

  test('听音辨图 - 选择错误答案', async ({ page }) => {
    await expect(page.getByTestId('image-choice-quiz')).toBeVisible();
    
    // 选择错误选项
    await page.getByTestId('option-blue').click();
    
    // 应该显示错误反馈
    await expect(page.getByTestId('feedback-wrong')).toBeVisible();
    
    // 应该显示正确答案
    await expect(page.getByTestId('correct-answer')).toBeVisible();
  });

  test('单词拼装 - 完成拼写', async ({ page }) => {
    // 跳过第一题到达单词拼装题
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500); // 等待反馈动画
    
    // 应该显示单词拼装题
    await expect(page.getByTestId('word-builder-quiz')).toBeVisible();
    
    // 点击字母完成拼写 "apple"
    await page.getByTestId('letter-a').click();
    await page.getByTestId('letter-p').first().click();
    await page.getByTestId('letter-p').last().click();
    await page.getByTestId('letter-l').click();
    await page.getByTestId('letter-e').click();
    
    // 应该自动判断并显示正确反馈
    await expect(page.getByTestId('feedback-correct')).toBeVisible();
  });

  test('句子排序 - 拖拽排序', async ({ page }) => {
    // 跳过前两题
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500);
    
    // 跳过单词拼装
    await page.getByTestId('letter-a').click();
    await page.getByTestId('letter-p').first().click();
    await page.getByTestId('letter-p').last().click();
    await page.getByTestId('letter-l').click();
    await page.getByTestId('letter-e').click();
    await page.waitForTimeout(1500);
    
    // 应该显示句子排序题
    await expect(page.getByTestId('sentence-order-quiz')).toBeVisible();
    
    // 按正确顺序点击单词
    await page.getByTestId('word-The').click();
    await page.getByTestId('word-apple').click();
    await page.getByTestId('word-is').click();
    await page.getByTestId('word-red').click();
    
    // 应该显示正确反馈
    await expect(page.getByTestId('feedback-correct')).toBeVisible();
  });

  test('完成所有题目应该显示结果', async ({ page }) => {
    // 完成所有题目（简化流程）
    // 第一题
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500);
    
    // 第二题
    await page.getByTestId('letter-a').click();
    await page.getByTestId('letter-p').first().click();
    await page.getByTestId('letter-p').last().click();
    await page.getByTestId('letter-l').click();
    await page.getByTestId('letter-e').click();
    await page.waitForTimeout(1500);
    
    // 第三题
    await page.getByTestId('word-The').click();
    await page.getByTestId('word-apple').click();
    await page.getByTestId('word-is').click();
    await page.getByTestId('word-red').click();
    await page.waitForTimeout(1500);
    
    // 应该显示结果页
    await expect(page.getByTestId('quiz-result')).toBeVisible();
  });

  test('结果页应该显示得分', async ({ page }) => {
    // 完成所有题目
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('letter-a').click();
    await page.getByTestId('letter-p').first().click();
    await page.getByTestId('letter-p').last().click();
    await page.getByTestId('letter-l').click();
    await page.getByTestId('letter-e').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('word-The').click();
    await page.getByTestId('word-apple').click();
    await page.getByTestId('word-is').click();
    await page.getByTestId('word-red').click();
    await page.waitForTimeout(1500);
    
    // 检查结果
    await expect(page.getByTestId('quiz-result')).toBeVisible();
    await expect(page.getByTestId('score')).toContainText(/\d+/);
    await expect(page.getByTestId('magic-power-earned')).toBeVisible();
  });

  test('全对应该显示完美提示', async ({ page }) => {
    // 假设全部答对
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('letter-a').click();
    await page.getByTestId('letter-p').first().click();
    await page.getByTestId('letter-p').last().click();
    await page.getByTestId('letter-l').click();
    await page.getByTestId('letter-e').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('word-The').click();
    await page.getByTestId('word-apple').click();
    await page.getByTestId('word-is').click();
    await page.getByTestId('word-red').click();
    await page.waitForTimeout(1500);
    
    // 应该显示完美提示
    await expect(page.getByText(/perfect|完美|100/i)).toBeVisible();
  });

  test('返回地图应该解锁下一节点', async ({ page }) => {
    // 完成 Quiz
    await page.getByTestId('option-red').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('letter-a').click();
    await page.getByTestId('letter-p').first().click();
    await page.getByTestId('letter-p').last().click();
    await page.getByTestId('letter-l').click();
    await page.getByTestId('letter-e').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('word-The').click();
    await page.getByTestId('word-apple').click();
    await page.getByTestId('word-is').click();
    await page.getByTestId('word-red').click();
    await page.waitForTimeout(1500);
    
    // 点击继续
    await page.getByRole('button', { name: /continue|继续|map/i }).click();
    
    // 应该返回地图
    await expect(page).toHaveURL(/map/);
    
    // 下一个节点应该解锁
    await expect(page.getByTestId('map-node-l1_002')).not.toHaveClass(/locked/);
  });
});


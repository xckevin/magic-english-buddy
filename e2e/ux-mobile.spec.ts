import { test, expect } from '@playwright/test';

const root = '/magic-english-buddy/';
async function startSharedSession(page: import('@playwright/test').Page) {
  await page.goto(root);
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await expect(page.getByRole('heading', { name: '一起学英语', exact: true })).toBeVisible();
}

test('shared phone: read, look up, practice, and persist progress', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await startSharedSession(page);
  const start = page.getByRole('button', { name: '开始第一个故事' });
  await expect(start).toBeInViewport();
  await page.screenshot({ path: 'docs/ux-evidence/phone-map.png' });
  const locked = page.getByRole('button', { name: '小猫咪，未解锁，查看条件' });
  await locked.click();
  await expect(page.getByRole('dialog')).toContainText('先完成');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(locked).toBeFocused();
  await start.click();
  await expect(page.getByRole('heading', { name: 'The Magic Apple' })).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('p')
        .evaluateAll(paragraphs => paragraphs.every(p => p.scrollWidth <= p.clientWidth))
    )
    .toBe(true);
  await page.getByRole('button', { name: '查询单词 apple', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('苹果');
  await page.getByRole('button', { name: /加入生词本/ }).click();
  await expect(page.getByRole('button', { name: /已加入生词本/ })).toBeDisabled();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.screenshot({ path: 'docs/ux-evidence/phone-reader.png' });
  await page.getByRole('button', { name: /读完了，去练一练/ }).click();
  await expect(page).toHaveURL(/quiz\/l1_001/);
  await expect(page.getByText('What color is the apple?', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Green/ })).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'docs/ux-evidence/phone-quiz.png' });
  for (const answer of ['Red', 'Rabbit', 'Happy']) {
    await page.getByRole('button', { name: new RegExp(answer) }).click();
    const next = page.getByRole('button', { name: /继续/ });
    await expect(next).toBeVisible();
    await next.click();
  }
  await page.getByRole('button', { name: /完成/ }).click();
  await expect(page).toHaveURL(/map/);
  await expect(page.getByRole('button', { name: '魔法苹果，已完成，可重温' })).toBeVisible();
  await expect(page.getByRole('button', { name: '小猫咪，可以开始' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '小猫咪，可以开始' })).toBeVisible();
  await page.getByRole('link', { name: '成长记录', exact: true }).click();
  await page.getByRole('button', { name: /卡牌/ }).click();
  await expect(page.getByText('apple', { exact: true })).toBeVisible();
  const card = page.getByRole('button', { name: 'apple，点按查看意思' });
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'apple：苹果，点按查看英文' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await page.getByRole('button', { name: /总览/ }).click();
  await expect(page.getByRole('heading', { name: '小精灵' })).toBeVisible();
  await page.screenshot({ path: 'docs/ux-evidence/phone-growth.png' });
  await page.getByRole('button', { name: /成就/ }).click();
  await expect(page.getByText('尚未解锁').first()).toBeVisible();
  await page.getByRole('button', { name: /导出/ }).click();
  await expect(page.getByRole('textbox', { name: '可复制的学习摘要' })).not.toHaveValue('');
  await expect(page.getByRole('button', { name: '复制学习摘要' })).toBeEnabled();
});

test('large reading text and a landscape tablet keep controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await startSharedSession(page);
  await page.getByRole('button', { name: '开始第一个故事' }).click();
  await expect(page.getByRole('heading', { name: 'The Magic Apple' })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const firstWord = page.getByRole('button', { name: '查询单词 Once', exact: true });
  await firstWord.evaluate(el => el.scrollIntoView({ block: 'start' }));
  await expect(firstWord).toBeInViewport({ ratio: 0.99 });
  await expect
    .poll(() => page.locator('#story-content').evaluate(el => el.clientHeight))
    .toBeGreaterThan(200);
  await expect(page.getByRole('button', { name: /读完了，去练一练/ })).toBeInViewport({
    ratio: 0.99,
  });
  await expect
    .poll(() =>
      page
        .locator('p')
        .evaluateAll(paragraphs => paragraphs.every(p => p.scrollWidth <= p.clientWidth))
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: 'docs/ux-evidence/phone-large-text.png' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
  await page.setViewportSize({ width: 1180, height: 820 });
  await expect(page.getByRole('button', { name: /读完了，去练一练/ })).toBeInViewport();
  await page.screenshot({ path: 'docs/ux-evidence/tablet-reader-landscape.png' });
});

test('narrow phone settings and shared onboarding stay reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(root);
  await expect(page.getByRole('button', { name: '直接开始，一起学英语' })).toBeInViewport();
  await page.screenshot({ path: 'docs/ux-evidence/phone-onboarding.png' });
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await page.getByRole('link', { name: '设置', exact: true }).click();
  const translation = page.getByRole('switch', { name: '显示翻译' });
  await translation.click();
  await expect(translation).toBeChecked();
  await page.reload();
  await expect(translation).toBeChecked();
  await page.getByRole('button', { name: /重置设置/ }).click();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(translation).toBeChecked();
  await page.screenshot({ path: 'docs/ux-evidence/phone-settings.png' });
  await page.getByRole('link', { name: '魔法地图', exact: true }).click();
  await page.getByRole('button', { name: '开始第一个故事' }).click();
  await expect(page.getByText('从前，有一个红苹果。', { exact: true })).toBeVisible();
  const complete = page.getByRole('button', { name: /读完了，去练一练/ });
  await expect(complete).toBeInViewport();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

test('tablet and dark phone preserve the same navigation', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await startSharedSession(page);
  await page.screenshot({ path: 'docs/ux-evidence/tablet-map.png' });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(page.getByRole('button', { name: '开始第一个故事' })).toBeInViewport();
  await page.screenshot({ path: 'docs/ux-evidence/phone-dark.png' });
  await page.getByRole('link', { name: '成长记录', exact: true }).click();
  await page.getByRole('button', { name: /卡牌/ }).click();
  await expect(page.getByRole('button', { name: /开始|地图|探索/ })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

test('downloaded lessons, dictionary and practice work after going offline', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await startSharedSession(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: '开始第一个故事' }).click();
  await expect(page.getByRole('heading', { name: 'The Magic Apple' })).toBeVisible();
  await page.getByRole('button', { name: '查询单词 apple', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('苹果');
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('button', { name: /读完了，去练一练/ }).click();
  await expect(page.getByText('What color is the apple?', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Red/ })).toBeVisible();
  await context.setOffline(false);
});

import { expect, test, type Page } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';

const root = '/magic-english-buddy';
async function start(page: Page) {
  await page.goto(`${root}/`);
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await expect(page).toHaveURL(/\/map$/);
}
async function rows(page: Page, table: string) {
  return page.evaluate(async table => {
    const request = indexedDB.open('MagicEnglishBuddy');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
        const query = database.transaction(table).objectStore(table).getAll();
        query.onsuccess = () => resolve(query.result);
        query.onerror = () => reject(query.error);
      });
    } finally {
      database.close();
    }
  }, table);
}

test('unfinished quiz restores feedback after reload and commits only once', async ({ page }) => {
  await start(page);
  await page.goto(`${root}/quiz/l1_001`);
  await page.getByRole('button', { name: 'Red', exact: true }).click();
  await expect.poll(async () => (await rows(page, 'quizDrafts'))[0]?.stage).toBe('feedback');
  await page.reload();
  await page.getByRole('button', { name: /继续/ }).click();
  await expect(page.getByRole('button', { name: 'Rabbit', exact: true })).toBeVisible();
  for (const answer of ['Rabbit', 'Happy']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.getByRole('button', { name: /继续/ }).click();
  }
  await expect.poll(async () => (await rows(page, 'quizDrafts'))[0]?.stage).toBe('result');
  await page.reload();
  await expect(page.getByRole('heading', { name: '太厉害了！' })).toBeVisible();
  await page.getByRole('button', { name: /完成/ }).click();
  await expect(page).toHaveURL(/\/map$/);
  expect(await rows(page, 'quizDrafts')).toHaveLength(0);
  expect(await rows(page, 'quizHistory')).toHaveLength(1);
  expect((await rows(page, 'userProgress'))[0].magicPower).toBe(19);
});

test('exports a learning backup, previews it on a fresh device, and restores cards and progress', async ({
  page,
  browser,
}, testInfo) => {
  await start(page);
  await page.goto(`${root}/quiz/l1_001`);
  for (const answer of ['Red', 'Rabbit', 'Happy']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.getByRole('button', { name: /继续/ }).click();
  }
  await page.getByRole('button', { name: /完成/ }).click();
  await expect(page).toHaveURL(/\/map$/);
  const originalUser = (await rows(page, 'users'))[0];
  await page.goto(`${root}/settings`);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出学习备份', exact: true }).click();
  const download = await downloadPromise;
  const backupPath = testInfo.outputPath('learning-backup.json');
  await download.saveAs(backupPath);
  const text = await readFile(backupPath, 'utf8');
  expect(JSON.parse(text).mapStates).toHaveLength(90);
  // A second open screen must stop using the old state after a restore.
  const observer = await page.context().newPage();
  await observer.goto(new URL(`${root}/quiz/l1_001`, page.url()).href);
  await expect(observer.getByRole('button', { name: 'Red', exact: true })).toBeVisible();
  await page.getByLabel('选择学习备份文件').setInputFiles(backupPath);
  await page.getByRole('checkbox', { name: '我确认用这份备份替换当前学习记录' }).check();
  await page.getByRole('button', { name: '确认恢复', exact: true }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(observer).toHaveURL(/\/map$/);
  await observer.close();
  const context = await browser.newContext();
  try {
    const fresh = await context.newPage();
    await fresh.goto(new URL(`${root}/`, page.url()).href);
    await fresh.getByRole('button', { name: '已有学习记录？恢复备份或管理档案' }).click();
    const file = fresh.getByLabel('选择学习备份文件');
    await file.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"version":99}'),
    });
    await expect(fresh.getByRole('alert')).toContainText('备份');
    expect(await rows(fresh, 'users')).toHaveLength(0);
    await file.setInputFiles(backupPath);
    await expect(fresh.getByRole('dialog', { name: '恢复学习备份' })).toBeVisible();
    expect(await rows(fresh, 'users')).toHaveLength(0);
    await fresh.getByRole('checkbox', { name: '我确认用这份备份替换当前学习记录' }).check();
    await fresh.getByRole('button', { name: '确认恢复', exact: true }).click();
    await expect(fresh).toHaveURL(/\/map$/);
    expect((await rows(fresh, 'users'))[0].id).toBe(originalUser.id);
    expect((await rows(fresh, 'userProgress'))[0].magicPower).toBe(19);
    expect((await rows(fresh, 'userVocabulary')).length).toBeGreaterThan(0);
    await fresh.reload();
    await expect(fresh.getByRole('heading', { name: '一起学英语', exact: true })).toBeVisible();
    await fresh.screenshot({ path: testInfo.outputPath('restored-map.png'), fullPage: false });
  } finally {
    await context.close();
  }
});

test('due vocabulary review updates mastery once and remains saved after reload', async ({
  page,
}, testInfo) => {
  await start(page);
  await page.evaluate(async () => {
    const request = indexedDB.open('MagicEnglishBuddy');
    const database = await new Promise<IDBDatabase>(resolve => {
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(['users', 'userVocabulary'], 'readwrite');
      const users = tx.objectStore('users').getAll();
      users.onsuccess = () => {
        const userId = users.result[0].id;
        tx.objectStore('userVocabulary').put({
          id: `${userId}_apple`,
          userId,
          word: 'apple',
          firstSeen: 1,
          lastReviewed: 1,
          correctCount: 0,
          wrongCount: 0,
          masteryLevel: 1,
          nextReviewDate: '2000-01-01',
          isCard: true,
          cardRarity: 'white',
        });
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  });
  await page.goto(`${root}/scroll`);
  await page.getByRole('button', { name: /卡牌/ }).click();
  await page.getByRole('link', { name: '复习收藏的单词 →' }).click();
  await expect(page.getByRole('heading', { name: 'apple', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '苹果', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('答对了');
  expect((await rows(page, 'userVocabulary'))[0].masteryLevel).toBe(2);
  expect((await rows(page, 'userVocabulary'))[0].correctCount).toBe(1);
  await page.screenshot({ path: testInfo.outputPath('review-feedback.png'), fullPage: false });
  await page.reload();
  await expect(page.getByText('提前练习，不改变复习日期', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '苹果', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('不重复累计');
  expect((await rows(page, 'userVocabulary'))[0].correctCount).toBe(1);
});

test('a stale lazy settings chunk reloads once and keeps the local profile', async ({
  browser,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL as string;
  const context = await browser.newContext({ serviceWorkers: 'block' });
  try {
    const page = await context.newPage();
    const indexHtml = await readFile('dist/index.html', 'utf8');
    const entrySource = indexHtml.match(/<script type="module" crossorigin src="([^"]+)"/)?.[1];
    if (!entrySource) throw new Error('Could not find the production entry module');
    const assets = await readdir('dist/assets');
    let settingsAsset: string | undefined;
    for (const asset of assets) {
      if (
        asset.endsWith('.js') &&
        (await readFile(`dist/assets/${asset}`, 'utf8')).includes('导出学习备份')
      ) {
        settingsAsset = asset;
        break;
      }
    }
    if (!settingsAsset) throw new Error('Could not find the production settings chunk');
    const entryPath = new URL(entrySource, baseURL).pathname;
    const staleSettingsAsset = 'old-settings-e2e.js';
    let servedOldEntry = false;
    let missingChunks = 0;
    await page.route('**/assets/*.js', async route => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname === entryPath && !servedOldEntry) {
        servedOldEntry = true;
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), 'Cache-Control': 'no-store' },
          body: (await response.text()).replaceAll(settingsAsset, staleSettingsAsset),
        });
        return;
      }
      if (requestUrl.pathname.endsWith(`/${staleSettingsAsset}`)) {
        missingChunks++;
        await route.fulfill({
          status: 404,
          contentType: 'text/javascript',
          headers: { 'Cache-Control': 'no-store' },
          body: '/* stale chunk removed by deployment */',
        });
        return;
      }
      await route.continue();
    });
    await page.goto(new URL(`${root}/`, baseURL).href);
    await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
    await expect(page.getByRole('heading', { name: '一起学英语', exact: true })).toBeVisible();
    const originalUserId = (await rows(page, 'users'))[0]!.id;
    let documentReloads = 0;
    page.on('load', () => {
      documentReloads++;
    });

    await page.getByRole('link', { name: '设置', exact: true }).click();

    await expect(page.getByRole('heading', { name: '设置', exact: true })).toBeVisible();
    expect(missingChunks).toBe(1);
    expect(documentReloads).toBe(1);
    expect((await rows(page, 'users'))[0]!.id).toBe(originalUserId);

    // A second Vite preload error in this tab session must leave the recovered
    // document usable instead of initiating another full-page reload.
    await page.evaluate(() => {
      window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
    });
    await page.waitForTimeout(150);
    expect(documentReloads).toBe(1);
    await expect(page.getByRole('heading', { name: '设置', exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});

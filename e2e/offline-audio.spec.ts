import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(
  readFileSync(new URL('../src/data/audio/manifest.json', import.meta.url), 'utf8')
) as {
  clips: Record<string, { file: string }>;
};

const root = '/magic-english-buddy';
const cacheName = 'magic-english-audio-v1';

async function openSettings(page: Page) {
  await page.goto(`${root}/`);
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await page.getByRole('link', { name: '设置', exact: true }).click();
  await expect(page.getByRole('button', { name: '下载全部音频', exact: true })).toBeEnabled();
}

async function savedFiles(page: Page) {
  return page.evaluate(async name => {
    const keys = await (await caches.open(name)).keys();
    return keys
      .filter(request => /\/audio\/.+\.mp3$/.test(request.url))
      .map(request => request.url);
  }, cacheName);
}

test('all audio is opt-in, survives offline reload, and can be removed without deleting learning data', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Full offline service-worker reload is covered in Chromium'
  );
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
  });
  const audioRequests: string[] = [];
  context.on('request', request => {
    if (/\/audio\/.+\.mp3/.test(request.url())) audioRequests.push(request.url());
  });
  await openSettings(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  expect(audioRequests).toEqual([]);
  expect(await savedFiles(page)).toEqual([]);
  await page.getByRole('button', { name: '下载全部音频', exact: true }).click();
  await expect(page.getByRole('button', { name: '已全部下载', exact: true })).toBeVisible({
    timeout: 150_000,
  });
  const expectedFiles = new Set(Object.values(manifest.clips).map(clip => clip.file));
  expect((await savedFiles(page)).length).toBe(expectedFiles.size);
  await expect(page.getByText('可离线使用', { exact: true })).toHaveCount(8);
  // Fixture opens an advanced course so the offline player also exercises new L7 clips.
  await page.evaluate(async () => {
    const request = indexedDB.open('MagicEnglishBuddy');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(['mapNodes', 'userProgress'], 'readwrite');
      const lookup = tx.objectStore('mapNodes').index('storyId').get('l7_001');
      lookup.onsuccess = () => {
        const cursor = tx.objectStore('userProgress').openCursor();
        cursor.onsuccess = () => {
          const row = cursor.result;
          if (!row) return;
          row.update({ ...row.value, unlockedNodes: [...row.value.unlockedNodes, lookup.result.id] });
          row.continue();
        };
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto(`${root}/reader/l7_001`);
  const requestCount = audioRequests.length;
  await page.getByRole('button', { name: /播放$/ }).click();
  await expect(page.getByRole('button', { name: /暂停$/ })).toBeVisible();
  await page.getByRole('button', { name: /停止$/ }).click();
  expect(audioRequests.length).toBe(requestCount);
  await page.goto(`${root}/settings`);
  await expect(page.getByRole('button', { name: '已全部下载', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '删除全部音频', exact: true }).click();
  await expect.poll(() => savedFiles(page)).toEqual([]);
  await expect(page.getByText('未下载', { exact: true })).toHaveCount(8);
  await page.getByRole('link', { name: '魔法地图', exact: true }).click();
  await expect(page.getByRole('heading', { name: '一起学英语', exact: true })).toBeVisible();
  await context.setOffline(false);
});

test('a failed package download resumes from saved files after reload', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Fault injection regression uses Chromium');
  test.setTimeout(90_000);
  await openSettings(page);
  let requests = 0;
  await page.route('**/audio/*.mp3', async route => {
    requests += 1;
    if (requests > 6) await route.abort('internetdisconnected');
    else await route.continue();
  });
  await page.getByRole('button', { name: '下载 L1 音频', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  const partial = await savedFiles(page);
  expect(partial.length).toBeGreaterThan(0);
  await page.unroute('**/audio/*.mp3');
  const retried: string[] = [];
  page.on('request', request => {
    if (/\/audio\/.+\.mp3/.test(request.url())) retried.push(request.url());
  });
  await page.reload();
  const pack = page.getByRole('listitem', { name: 'L1 音频包', exact: true });
  await expect(pack.getByText('已下载一部分', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '下载 L1 音频', exact: true }).click();
  await expect(pack.getByText('可离线使用', { exact: true })).toBeVisible({ timeout: 45_000 });
  expect(retried.some(url => partial.includes(url))).toBe(false);
  await page.getByRole('button', { name: '删除 L1 音频', exact: true }).click();
  await expect(pack.getByText('未下载', { exact: true })).toBeVisible();
});

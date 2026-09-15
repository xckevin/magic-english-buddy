import { test, expect, type Page } from '@playwright/test';

const root = '/magic-english-buddy';
async function start(page: Page) {
  await page.goto(`${root}/`);
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await expect(page.getByRole('heading', { name: '一起学英语', exact: true })).toBeVisible();
}

async function records(page: Page, table: string) {
  return page.evaluate(async tableName => {
    const request = indexedDB.open('MagicEnglishBuddy');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<Array<Record<string, any>>>((resolve, reject) => {
        const query = database.transaction(tableName).objectStore(tableName).getAll();
        query.onsuccess = () => resolve(query.result);
        query.onerror = () => reject(query.error);
      });
    } finally {
      database.close();
    }
  }, table);
}

async function finishAppleQuiz(page: Page) {
  for (const answer of ['Red', 'Rabbit', 'Happy']) {
    await page.getByRole('button', { name: new RegExp(`^${answer}$`) }).click();
    await page.getByRole('button', { name: /继续/ }).click();
  }
  await expect(page.getByRole('heading', { name: '太厉害了！' })).toBeVisible();
  await page.getByRole('button', { name: /完成/ }).click();
  await expect(page).toHaveURL(/\/map$/);
}

test('deep links respect missing profiles and locked lessons', async ({ page }) => {
  await page.goto(`${root}/quiz/l7_001`);
  await expect(page.getByRole('button', { name: '直接开始，一起学英语' })).toBeVisible();
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await expect(page).toHaveURL(/\/map$/);
  for (const kind of ['reader', 'quiz']) {
    await page.goto(`${root}/${kind}/l7_001`);
    await expect(page.getByRole('heading', { name: '这个关卡还不能开始' })).toBeVisible();
  }
  expect(await records(page, 'quizHistory')).toHaveLength(0);
});

test('first pass grants cards and achievements; replay preserves history without extra rewards', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: '开始第一个故事' }).click();
  await page.getByRole('button', { name: /读完了，去练一练/ }).click();
  await finishAppleQuiz(page);
  const firstPower = (await records(page, 'userProgress'))[0].magicPower;
  expect(firstPower).toBe(19);
  expect((await records(page, 'userVocabulary')).length).toBeGreaterThan(0);
  expect((await records(page, 'achievements')).some(a => a.achievementId === 'first_story')).toBe(
    true
  );
  await page.goto(`${root}/quiz/l1_001`);
  await finishAppleQuiz(page);
  expect((await records(page, 'userProgress'))[0].magicPower).toBe(firstPower);
  expect(await records(page, 'quizHistory')).toHaveLength(2);
  await page.goto(`${root}/scroll`);
  await page.getByRole('button', { name: /成就/ }).click();
  await page.getByRole('button', { name: '领取 10 魔力值', exact: true }).click();
  const claimedPower = (await records(page, 'userProgress'))[0].magicPower;
  expect(claimedPower).toBeGreaterThan(firstPower);
  await page.reload();
  await page.getByRole('button', { name: /成就/ }).click();
  await expect(page.getByRole('button', { name: '领取 10 魔力值', exact: true })).toHaveCount(0);
  expect((await records(page, 'userProgress'))[0].magicPower).toBe(claimedPower);
});

test('legacy image questions display useful illustrations instead of missing file paths', async ({
  page,
}) => {
  await start(page);
  // Fixture: unlock a later lesson to inspect the original affected L2 content.
  await page.evaluate(async () => {
    const request = indexedDB.open('MagicEnglishBuddy');
    const database = await new Promise<IDBDatabase>(resolve => {
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction('mapNodes', 'readwrite');
      const store = tx.objectStore('mapNodes');
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const item = cursor.result;
        if (!item) return;
        if (item.value.storyId === 'l2_001') item.update({ ...item.value, unlocked: true });
        item.continue();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  });
  await page.goto(`${root}/quiz/l2_001`);
  await expect(page.getByRole('button', { name: 'sings', exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('/assets/quiz/');
  await page.getByRole('button', { name: 'sings', exact: true }).click();
  await page.getByRole('button', { name: /继续/ }).click();
  await page.getByRole('button', { name: /beautiful/ }).click();
  await page.getByRole('button', { name: /继续/ }).click();
  await expect(page.getByText('排列句子顺序', { exact: true })).toBeVisible();
});

test('recording uses the browser encoder and can be replayed without a render loop', async ({
  page,
  browserName,
  context,
}) => {
  test.skip(browserName !== 'chromium', 'Fake microphone device is configured for Chromium');
  await context.grantPermissions(['microphone']);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await start(page);
  await page.getByRole('button', { name: '开始第一个故事' }).click();
  await page.getByRole('button', { name: '打开跟读练习' }).click();
  await page.getByRole('button', { name: /下一段/ }).click();
  await expect(
    page.getByLabel('跟读录音').getByText('The apple was very big and shiny.', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: '开始录音', exact: true }).click();
  await expect(page.getByText(/正在录音 0:0[1-9]/)).toBeVisible();
  await page.getByRole('button', { name: '停止录音', exact: true }).click();
  await expect(page.getByText('录好了，可以回放')).toBeVisible();
  await page.getByRole('button', { name: /听我的录音/ }).click();
  await expect(page.getByRole('button', { name: /停止回放/ })).toBeVisible();
  await page.getByRole('button', { name: /停止回放/ }).click();
  await page.getByRole('button', { name: /下一段/ }).click();
  await expect(page.getByRole('button', { name: /听我的录音/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '开始录音', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '收起跟读练习' }).click();
  expect(errors).toEqual([]);
});

test('bundled narration works without Web Speech, including pause and shadowing', async ({
  page,
  context,
  browserName,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
  });
  await start(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  // Chromium covers full offline reload. WebKit 26's automation reload fails
  // internally with a controlling SW; its run covers real decoding/activation.
  // https://github.com/microsoft/playwright/issues/42273
  if (browserName === 'chromium') {
    await context.setOffline(true);
    await page.reload();
  }
  await page.getByRole('button', { name: '开始第一个故事' }).click();
  await page.getByRole('button', { name: /播放$/ }).click();
  await expect(page.getByRole('button', { name: /暂停$/ })).toBeVisible();
  await page.getByRole('button', { name: /暂停$/ }).click();
  await expect(page.getByRole('button', { name: /继续$/ })).toBeVisible();
  await page.getByRole('button', { name: /继续$/ }).click();
  await expect(page.getByRole('button', { name: /暂停$/ })).toBeVisible();
  await page.getByRole('button', { name: /停止$/ }).click();
  await page.getByRole('button', { name: '打开跟读练习' }).click();
  await page.getByRole('button', { name: /听示范/ }).click();
  await expect(page.getByRole('button', { name: /停止示范/ })).toBeVisible();
  // A shadowing demonstration must not put the full-story controls into playing state.
  await expect(page.getByRole('button', { name: /播放$/ })).toBeVisible();
  await page.getByRole('button', { name: /下一段/ }).click();
  await expect(page.getByRole('button', { name: /停止示范/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /听示范/ })).toBeVisible();
  await page.getByRole('button', { name: '收起跟读练习' }).click();
  await page.getByRole('button', { name: '查询单词 apple', exact: true }).first().click();
  await page.getByRole('button', { name: '播放 apple 的发音', exact: true }).click();
  await expect(page.getByRole('button', { name: '正在播放发音' })).toBeVisible();
  await expect(page.getByText(/播放没有开始|示范暂时不可用/)).toHaveCount(0);
  await context.setOffline(false);
});

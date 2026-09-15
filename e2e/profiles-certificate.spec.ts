import { test, expect, type Page } from '@playwright/test';

const root = '/magic-english-buddy';
const originalName = '小小探险队';

async function start(page: Page) {
  await page.goto(`${root}/`);
  await page.getByRole('button', { name: '直接开始，一起学英语' }).click();
  await expect(page).toHaveURL(/\/map$/);
}
async function readRows(page: Page, table: string) {
  return page.evaluate(async table => {
    const opening = indexedDB.open('MagicEnglishBuddy');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      opening.onsuccess = () => resolve(opening.result);
      opening.onerror = () => reject(opening.error);
    });
    try {
      return await new Promise<Array<Record<string, any>>>((resolve, reject) => {
        const request = database.transaction(table).objectStore(table).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { database.close(); }
  }, table);
}
async function finishFirst(page: Page) {
  await page.goto(`${root}/quiz/l1_001`);
  for (const answer of ['Red', 'Rabbit', 'Happy']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.getByRole('button', { name: /继续/ }).click();
  }
  await page.getByRole('button', { name: /完成/ }).click();
  await expect(page).toHaveURL(/\/map$/);
}
async function createProfile(page: Page, name: string) {
  await page.goto(`${root}/settings`);
  await page.getByRole('button', { name: /新建档案/ }).click();
  const dialog = page.getByRole('dialog', { name: '新建学习档案' });
  await dialog.getByLabel('学习者名字').fill(name);
  await dialog.getByLabel('伙伴名字').fill('星星');
  await dialog.getByRole('button', { name: '创建并开始' }).click();
  await expect(page.getByRole('heading', { name: `你好，${name}`, exact: true })).toBeVisible();
}
async function selectProfile(page: Page, name: string) {
  await page.goto(`${root}/settings`);
  await page.getByRole('list', { name: '学习档案列表' }).getByRole('button', { name: new RegExp(name) }).click();
  await expect(page).toHaveURL(/\/map$/);
}

test('profiles keep rewards, lesson access and drafts separate after switching and reload', async ({ page, context }, testInfo) => {
  test.setTimeout(90_000);
  await start(page);
  const original = (await readRows(page, 'users'))[0];
  await finishFirst(page);
  await page.goto(`${root}/quiz/l1_001`);
  await page.getByRole('button', { name: 'Red', exact: true }).click();
  await expect.poll(async () => (await readRows(page, 'quizDrafts'))[0]?.stage).toBe('feedback');
  const observer = await context.newPage();
  await observer.goto(`${root}/quiz/l1_001`);
  await expect(observer.getByRole('button', { name: /继续/ })).toBeVisible();
  await createProfile(page, '小红');
  await expect(observer.getByRole('heading', { name: '你好，小红', exact: true })).toBeVisible();
  const second = (await readRows(page, 'users')).find(user => user.name === '小红')!;
  let progress = await readRows(page, 'userProgress');
  expect(progress.find(item => item.id === original.id)).toMatchObject({ magicPower: 19, streakDays: 1 });
  expect(progress.find(item => item.id === second.id)).toMatchObject({ magicPower: 0, streakDays: 0, completedNodes: [] });
  expect((await readRows(page, 'userVocabulary')).every(card => card.userId === original.id)).toBe(true);
  await page.goto(`${root}/quiz/l1_002`);
  await expect(page.getByRole('heading', { name: '这个关卡还不能开始' })).toBeVisible();
  await page.goto(`${root}/certificate`);
  await expect(page.getByText('完成第一节课程后再来领取记录')).toBeVisible();
  await page.reload();
  await expect(page.getByText('完成第一节课程后再来领取记录')).toBeVisible();
  await selectProfile(page, originalName);
  await page.goto(`${root}/quiz/l1_001`);
  await page.getByRole('button', { name: /继续/ }).click();
  await expect(page.getByRole('button', { name: 'Rabbit', exact: true })).toBeVisible();
  progress = await readRows(page, 'userProgress');
  expect(progress.find(item => item.id === original.id)?.magicPower).toBe(19);
  expect(progress.find(item => item.id === second.id)?.magicPower).toBe(0);
  await page.goto(`${root}/settings`);
  await page.screenshot({ path: testInfo.outputPath('profiles.png'), fullPage: true });
  await observer.close();
});

test('multi-profile backup restores both identities and a certificate exports the selected profile only', async ({ page, browser }, testInfo) => {
  test.setTimeout(90_000);
  await start(page);
  await finishFirst(page);
  await createProfile(page, '小红');
  await selectProfile(page, originalName);
  await page.goto(`${root}/scroll`);
  await page.getByRole('link', { name: '查看证书', exact: true }).click();
  const certificate = page.getByLabel(`${originalName}的学习里程碑证书`, { exact: true });
  await expect(certificate).toContainText('已完成 1 节课程');
  await expect(certificate).not.toContainText('小红');
  const pngReady = page.waitForEvent('download');
  await page.getByRole('button', { name: /保存 PNG/ }).click();
  const image = await pngReady;
  await image.saveAs(testInfo.outputPath('certificate.png'));
  await expect(page.getByRole('heading', { name: '已生成图片' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('certificate-page.png'), fullPage: true });
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /打印证书/ }).click();
  await page.emulateMedia({ media: 'print' });
  await expect(certificate).toBeVisible();
  await expect(page.getByRole('link', { name: '魔法地图', exact: true })).toBeHidden();
  if (testInfo.project.name === 'Chrome') await page.pdf({ path: testInfo.outputPath('certificate.pdf'), preferCSSPageSize: true });
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await page.goto(`${root}/settings`);
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出学习备份', exact: true }).click();
  const download = await downloadReady;
  const backupPath = testInfo.outputPath('profiles-backup.json');
  await download.saveAs(backupPath);
  const context = await browser.newContext();
  try {
    const restored = await context.newPage();
    await restored.goto(new URL(`${root}/settings`, page.url()).href);
    await restored.getByLabel('选择学习备份文件').setInputFiles(backupPath);
    await restored.getByRole('checkbox', { name: '我确认用这份备份替换当前学习记录' }).check();
    await restored.getByRole('button', { name: '确认恢复', exact: true }).click();
    await expect(restored).toHaveURL(/\/map$/);
    expect(await readRows(restored, 'users')).toHaveLength(2);
    await restored.goto(new URL(`${root}/certificate`, page.url()).href);
    await expect(restored.getByLabel(`${originalName}的学习里程碑证书`, { exact: true })).toContainText('已完成 1 节课程');
    // Helpers use relative URLs, so give this context a base URL via absolute navigation below.
    await restored.goto(new URL(`${root}/settings`, page.url()).href);
    await restored.getByRole('list', { name: '学习档案列表' }).getByRole('button', { name: /小红/ }).click();
    await expect(restored.getByRole('heading', { name: '你好，小红', exact: true })).toBeVisible();
    await restored.goto(new URL(`${root}/quiz/l1_002`, page.url()).href);
    await expect(restored.getByRole('heading', { name: '这个关卡还不能开始' })).toBeVisible();
  } finally { await context.close(); }
});

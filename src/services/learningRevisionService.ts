import { db } from '@/db';

export const getLearningRevision = async (): Promise<string> => {
  const [restored, selected] = await db.learningMeta.bulkGet(['restoreRevision', 'profileRevision']);
  const restoreRevision = restored?.value ?? '';
  return selected ? JSON.stringify([restoreRevision, selected.value]) : restoreRevision;
};

/** Call inside the same transaction as the write, including learningMeta in its scope. */
export async function assertLearningRevision(expected: string): Promise<void> {
  if ((await getLearningRevision()) !== expected)
    throw new Error('学习档案已切换，或记录已在另一窗口恢复，请重新打开页面后继续。');
}

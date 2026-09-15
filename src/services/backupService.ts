import {
  db,
  generateId,
  type User,
  type UserProgress,
  type UserVocabulary,
  type ReadingRecord,
  type QuizRecord,
  type QuizDraft,
  type Achievement,
  type UserSettings,
} from '@/db';
import { allStories, allDictionary, allRegions } from '@/data';
import { generateUnifiedMapData } from '@/data/unifiedMap';
import { getUserMapNodes } from '@/services/mapProgressService';
import * as v from './backupValidation';

export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
type SavedReading = Omit<ReadingRecord, 'shadowingRecords'> & {
  shadowingRecords: Array<{ paragraphId: string; timestamp: number }>;
};
export interface LearningBackup {
  format: 'magic-english-buddy-backup';
  version: 1 | 2;
  createdAt: number;
  currentUserId: string;
  settings: UserSettings;
  users: User[];
  userProgress: UserProgress[];
  userVocabulary: UserVocabulary[];
  readingHistory: SavedReading[];
  quizHistory: QuizRecord[];
  quizDrafts: QuizDraft[];
  achievements: Achievement[];
  mapStates: Array<{ id: string; storyId: string; completed: boolean; unlocked: boolean }>;
}
const strings = v.array(v.string(), 5000);
const question = v.object({
  questionId: v.identifier,
  userAnswer: v.answer,
  correctAnswer: v.answer,
  isCorrect: v.boolean,
  timeSpent: v.number(),
});
const schema = v.object({
  format: v.oneOf('magic-english-buddy-backup'),
  version: v.oneOf(1, 2),
  createdAt: v.number(),
  currentUserId: v.identifier,
  settings: v.settings,
  users: v.array(
    v.object({
      id: v.identifier,
      name: v.string(200),
      buddyName: v.string(200),
      createdAt: v.number(),
      lastActiveAt: v.number(),
      settings: v.settings,
    }),
    100
  ),
  userProgress: v.array(
    v.object({
      id: v.identifier,
      level: v.oneOf(1, 2, 3, 4, 5, 6, 7),
      magicPower: v.integer(1e9),
      buddyStage: v.oneOf(1, 2, 3, 4),
      totalReadingTime: v.number(),
      totalStoriesRead: v.integer(),
      currentMapNode: v.string(200),
      unlockedNodes: strings,
      completedNodes: v.optional(strings),
      achievements: strings,
      streakDays: v.integer(),
      lastStudyDate: v.date,
    }),
    100
  ),
  userVocabulary: v.array(
    v.object({
      id: v.identifier,
      userId: v.identifier,
      word: v.identifier,
      firstSeen: v.number(),
      lastReviewed: v.number(),
      correctCount: v.integer(),
      wrongCount: v.integer(),
      masteryLevel: v.oneOf(0, 1, 2, 3),
      nextReviewDate: v.date,
      isCard: v.boolean,
      cardRarity: v.oneOf(null, 'white', 'green', 'blue', 'gold'),
    })
  ),
  readingHistory: v.array(
    v.object({
      id: v.identifier,
      userId: v.identifier,
      storyId: v.identifier,
      startTime: v.number(),
      endTime: v.number(),
      duration: v.number(),
      progress: v.number(100),
      wordsLookedUp: strings,
      completed: v.boolean,
      shadowingRecords: v.array(
        v.object({
          paragraphId: v.identifier,
          timestamp: v.number(),
        }),
        1000
      ),
    })
  ),
  quizHistory: v.array(
    v.object({
      id: v.identifier,
      userId: v.identifier,
      storyId: v.identifier,
      quizType: v.oneOf('story_quiz', 'review_quiz'),
      questions: v.array(question, 500),
      score: v.number(100),
      earnedMagicPower: v.integer(1e9),
      completedAt: v.number(),
    })
  ),
  quizDrafts: v.array(
    v.object({
      id: v.identifier,
      userId: v.identifier,
      storyId: v.identifier,
      questionFingerprint: v.string(100000),
      startedAt: v.number(),
      updatedAt: v.number(),
      stage: v.oneOf('playing', 'feedback', 'result'),
      currentQuestionIndex: v.integer(500),
      answers: v.array(v.object({ questionId: v.identifier, userAnswer: v.answer }), 500),
      hintsUsed: v.integer(500),
      hintedQuestionIds: v.optional(v.array(v.identifier, 500)),
    })
  ),
  achievements: v.array(
    v.object({
      id: v.identifier,
      userId: v.identifier,
      achievementId: v.identifier,
      unlockedAt: v.number(),
      claimed: v.boolean,
    })
  ),
  mapStates: v.array(
    v.object({
      id: v.identifier,
      storyId: v.identifier,
      completed: v.boolean,
      unlocked: v.boolean,
    }),
    10000
  ),
});
const learningTables = () => [
  db.users,
  db.userProgress,
  db.userVocabulary,
  db.readingHistory,
  db.quizHistory,
  db.quizDrafts,
  db.achievements,
  db.mapNodes,
];

/** Decode before opening a write transaction; reject dangling references and duplicate keys. */
export function parseBackup(text: string): LearningBackup {
  if (new Blob([text]).size > MAX_BACKUP_BYTES)
    throw new Error('备份文件超过 20 MB，请选择较小的备份。');
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    return v.invalid();
  }
  const backup = schema(input) as LearningBackup;
  const users = new Set(backup.users.map(user => user.id));
  if (!users.size || !users.has(backup.currentUserId)) return v.invalid();
  const stories = new Set(allStories.map(story => story.id));
  for (const rows of [
    backup.users,
    backup.userProgress,
    backup.userVocabulary,
    backup.readingHistory,
    backup.quizHistory,
    backup.quizDrafts,
    backup.achievements,
    backup.mapStates,
  ]) {
    if (new Set(rows.map(row => row.id)).size !== rows.length) return v.invalid();
  }
  if (
    backup.userProgress.length !== users.size ||
    backup.userProgress.some(row => !users.has(row.id))
  )
    return v.invalid();
  for (const row of [
    ...backup.userVocabulary,
    ...backup.readingHistory,
    ...backup.quizHistory,
    ...backup.quizDrafts,
    ...backup.achievements,
  ])
    if (!users.has(row.userId)) return v.invalid();
  for (const row of [
    ...backup.readingHistory,
    ...backup.quizHistory,
    ...backup.quizDrafts,
    ...backup.mapStates,
  ]) {
    if (!stories.has(row.storyId))
      throw new Error('备份包含此版本没有的课程，请先更新应用再恢复。');
  }
  if (new Set(backup.mapStates.map(row => row.storyId)).size !== backup.mapStates.length)
    return v.invalid();
  if (backup.version === 2) {
    const knownNodes = new Set([
      ...backup.mapStates.map(row => row.id),
      ...generateUnifiedMapData().nodes.map(node => node.id),
    ]);
    for (const progress of backup.userProgress) {
      if (!progress.completedNodes) return v.invalid();
      for (const ids of [progress.completedNodes, progress.unlockedNodes])
        if (new Set(ids).size !== ids.length || ids.some(id => !knownNodes.has(id)))
          return v.invalid();
    }
  }
  if (
    backup.userVocabulary.some(row => row.id !== `${row.userId}_${row.word}`) ||
    backup.achievements.some(row => row.id !== `${row.userId}_${row.achievementId}`) ||
    backup.quizDrafts.some(row => row.id !== `${row.userId}:${row.storyId}`)
  )
    return v.invalid();
  return backup;
}

/** Capture a consistent learning snapshot; downloaded media and temporary recordings are separate. */
export async function exportBackup(currentUserId: string, settings: UserSettings): Promise<string> {
  // Freeze legacy shared ownership before taking a read-only snapshot.
  for (const user of await db.users.toArray()) await getUserMapNodes(user.id);
  const snapshot = await db.transaction('r', learningTables(), async () => {
    const [
      users,
      userProgress,
      userVocabulary,
      readingHistory,
      quizHistory,
      quizDrafts,
      achievements,
      nodes,
    ] = await Promise.all([
      db.users.toArray(),
      db.userProgress.toArray(),
      db.userVocabulary.toArray(),
      db.readingHistory.toArray(),
      db.quizHistory.toArray(),
      db.quizDrafts.toArray(),
      db.achievements.toArray(),
      db.mapNodes.toArray(),
    ]);
    const active = userProgress.find(progress => progress.id === currentUserId);
    const completed = new Set(active?.completedNodes ?? []);
    const unlocked = new Set(active?.unlockedNodes ?? []);
    // This map supplies the ID→story mapping and current profile's preview.
    // In version 2 every profile's authoritative state lives in userProgress.
    const map = new Map<string, LearningBackup['mapStates'][number]>();
    for (const node of nodes)
      if (node.storyId && allStories.some(story => story.id === node.storyId)) {
        const old = map.get(node.storyId);
        map.set(node.storyId, {
          id: old?.id ?? node.id,
          storyId: node.storyId,
          completed: completed.has(node.id) || !!old?.completed,
          unlocked: unlocked.has(node.id) || completed.has(node.id) || !!old?.unlocked,
        });
      }
    return {
      users,
      userProgress,
      userVocabulary,
      readingHistory,
      quizHistory,
      quizDrafts,
      achievements,
      mapStates: [...map.values()],
    };
  });
  const readingHistory: SavedReading[] = snapshot.readingHistory.map(reading => ({
    ...reading,
    shadowingRecords: reading.shadowingRecords.map(record => ({
      paragraphId: record.paragraphId,
      timestamp: record.timestamp,
    })),
  }));
  const text = JSON.stringify({
    format: 'magic-english-buddy-backup',
    version: 2,
    createdAt: Date.now(),
    currentUserId,
    settings,
    ...snapshot,
    readingHistory,
  });
  // Do not hand users a file that this version cannot restore.
  parseBackup(text);
  return text;
}

/** All replacements commit together or all roll back; no network or file work inside the transaction. */
export async function restoreBackup(input: LearningBackup): Promise<void> {
  const backup = parseBackup(JSON.stringify(input));
  const nodes = generateUnifiedMapData().nodes.map(node => ({ ...node, completed: false, unlocked: false }));
  const ids = new Map(
    backup.mapStates.map(state => [
      state.id,
      nodes.find(node => node.storyId === state.storyId)?.id,
    ])
  );
  const canonicalIds = new Set(nodes.map(node => node.id));
  const resolveId = (id: string): string | undefined => {
    const resolved = ids.get(id) ?? id;
    if (canonicalIds.has(resolved)) return resolved;
    // Early versions initialized the first node with an extra zero.
    if (id === 'node_l1_001') return nodes.find(node => node.storyId === 'l1_001')?.id;
    return undefined;
  };
  const resolveIds = (list: string[]) => list.map(resolveId).filter((id): id is string => !!id);
  const userProgress = backup.userProgress.map(progress => {
    const completed = new Set(backup.version === 2 ? resolveIds(progress.completedNodes ?? []) : []);
    const unlocked = new Set(resolveIds(progress.unlockedNodes));
    if (backup.version === 1 && progress.id === backup.currentUserId) {
      for (const state of backup.mapStates) {
        const id = resolveId(state.id);
        if (!id) continue;
        if (state.completed) completed.add(id);
        if (state.unlocked) unlocked.add(id);
      }
    }
    for (const record of backup.quizHistory) {
      if (record.userId !== progress.id || record.score < 60 || record.quizType !== 'story_quiz') continue;
      const id = nodes.find(node => node.storyId === record.storyId)?.id;
      if (id) completed.add(id);
    }
    for (const node of nodes)
      if (completed.has(node.id) || node.prerequisites.every(id => completed.has(id)))
        unlocked.add(node.id);
    const previous = resolveId(progress.currentMapNode);
    return {
      ...progress,
      completedNodes: [...completed],
      unlockedNodes: [...unlocked],
      currentMapNode: previous && unlocked.has(previous)
        ? previous
        : nodes.find(node => unlocked.has(node.id) && !completed.has(node.id))?.id ?? nodes[0].id,
    };
  });
  const readingHistory: ReadingRecord[] = backup.readingHistory;
  await db.transaction(
    'rw',
    [...learningTables(), db.stories, db.dictionary, db.mapRegions, db.learningMeta],
    async () => {
      for (const table of learningTables()) await table.clear();
      await db.users.bulkPut(backup.users);
      await db.userProgress.bulkPut(userProgress);
      await db.userVocabulary.bulkPut(backup.userVocabulary);
      await db.readingHistory.bulkPut(readingHistory);
      await db.quizHistory.bulkPut(backup.quizHistory);
      await db.quizDrafts.bulkPut(backup.quizDrafts);
      await db.achievements.bulkPut(backup.achievements);
      await db.mapNodes.bulkPut(nodes);
      // A fresh installation can restore before onboarding initializes its bundled data.
      const existingStories = new Set(await db.stories.toCollection().primaryKeys());
      await db.stories.bulkPut(allStories.filter(story => !existingStories.has(story.id)));
      const dictionary = new Set(await db.dictionary.toCollection().primaryKeys());
      const missing = allDictionary.filter(entry => {
        if (dictionary.has(entry.word)) return false;
        dictionary.add(entry.word);
        return true;
      });
      await db.dictionary.bulkPut(missing);
      await db.mapRegions.bulkPut(allRegions);
      await db.learningMeta.put({ key: 'restoreRevision', value: generateId() });
      await db.learningMeta.put({ key: 'activeProfileId', value: backup.currentUserId });
    }
  );
}

import { db, type MapNode, type UserProgress } from '@/db';

const LEGACY_OWNER_KEY = 'mapProgressLegacyOwner:v1';
const ACTIVE_PROFILE_KEY = 'activeProfileId';
const PASSED_SCORE = 60;

const unique = (ids: Iterable<string>) => [...new Set(ids)];
const sameIds = (left: string[] | undefined, right: string[]) =>
  left?.length === right.length && left.every((id, index) => id === right[index]);

const getStoredCurrentUserId = (): string | undefined => {
  try {
    const stored = localStorage.getItem('magic-english-storage');
    if (!stored) return undefined;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return undefined;
    const state =
      'state' in parsed && parsed.state && typeof parsed.state === 'object' ? parsed.state : parsed;
    return 'currentUserId' in state && typeof state.currentUserId === 'string'
      ? state.currentUserId
      : undefined;
  } catch {
    return undefined;
  }
};

const nodeIdsForPassedStories = async (userId: string, nodes: MapNode[]): Promise<string[]> => {
  const passedStories = new Set(
    (await db.quizHistory.where('userId').equals(userId).toArray())
      .filter(record => record.quizType === 'story_quiz' && record.score >= PASSED_SCORE)
      .map(record => record.storyId)
  );
  return nodes.filter(node => node.storyId && passedStories.has(node.storyId)).map(node => node.id);
};

const normalizeProgress = (
  progress: UserProgress,
  nodes: MapNode[],
  completedNodeIds: Iterable<string>,
  unlockedNodeIds: Iterable<string>
) => {
  const validIds = new Set(nodes.map(node => node.id));
  const completed = unique(completedNodeIds).filter(id => validIds.has(id));
  const completedSet = new Set(completed);
  const unlocked = new Set(unique(unlockedNodeIds).filter(id => validIds.has(id)));
  for (const node of nodes) {
    if (node.prerequisites.length === 0) unlocked.add(node.id);
    if (completedSet.has(node.id)) unlocked.add(node.id);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (
        !unlocked.has(node.id) &&
        node.prerequisites.every(prerequisite => completedSet.has(prerequisite))
      ) {
        unlocked.add(node.id);
        changed = true;
      }
    }
  }
  const unlockedNodes = nodes.filter(node => unlocked.has(node.id)).map(node => node.id);
  return {
    completedNodes: nodes.filter(node => completedSet.has(node.id)).map(node => node.id),
    unlockedNodes,
    currentMapNode: unlocked.has(progress.currentMapNode)
      ? progress.currentMapNode
      : ((nodes.find(node => unlocked.has(node.id) && !completedSet.has(node.id)) ?? nodes[0])
          ?.id ?? progress.currentMapNode),
  };
};

/**
 * Migrates every pre-profile-map progress row exactly once. The old global map
 * flags belong only to the profile selected when the migration starts; the
 * owner is stored before any row is changed so later profile switching cannot
 * claim the shared state.
 *
 * Call only in a transaction containing users, userProgress, quizHistory,
 * mapNodes, and learningMeta.
 */
export const migrateLegacyMapProgressInTransaction = async (): Promise<void> => {
  const [progressRows, users, nodes, ownerRecord, activeProfileRecord] = await Promise.all([
    db.userProgress.toArray(),
    db.users.orderBy('createdAt').toArray(),
    db.mapNodes.toArray(),
    db.learningMeta.get(LEGACY_OWNER_KEY),
    db.learningMeta.get(ACTIVE_PROFILE_KEY),
  ]);
  if (!progressRows.some(progress => progress.completedNodes === undefined)) return;

  let ownerId = ownerRecord?.value || undefined;
  if (!ownerRecord) {
    const selected = [activeProfileRecord?.value, getStoredCurrentUserId()].find(candidate =>
      users.some(user => user.id === candidate)
    );
    ownerId = selected ?? users[0]?.id;
    await db.learningMeta.put({ key: LEGACY_OWNER_KEY, value: ownerId ?? '' });
  }

  const legacyCompleted = nodes.filter(node => node.completed).map(node => node.id);
  const legacyUnlocked = nodes.filter(node => node.unlocked).map(node => node.id);
  for (const progress of progressRows) {
    if (progress.completedNodes !== undefined) continue;
    const isLegacyOwner = progress.id === ownerId;
    const completedFromHistory = await nodeIdsForPassedStories(progress.id, nodes);
    const completed = isLegacyOwner
      ? [...legacyCompleted, ...completedFromHistory]
      : completedFromHistory;
    const unlocked = isLegacyOwner
      ? [...legacyUnlocked, ...progress.unlockedNodes]
      : progress.unlockedNodes;
    await db.userProgress.update(
      progress.id,
      normalizeProgress(progress, nodes, completed, unlocked)
    );
  }
};

/** Ensures migration has completed and returns the profile-specific map view. */
export const getUserMapNodes = async (userId: string): Promise<MapNode[]> =>
  db.transaction(
    'rw',
    [db.users, db.userProgress, db.quizHistory, db.mapNodes, db.learningMeta],
    async () => {
      await migrateLegacyMapProgressInTransaction();
      const [progress, nodes] = await Promise.all([
        db.userProgress.get(userId),
        db.mapNodes.toArray(),
      ]);
      if (!progress) return [];
      const normalized = normalizeProgress(
        progress,
        nodes,
        progress.completedNodes ?? [],
        progress.unlockedNodes
      );
      if (
        progress.completedNodes === undefined ||
        progress.currentMapNode !== normalized.currentMapNode ||
        !sameIds(progress.completedNodes, normalized.completedNodes) ||
        !sameIds(progress.unlockedNodes, normalized.unlockedNodes)
      ) {
        await db.userProgress.update(userId, normalized);
      }
      const completed = new Set(normalized.completedNodes);
      const unlocked = new Set(normalized.unlockedNodes);
      return nodes.map(node => ({
        ...node,
        completed: completed.has(node.id),
        unlocked: unlocked.has(node.id),
      }));
    }
  );

/**
 * Marks a story complete for one profile and unlocks all dependents whose
 * prerequisites are now complete. Call only in a transaction that includes
 * the same tables as `getUserMapNodes`.
 */
export const completeUserStoryMapNodeInTransaction = async (
  userId: string,
  storyId: string
): Promise<{ nodes: MapNode[]; newlyUnlockedNodeIds: string[] }> => {
  await migrateLegacyMapProgressInTransaction();
  const [progress, nodes] = await Promise.all([db.userProgress.get(userId), db.mapNodes.toArray()]);
  if (!progress) throw new Error('Learning profile not found');
  const target = nodes.find(node => node.storyId === storyId);
  if (!target) return { nodes, newlyUnlockedNodeIds: [] };

  const before = new Set(progress.unlockedNodes);
  const state = normalizeProgress(
    progress,
    nodes,
    [...(progress.completedNodes ?? []), target.id],
    [...progress.unlockedNodes, target.id]
  );
  await db.userProgress.update(userId, state);
  const completed = new Set(state.completedNodes);
  const unlocked = new Set(state.unlockedNodes);
  return {
    nodes: nodes.map(node => ({
      ...node,
      completed: completed.has(node.id),
      unlocked: unlocked.has(node.id),
    })),
    newlyUnlockedNodeIds: state.unlockedNodes.filter(id => !before.has(id)),
  };
};

export const getUserMapNodesInTransaction = async (userId: string): Promise<MapNode[]> => {
  await migrateLegacyMapProgressInTransaction();
  const [progress, nodes] = await Promise.all([db.userProgress.get(userId), db.mapNodes.toArray()]);
  if (!progress) return [];
  const state = normalizeProgress(
    progress,
    nodes,
    progress.completedNodes ?? [],
    progress.unlockedNodes
  );
  const completed = new Set(state.completedNodes);
  const unlocked = new Set(state.unlockedNodes);
  return nodes.map(node => ({
    ...node,
    completed: completed.has(node.id),
    unlocked: unlocked.has(node.id),
  }));
};

export default {
  getUserMapNodes,
  getUserMapNodesInTransaction,
  completeUserStoryMapNodeInTransaction,
  migrateLegacyMapProgressInTransaction,
};

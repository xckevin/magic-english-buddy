import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  LockKeyhole,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { db, type User, type UserProgress } from '@/db';
import { initializeAppData, needsInitialization } from '@/services/dataInitService';
import { getUserMapNodes } from '@/services/mapProgressService';
import { getEffectiveStreak } from '@/services/learningActivityService';
import { getStoryById } from '@/data';
import { findActiveNode, generateUnifiedMapData, type UnifiedMapNode } from '@/data/unifiedMap';
import { useAppStore } from '@/stores/useAppStore';
import AppShell from '@/components/common/AppShell';
import BuddyScene from '@/components/common/BuddyScene';
import { Button, Modal } from '@/components/common';
import styles from './MapPage.module.css';

const mapData = generateUnifiedMapData();
const regionIcons = ['🌲', '⛰️', '🌊', '☁️', '⭐', '⏳', '💎'];
const regionDescriptions = [
  '从一个单词开始，认识身边的小小世界。',
  '让声音带路，发现山谷里的新故事。',
  '跟随好奇心，潜入蓝色的故事世界。',
  '穿过云朵，和城堡里的朋友一起冒险。',
  '点亮一颗星，读懂一个更大的世界。',
  '和伙伴穿越时光，发现新的可能。',
  '用学到的英语，完成你的魔法冒险。',
];
const typeLabels: Record<string, string> = {
  story: '故事阅读',
  boss: '区域挑战',
  challenge: '趣味练习',
  bonus: '奖励关卡',
};

export default function MapPage() {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const [nodes, setNodes] = useState<UnifiedMapNode[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [region, setRegion] = useState(1);
  const [selected, setSelected] = useState<UnifiedMapNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (needsInitialization()) {
        const result = await initializeAppData();
        if (!result.success) throw new Error('Content initialization failed');
      }
      const activeProfileId = (await db.learningMeta.get('activeProfileId'))?.value;
      const savedUser = activeProfileId
        ? await db.users.get(activeProfileId)
        : currentUserId
          ? await db.users.get(currentUserId)
          : await db.users.orderBy('createdAt').last();
      if (!savedUser) {
        navigate('/onboarding', { replace: true });
        return;
      }
      if (activeProfileId === savedUser.id && currentUserId !== savedUser.id) {
        useAppStore.getState().activateLearningProfile(savedUser);
      }
      const userNodes = await getUserMapNodes(savedUser.id);
      // A profile switch can finish a newer request while this older request is
      // still resolving. Do not paint the old profile's map in that case.
      const latestActiveProfileId = (await db.learningMeta.get('activeProfileId'))?.value;
      if (latestActiveProfileId && latestActiveProfileId !== savedUser.id) return;
      const merged = mapData.nodes.map(node => {
        const userNode = userNodes.find(
          saved => saved.id === node.id || saved.storyId === node.storyId
        );
        return userNode
          ? {
              ...node,
              ...userNode,
              level: node.level,
              globalIndex: node.globalIndex,
              levelIndex: node.levelIndex,
              theme: node.theme,
              isLevelStart: node.isLevelStart,
              isLevelEnd: node.isLevelEnd,
            }
          : node;
      });
      setUser(savedUser);
      setProgress((await db.userProgress.get(savedUser.id)) ?? null);
      setNodes(merged);
      setRegion(findActiveNode(merged)?.level ?? 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, navigate]);
  useEffect(() => {
    void load();
  }, [load]);
  const activeNode = findActiveNode(nodes);
  const activeStory = activeNode?.storyId ? getStoryById(activeNode.storyId) : null;
  const section = mapData.sections[region - 1]!;
  const regionNodes = nodes.filter(n => n.level === region);
  const completed = regionNodes.filter(n => n.completed).length;
  const selectedStory = selected?.storyId ? getStoryById(selected.storyId) : null;
  const startNode = (node: UnifiedMapNode) => {
    if (!node.unlocked || !node.storyId) return;
    navigate(
      `/${node.type === 'challenge' || node.type === 'bonus' ? 'quiz' : 'reader'}/${node.storyId}`
    );
  };
  return (
    <AppShell
      title={user?.name === '小小探险队' ? '一起学英语' : user ? `你好，${user.name}` : '魔法地图'}
      subtitle="和老师、伙伴一起，听一个新的故事。"
    >
      {loading ? (
        <div className={styles.status} role="status">
          正在展开你的魔法地图…
        </div>
      ) : error ? (
        <div className={styles.status} role="alert">
          <h2>地图暂时没有打开</h2>
          <p>你的学习记录仍在这台设备上，请再试一次。</p>
          <Button onClick={load}>重新加载</Button>
        </div>
      ) : (
        <div data-testid="map-page">
          <div className={styles.topGrid}>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.overline}>
                  <span /> {activeNode?.completed ? '重温你的冒险' : '今天的冒险'}
                </span>
                <h2>
                  每一个故事，
                  <br />
                  都是一场<span>小魔法。</span>
                </h2>
                <p>
                  和 {user?.buddyName || '伙伴'} 一起听一听、读一读，
                  <br className={styles.desktopBreak} />
                  把好奇心变成新的英语超能力。
                </p>
                {activeNode && (
                  <Button
                    onClick={() => startNode(activeNode)}
                    rightIcon={<ArrowRight size={17} />}
                  >
                    {activeNode.completed
                      ? '再读一次'
                      : progress?.totalStoriesRead
                        ? '继续学习'
                        : '开始第一个故事'}
                  </Button>
                )}
                {activeStory && (
                  <span className={styles.heroMeta}>
                    {activeStory.titleCn} <span>·</span> 约 {activeStory.metadata.estimatedTime}{' '}
                    分钟
                  </span>
                )}
              </div>
              <BuddyScene className={styles.heroArt} />
              <span className={styles.heroFootnote}>A LITTLE STORY. A LITTLE MAGIC.</span>
            </section>
            <aside className={styles.buddyCard}>
              <div className={styles.cardHeading}>
                <Sparkles size={18} />
                <span>我们的魔法伙伴</span>
                <Link to="/scroll" aria-label="查看伙伴成长">
                  <ChevronRight size={18} />
                </Link>
              </div>
              <div className={styles.buddyIdentity}>
                <span className={styles.buddyEmoji} aria-hidden="true">
                  {['🥚', '🐣', '🐲', '🦋'][(progress?.buddyStage ?? 1) - 1]}
                </span>
                <div>
                  <h3>{user?.buddyName}</h3>
                  <span>和你一起，一点点长大</span>
                </div>
              </div>
              <div className={styles.buddyMessage}>
                “ 不用着急，我会陪你
                <br />
                读懂每一个新单词。 ”
              </div>
              <Link to="/scroll" className={styles.buddyLink}>
                查看这台设备的学习记录 <ArrowRight size={15} />
              </Link>
            </aside>
          </div>
          <section className={styles.stats} aria-label="本设备的学习记录">
            <div>
              <span className={`${styles.statIcon} ${styles.amber}`}>
                <Flame size={20} />
              </span>
              <strong>
                {progress ? getEffectiveStreak(progress) : 0}
                <small>天</small>
              </strong>
              <span>连续学习</span>
            </div>
            <div>
              <span className={`${styles.statIcon} ${styles.lilac}`}>
                <Sparkles size={20} />
              </span>
              <strong>{progress?.magicPower ?? 0}</strong>
              <span>积累魔力</span>
            </div>
            <div>
              <span className={`${styles.statIcon} ${styles.green}`}>
                <BookOpen size={20} />
              </span>
              <strong>
                {progress?.totalStoriesRead ?? 0}
                <small>篇</small>
              </strong>
              <span>读过的故事</span>
            </div>
          </section>
          <section className={styles.explore} aria-labelledby="explore-heading">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.overline}>YOUR LEARNING JOURNEY</span>
                <h2 id="explore-heading">探索魔法世界</h2>
              </div>
              <span className={styles.worldCount}>7 个世界 · 一步步探索</span>
            </div>
            <div className={styles.regions} role="group" aria-label="选择学习区域">
              {mapData.sections.map((s, index) => (
                <button
                  key={s.level}
                  className={`${styles.regionTab} ${region === s.level ? styles.regionActive : ''}`}
                  onClick={() => setRegion(s.level)}
                  aria-pressed={region === s.level}
                >
                  <span className={styles.regionEmoji} aria-hidden="true">
                    {regionIcons[index]}
                  </span>
                  <strong>{s.region.nameCn}</strong>
                  <span>
                    LEVEL {s.level}
                    {!nodes.some(n => n.level === s.level && n.unlocked) && (
                      <LockKeyhole size={11} aria-label="未解锁" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.journey}>
              <div className={styles.regionHeading}>
                <span className={styles.forestBadge} aria-hidden="true">
                  {regionIcons[region - 1]}
                </span>
                <div>
                  <span className={styles.regionEyebrow}>
                    LEVEL {region} · {section.region.name}
                  </span>
                  <h3>{section.region.nameCn}</h3>
                  <p>{regionDescriptions[region - 1]}</p>
                </div>
                <div className={styles.regionProgress}>
                  <span>
                    <strong>{completed}</strong> / {regionNodes.length} 已完成
                  </span>
                  <progress
                    value={completed}
                    max={regionNodes.length || 1}
                    aria-label={`${section.region.nameCn}完成进度`}
                  />
                </div>
              </div>
              <ol className={styles.lessonList}>
                {regionNodes.map((node, index) => (
                  <li key={node.id}>
                    <button
                      data-testid={`map-node-${node.storyId || node.id}`}
                      className={`${styles.lesson} ${activeNode?.id === node.id ? styles.currentLesson : ''} ${!node.unlocked ? styles.lockedLesson : ''}`}
                      onClick={() => setSelected(node)}
                      aria-label={`${node.titleCn}，${node.completed ? '已完成，可重温' : node.unlocked ? '可以开始' : '未解锁，查看条件'}`}
                    >
                      <span className={styles.lessonNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.lessonEmoji} aria-hidden="true">
                        {node.emoji || '📖'}
                      </span>
                      <span className={styles.lessonInfo}>
                        <strong>{node.titleCn}</strong>
                        <span lang="en">{node.title}</span>
                      </span>
                      <span className={styles.lessonType}>{typeLabels[node.type] || '冒险'}</span>
                      <span className={styles.lessonStatus}>
                        {node.completed ? (
                          <Check size={20} />
                        ) : node.unlocked ? (
                          <span>
                            开始 <ArrowRight size={16} />
                          </span>
                        ) : (
                          <LockKeyhole size={17} />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className={styles.journeyNote}>
                <Sprout size={16} /> 每完成一个关卡，就离新的世界更近一步。
              </div>
            </div>
          </section>
          <Modal
            open={!!selected}
            onClose={() => setSelected(null)}
            title={selected?.unlocked ? '准备开始冒险' : '下一站的惊喜'}
            size="sm"
          >
            {selected && (
              <div className={styles.preview} data-testid="node-preview">
                <span className={styles.previewEmoji} aria-hidden="true">
                  {selected.emoji}
                </span>
                <span className={styles.overline}>
                  LEVEL {selected.level} · {typeLabels[selected.type]}
                </span>
                <h2>{selected.titleCn}</h2>
                <p lang="en">{selected.title}</p>
                {selectedStory && (
                  <div className={styles.previewMeta}>
                    <span>
                      <BookOpen size={15} />
                      {selectedStory.metadata.wordCount} 词
                    </span>
                    <span>
                      <Clock3 size={15} />约 {selectedStory.metadata.estimatedTime} 分钟
                    </span>
                  </div>
                )}
                {selected.unlocked ? (
                  <Button
                    fullWidth
                    onClick={() => startNode(selected)}
                    rightIcon={<ArrowRight size={17} />}
                  >
                    {selected.completed ? '重温故事' : '开始学习'}
                  </Button>
                ) : (
                  <>
                    <p className={styles.unlockHint}>
                      先完成
                      {selected.prerequisites.length
                        ? `「${nodes.find(n => n.id === selected.prerequisites[0])?.titleCn || '前一个关卡'}」`
                        : '前一个关卡'}
                      ，就能解锁这里。
                    </p>
                    <Button
                      fullWidth
                      onClick={() => {
                        if (activeNode) {
                          setRegion(activeNode.level);
                          setSelected(activeNode);
                        }
                      }}
                    >
                      查看当前关卡
                    </Button>
                  </>
                )}
              </div>
            )}
          </Modal>
        </div>
      )}
    </AppShell>
  );
}

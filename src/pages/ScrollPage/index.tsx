/**
 * 成长记录：展示当前用户在本设备上的真实学习数据。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, type Achievement, type User, type UserProgress } from '@/db';
import { useAppStore } from '@/stores/useAppStore';
import { QRSync, AchievementCard, MagicCard } from '@/components/incentive';
import { BuddyAvatar } from '@/components/buddy';
import AppShell from '@/components/common/AppShell';
import { getBuddyState, type BuddyState, checkEvolution, evolve } from '@/services/buddyService';
import { getUserCards, type CardData } from '@/services/cardCollectionService';
import { ACHIEVEMENTS, claimAchievementReward, getUserAchievements } from '@/services/achievementService';
import { dictionaryService } from '@/services/dictionaryService';
import { getUserMapNodes } from '@/services/mapProgressService';
import { getEffectiveStreak } from '@/services/learningActivityService';
import styles from './ScrollPage.module.css';

type TabType = 'overview' | 'cards' | 'achievements' | 'sync';

interface PageData {
  user: User | null;
  progress: UserProgress | null;
  buddy: BuddyState | null;
  evolution: { canEvolve: boolean; progress: number; nextStage: number | null };
  cards: CardData[];
  achievements: Achievement[];
  completedCourses: number;
}

const tabs: Array<{ id: TabType; label: string; icon: string }> = [
  { id: 'overview', label: '总览', icon: '📊' },
  { id: 'cards', label: '卡牌', icon: '🃏' },
  { id: 'achievements', label: '成就', icon: '🏆' },
  { id: 'sync', label: '导出', icon: '📱' },
];

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('zh-CN');

const ScrollPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [data, setData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const loadRequestRef = useRef(0);

  const loadData = useCallback(async () => {
    const request = ++loadRequestRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const user = currentUserId ? await db.users.get(currentUserId) : undefined;

      if (!user) {
        if (request !== loadRequestRef.current) return;
        setData({
          user: null,
          progress: null,
          buddy: null,
          evolution: { canEvolve: false, progress: 0, nextStage: null },
          cards: [],
          achievements: [],
          completedCourses: 0,
        });
        return;
      }

      const [progress, buddy, evolutionInfo, rawCards, achievements, nodes] = await Promise.all([
        db.userProgress.get(user.id),
        getBuddyState(user.id),
        checkEvolution(user.id),
        getUserCards(user.id),
        getUserAchievements(user.id),
        getUserMapNodes(user.id),
      ]);
      const definitions = await dictionaryService.lookupMultiple(rawCards.map(card => card.word));
      const cards = rawCards
        .map(card => {
          const definition = definitions.get(card.word.toLowerCase());
          return {
            ...card,
            meaningCn: definition?.meaningCn || '暂未收录释义',
            emoji: definition?.emoji || card.emoji,
          };
        })
        .sort((a, b) => b.obtainedAt - a.obtainedAt);

      if (request !== loadRequestRef.current || useAppStore.getState().currentUserId !== currentUserId) return;
      setData({
        user,
        progress: progress || null,
        buddy,
        evolution: {
          canEvolve: evolutionInfo.canEvolve,
          progress: evolutionInfo.progress,
          nextStage: evolutionInfo.nextStage,
        },
        cards,
        achievements,
        completedCourses: new Set(nodes.filter(node => node.completed && node.storyId).map(node => node.storyId)).size,
      });
    } catch (loadError) {
      console.error('加载成长记录失败:', loadError);
      if (request !== loadRequestRef.current) return;
      setData(null);
      setError('暂时无法读取成长记录，请检查后重试。');
    } finally {
      if (request === loadRequestRef.current) setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleEvolution = useCallback(async () => {
    if (!data?.user || isActing) return;
    setIsActing(true);
    setActionMessage(null);
    try {
      const didEvolve = await evolve(data.user.id);
      setActionMessage(didEvolve ? '伙伴进化成功！' : '还需要更多魔力才能进化。');
      await loadData();
    } catch {
      setActionMessage('伙伴暂时没有完成进化，请重试。');
    } finally {
      setIsActing(false);
    }
  }, [data?.user, isActing, loadData]);

  const handleClaimAchievement = useCallback(
    async (achievement: Achievement) => {
      if (isActing || achievement.claimed) return;
      setIsActing(true);
      setActionMessage(null);
      try {
        const amount = await claimAchievementReward(achievement.id);
        setActionMessage(amount ? `已领取 ${amount} 魔力值。` : '这个奖励已经领取过了。');
        await loadData();
      } catch {
        setActionMessage('奖励暂时无法领取，请重试。');
      } finally {
        setIsActing(false);
      }
    },
    [isActing, loadData]
  );

  const renderOverview = () => {
    const progress = data?.progress;
    const buddy = data?.buddy;
    return (
      <div className={styles.overviewSection}>
        <section className={styles.buddyCard} aria-label="学习伙伴状态">
          {buddy ? (
            <>
              <BuddyAvatar stage={buddy.stage} mood={buddy.mood} size="xl" animated={false} />
              <div className={styles.buddyInfo}>
                <p className={styles.eyebrow}>学习伙伴</p>
                <h2>{data?.user?.buddyName || '小伙伴'}</h2>
                <div className={styles.evolutionHeader}>
                  <span>成长进度</span>
                  <strong>{data?.evolution.progress || 0}%</strong>
                </div>
                <div
                  className={styles.evolutionTrack}
                  aria-label={`成长进度 ${data?.evolution.progress || 0}%`}
                >
                  <motion.div
                    className={styles.evolutionFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${data?.evolution.progress || 0}%` }}
                  />
                </div>
                {data?.evolution.canEvolve && (
                  <div>
                    <p className={styles.readyHint}>伙伴已积累足够魔力，可以进化了！</p>
                    <button
                      className={styles.primaryAction}
                      type="button"
                      disabled={isActing}
                      onClick={() => void handleEvolution()}
                    >
                      {isActing ? '正在进化…' : `进化为第 ${data.evolution.nextStage} 阶段`}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyBuddy}>
              <BuddyAvatar stage={1} mood="neutral" size="xl" />
              <div>
                <h2>等待相遇</h2>
                <p>完成地图上的故事，唤醒你的学习伙伴。</p>
              </div>
            </div>
          )}
        </section>

        <section className={styles.statsGrid} aria-label="学习统计">
          <div className={styles.statCard}>
            <span aria-hidden="true">⭐</span>
            <strong>L{progress?.level || 1}</strong>
            <small>当前等级</small>
          </div>
          <div className={styles.statCard}>
            <span aria-hidden="true">✨</span>
            <strong>{progress?.magicPower || 0}</strong>
            <small>魔力值</small>
          </div>
          <div className={styles.statCard}>
            <span aria-hidden="true">📖</span>
            <strong>{data?.completedCourses || 0}</strong>
            <small>完成课程</small>
          </div>
          <div className={styles.statCard}>
            <span aria-hidden="true">🔥</span>
            <strong>{progress ? getEffectiveStreak(progress) : 0}</strong>
            <small>连续学习</small>
          </div>
        </section>
        <section className={styles.certificateCard} aria-label="学习里程碑证书">
          <div>
            <p className={styles.eyebrow}>当前档案</p>
            <h2>学习里程碑证书</h2>
            <p>{data?.completedCourses ? `已完成 ${data.completedCourses} 节课程，可以生成一份本地学习记录。` : '完成第一节课程后，可以在这里生成学习里程碑证书。'}</p>
          </div>
          <Link to="/certificate" className={styles.certificateLink}>
            {data?.completedCourses ? '查看证书' : '去学习'}
          </Link>
        </section>
      </div>
    );
  };

  const renderCards = () => (
    <section className={styles.panelSection}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>词汇收藏</p>
          <h2>魔法卡牌</h2>
        </div>
        <span className={styles.countBadge}>{data?.cards.length || 0} 张</span>
      </div>
      <Link to="/review" className={styles.reviewLink}>复习收藏的单词 →</Link>
      {data?.cards.length ? (
        <div className={styles.cardsGrid}>
          {data.cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.32) }}
            >
              <MagicCard {...card} size="sm" />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🃏"
          title="还没有卡牌"
          description="在故事中学习新单词，就会收进这里。"
          onAction={() => navigate('/map')}
          action="去地图学习"
        />
      )}
    </section>
  );

  const renderAchievements = () => {
    const unlocked = new Map((data?.achievements || []).map(item => [item.achievementId, item]));
    return (
      <section className={styles.panelSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>真实进度</p>
            <h2>成就墙</h2>
          </div>
          <span className={styles.countBadge}>
            {unlocked.size}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className={styles.achievementsList}>
          {ACHIEVEMENTS.map(definition => {
            const achievement = unlocked.get(definition.id);
            return (
              <div key={definition.id}>
                <AchievementCard
                  name={definition.name}
                  nameCn={definition.nameCn}
                  description={definition.description}
                  icon={definition.icon}
                  unlocked={Boolean(achievement)}
                  unlockedAt={achievement ? formatDate(achievement.unlockedAt) : undefined}
                  rewardMagicPower={definition.reward.magicPower}
                />
                {achievement && !achievement.claimed && (
                  <button
                    className={styles.primaryAction}
                    type="button"
                    disabled={isActing}
                    onClick={() => void handleClaimAchievement(achievement)}
                  >
                    {isActing ? '正在领取…' : `领取 ${definition.reward.magicPower} 魔力值`}
                  </button>
                )}
                {achievement?.claimed && <p className={styles.readyHint}>奖励已领取</p>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <div className={styles.loadingState} role="status">
          正在整理你的成长记录…
        </div>
      );
    if (error)
      return (
        <EmptyState
          icon="🌙"
          title="记录暂时没能打开"
          description={error}
          onAction={() => void loadData()}
          action="重新尝试"
        />
      );
    if (!data?.user)
      return (
        <EmptyState
          icon="🗺️"
          title="先开启第一段旅程"
          description="完成地图上的引导后，成长记录会显示在这里。"
          onAction={() => navigate('/map')}
          action="前往地图"
        />
      );
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'cards') return renderCards();
    if (activeTab === 'achievements') return renderAchievements();
    return (
      <section className={styles.syncSection}>
        <QRSync userId={data.user.id} userName={data.user.name} />
      </section>
    );
  };

  if (!currentUserId || (!isLoading && !error && data?.user === null)) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AppShell title="成长记录" subtitle="当前档案的课程、词卡和学习里程碑">
      <div className={styles.page}>
        <div className={styles.tabs} role="group" aria-label="成长记录内容">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              type="button"
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.content}>{renderContent()}</div>
        {actionMessage && <p className={styles.helpText} role="status">{actionMessage}</p>}
      </div>
    </AppShell>
  );
};

const EmptyState: React.FC<{
  icon: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}> = ({ icon, title, description, action, onAction }) => (
  <section className={styles.emptyState}>
    <span className={styles.emptyIcon} aria-hidden="true">
      {icon}
    </span>
    <h2>{title}</h2>
    <p>{description}</p>
    <button className={styles.primaryAction} onClick={onAction} type="button">
      {action}
    </button>
  </section>
);

export default ScrollPage;

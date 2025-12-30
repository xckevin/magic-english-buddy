/**
 * L5 永恒星空地图数据
 * 紫黑色、星座主题，10个节点
 */

import type { MapNode, MapRegion } from '@/db';

// L5 区域配置
export const l5RegionConfig: MapRegion = {
  id: 'region_l5',
  level: 5,
  name: 'Eternal Stars',
  nameCn: '永恒星空',
  theme: 'stars',
  backgroundColor: '#0d0221',
  backgroundImage: '/images/maps/l5-stars.webp',
  nodes: [],
  unlockCondition: {
    requiredLevel: 5,
    requiredNodes: ['node_l4_boss'],
  },
};

// 节点类型图标映射
export const nodeIcons: Record<string, string> = {
  story: '📖',
  boss: '👑',
  bonus: '🎁',
  challenge: '⚡',
};

// 节点位置设计 - 星座连线路径
// 坐标系：(0,0) 左上角，x 向右，y 向下
// 画布大小：400 x 900
export const l5NodePositions: Array<{ x: number; y: number }> = [
  // 北斗区域 (1-3)
  { x: 100, y: 80 },   // 节点 1 - 起点
  { x: 200, y: 140 },  // 节点 2
  { x: 300, y: 80 },   // 节点 3

  // 银河区 (4-6)
  { x: 250, y: 240 },  // 节点 4
  { x: 150, y: 320 },  // 节点 5
  { x: 200, y: 420 },  // 节点 6

  // 星云区 (7-9)
  { x: 300, y: 520 },  // 节点 7
  { x: 150, y: 620 },  // 节点 8
  { x: 250, y: 720 },  // 节点 9

  // 终点 (10)
  { x: 200, y: 840 },  // 节点 10 - Boss（星空守护者）
];

// 故事标题映射
export const l5StoryTitles: Record<string, { title: string; titleCn: string; emoji: string }> = {
  'l5_001': { title: 'The Star Collector', titleCn: '星星收集者', emoji: '⭐' },
  'l5_002': { title: 'The Wise Owl', titleCn: '智慧的猫头鹰', emoji: '🦉' },
  'l5_003': { title: 'The North Star', titleCn: '北极星', emoji: '🌟' },
  'l5_004': { title: 'The Fox and Grapes', titleCn: '狐狸与葡萄', emoji: '🦊' },
  'l5_005': { title: 'The Constellation', titleCn: '星座传说', emoji: '✨' },
  'l5_006': { title: 'The Moon Festival', titleCn: '中秋传说', emoji: '🌕' },
  'l5_007': { title: 'The Tortoise and Hare', titleCn: '龟兔赛跑', emoji: '🐢' },
  'l5_b01': { title: 'Star Quiz', titleCn: '星空测验', emoji: '🎯' },
  'l5_c01': { title: 'Galaxy Challenge', titleCn: '银河挑战', emoji: '⚡' },
  'l5_boss': { title: 'Star Guardian', titleCn: '星空守护者', emoji: '👑' },
};

/**
 * 生成 L5 地图节点
 */
export const generateL5MapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];

  // 主线故事节点
  const storyIds = [
    'l5_001', 'l5_002', 'l5_003', 'l5_004',
    'l5_005', 'l5_006', 'l5_007',
  ];

  // Bonus 节点位置
  const bonusPositions = [3];
  const bonusIds = ['l5_b01'];

  // Challenge 节点位置
  const challengePositions = [7];
  const challengeIds = ['l5_c01'];

  let storyIndex = 0;
  let bonusIndex = 0;
  let challengeIndex = 0;

  for (let i = 0; i < 10; i++) {
    const pos = l5NodePositions[i];
    let nodeType: 'story' | 'boss' | 'bonus' | 'challenge' = 'story';
    let storyId = '';

    if (i === 9) {
      nodeType = 'boss';
      storyId = 'l5_boss';
    } else if (bonusPositions.includes(i) && bonusIndex < bonusIds.length) {
      nodeType = 'bonus';
      storyId = bonusIds[bonusIndex];
      bonusIndex++;
    } else if (challengePositions.includes(i) && challengeIndex < challengeIds.length) {
      nodeType = 'challenge';
      storyId = challengeIds[challengeIndex];
      challengeIndex++;
    } else if (storyIndex < storyIds.length) {
      nodeType = 'story';
      storyId = storyIds[storyIndex];
      storyIndex++;
    }

    const storyInfo = l5StoryTitles[storyId] || {
      title: `Node ${i + 1}`,
      titleCn: `节点 ${i + 1}`,
      emoji: '📖',
    };

    nodes.push({
      id: `node_l5_${String(i + 1).padStart(2, '0')}`,
      regionId: 'region_l5',
      type: nodeType,
      storyId,
      position: pos,
      prerequisites: i === 0 ? ['node_l4_boss'] : [`node_l5_${String(i).padStart(2, '0')}`],
      rewards: {
        magicPower: nodeType === 'boss' ? 80 : nodeType === 'challenge' ? 45 : 30,
        cards: nodeType === 'boss' ? ['star_guardian'] : [storyId.replace('l5_', '')],
      },
      unlocked: false,
      completed: false,
      title: storyInfo.title,
      titleCn: storyInfo.titleCn,
      emoji: storyInfo.emoji,
    });
  }

  l5RegionConfig.nodes = nodes.map(n => n.id);
  return nodes;
};

export default {
  l5RegionConfig,
  generateL5MapNodes,
  nodeIcons,
  l5StoryTitles,
};


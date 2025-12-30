/**
 * L3 闪耀之海地图数据
 * 深蓝色、珊瑚礁主题，15个节点
 */

import type { MapNode, MapRegion } from '@/db';

// L3 区域配置
export const l3RegionConfig: MapRegion = {
  id: 'region_l3',
  level: 3,
  name: 'Shimmering Ocean',
  nameCn: '闪耀之海',
  theme: 'ocean',
  backgroundColor: '#0a1628',
  backgroundImage: '/images/maps/l3-ocean.webp',
  nodes: [],
  unlockCondition: {
    requiredLevel: 3,
    requiredNodes: ['node_l2_boss'],
  },
};

// 节点类型图标映射
export const nodeIcons: Record<string, string> = {
  story: '📖',
  boss: '👑',
  bonus: '🎁',
  challenge: '⚡',
  treasure: '💎',
};

// 节点位置设计 - 海洋波浪状路径
// 坐标系：(0,0) 左上角，x 向右，y 向下
// 画布大小：400 x 1200
export const l3NodePositions: Array<{ x: number; y: number }> = [
  // 入海区域 (1-3)
  { x: 200, y: 80 },   // 节点 1 - 起点（海岸）
  { x: 280, y: 160 },  // 节点 2
  { x: 320, y: 260 },  // 节点 3

  // 珊瑚礁区 (4-6)
  { x: 260, y: 360 },  // 节点 4
  { x: 180, y: 420 },  // 节点 5 - 宝箱
  { x: 100, y: 360 },  // 节点 6

  // 深海区域 (7-9)
  { x: 80, y: 460 },   // 节点 7
  { x: 140, y: 560 },  // 节点 8
  { x: 220, y: 620 },  // 节点 9 - 中间挑战

  // 海底神殿区 (10-12)
  { x: 300, y: 560 },  // 节点 10
  { x: 340, y: 660 },  // 节点 11
  { x: 280, y: 760 },  // 节点 12 - 宝箱

  // 终点区域 (13-15)
  { x: 200, y: 860 },  // 节点 13
  { x: 140, y: 960 },  // 节点 14
  { x: 200, y: 1060 }, // 节点 15 - Boss（海洋守护者）
];

// 故事标题映射
export const l3StoryTitles: Record<string, { title: string; titleCn: string; emoji: string }> = {
  'l3_001': { title: 'The Little Mermaid', titleCn: '小美人鱼', emoji: '🧜‍♀️' },
  'l3_002': { title: 'The Clever Dolphin', titleCn: '聪明的海豚', emoji: '🐬' },
  'l3_003': { title: 'The Coral Kingdom', titleCn: '珊瑚王国', emoji: '🪸' },
  'l3_004': { title: 'The Pearl Necklace', titleCn: '珍珠项链', emoji: '📿' },
  'l3_005': { title: 'The Whale Song', titleCn: '鲸鱼之歌', emoji: '🐋' },
  'l3_006': { title: 'The Starfish Wish', titleCn: '海星的愿望', emoji: '⭐' },
  'l3_007': { title: 'The Ocean Storm', titleCn: '海洋风暴', emoji: '🌊' },
  'l3_008': { title: 'The Friendly Octopus', titleCn: '友善的章鱼', emoji: '🐙' },
  'l3_009': { title: 'The Sunken Ship', titleCn: '沉船宝藏', emoji: '🚢' },
  'l3_010': { title: 'The Light House', titleCn: '灯塔守护者', emoji: '🏠' },
  // 额外节点
  'l3_b01': { title: 'Ocean Quiz', titleCn: '海洋测验', emoji: '🎯' },
  'l3_b02': { title: 'Sea Creatures', titleCn: '海洋生物', emoji: '🦑' },
  'l3_c01': { title: 'Deep Dive', titleCn: '深海挑战', emoji: '⚡' },
  'l3_c02': { title: 'Coral Maze', titleCn: '珊瑚迷宫', emoji: '🧩' },
  'l3_boss': { title: 'Ocean Guardian', titleCn: '海洋守护者', emoji: '👑' },
};

/**
 * 生成 L3 地图节点
 */
export const generateL3MapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];

  // 主线故事节点
  const storyIds = [
    'l3_001', 'l3_002', 'l3_003', 'l3_004', 'l3_005',
    'l3_006', 'l3_007', 'l3_008', 'l3_009', 'l3_010',
  ];

  // Bonus 节点位置
  const bonusPositions = [4, 11]; // 节点索引
  const bonusIds = ['l3_b01', 'l3_b02'];

  // Challenge 节点位置
  const challengePositions = [8, 13]; // 节点索引
  const challengeIds = ['l3_c01', 'l3_c02'];

  let storyIndex = 0;
  let bonusIndex = 0;
  let challengeIndex = 0;

  for (let i = 0; i < 15; i++) {
    const pos = l3NodePositions[i];
    let nodeType: 'story' | 'boss' | 'bonus' | 'challenge' | 'treasure' = 'story';
    let storyId = '';

    // 最后一个节点是 Boss
    if (i === 14) {
      nodeType = 'boss';
      storyId = 'l3_boss';
    }
    // 检查是否是 Bonus 节点
    else if (bonusPositions.includes(i) && bonusIndex < bonusIds.length) {
      nodeType = 'bonus';
      storyId = bonusIds[bonusIndex];
      bonusIndex++;
    }
    // 检查是否是 Challenge 节点
    else if (challengePositions.includes(i) && challengeIndex < challengeIds.length) {
      nodeType = 'challenge';
      storyId = challengeIds[challengeIndex];
      challengeIndex++;
    }
    // 普通故事节点
    else if (storyIndex < storyIds.length) {
      nodeType = 'story';
      storyId = storyIds[storyIndex];
      storyIndex++;
    }

    const storyInfo = l3StoryTitles[storyId] || {
      title: `Node ${i + 1}`,
      titleCn: `节点 ${i + 1}`,
      emoji: '📖',
    };

    nodes.push({
      id: `node_l3_${String(i + 1).padStart(2, '0')}`,
      regionId: 'region_l3',
      type: nodeType,
      storyId,
      position: pos,
      prerequisites: i === 0 ? ['node_l2_boss'] : [`node_l3_${String(i).padStart(2, '0')}`],
      rewards: {
        magicPower: nodeType === 'boss' ? 60 : nodeType === 'challenge' ? 35 : 20,
        cards: nodeType === 'boss' ? ['ocean_guardian'] : [storyId.replace('l3_', '')],
      },
      unlocked: false,
      completed: false,
      title: storyInfo.title,
      titleCn: storyInfo.titleCn,
      emoji: storyInfo.emoji,
    });
  }

  // 更新区域配置的节点列表
  l3RegionConfig.nodes = nodes.map(n => n.id);

  return nodes;
};

/**
 * 获取节点之间的连接路径
 */
export const getNodeConnections = (nodes: MapNode[]): Array<{ from: string; to: string }> => {
  const connections: Array<{ from: string; to: string }> = [];

  for (let i = 1; i < nodes.length; i++) {
    connections.push({
      from: nodes[i - 1].id,
      to: nodes[i].id,
    });
  }

  return connections;
};

/**
 * 计算两节点之间的路径控制点（用于波浪曲线）
 */
export const getPathControlPoints = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): { cp1: { x: number; y: number }; cp2: { x: number; y: number } } => {
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  // 添加波浪效果
  const wave = Math.sin((from.y + to.y) / 200) * 20;

  return {
    cp1: { x: from.x + dx * 0.3 + wave, y: midY },
    cp2: { x: from.x + dx * 0.7 - wave, y: midY },
  };
};

export default {
  l3RegionConfig,
  generateL3MapNodes,
  getNodeConnections,
  getPathControlPoints,
  nodeIcons,
  l3StoryTitles,
};


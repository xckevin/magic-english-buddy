/**
 * L4 云端之城地图数据
 * 白色、金边建筑主题，12个节点
 */

import type { MapNode, MapRegion } from '@/db';

// L4 区域配置
export const l4RegionConfig: MapRegion = {
  id: 'region_l4',
  level: 4,
  name: 'Cloud City',
  nameCn: '云端之城',
  theme: 'cloud',
  backgroundColor: '#1a1a2e',
  backgroundImage: '/images/maps/l4-cloud.webp',
  nodes: [],
  unlockCondition: {
    requiredLevel: 4,
    requiredNodes: ['node_l3_boss'],
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

// 节点位置设计 - 云端阶梯状路径
// 坐标系：(0,0) 左上角，x 向右，y 向下
// 画布大小：400 x 1000
export const l4NodePositions: Array<{ x: number; y: number }> = [
  // 入城区域 (1-3)
  { x: 200, y: 80 },   // 节点 1 - 城门
  { x: 120, y: 160 },  // 节点 2
  { x: 200, y: 240 },  // 节点 3

  // 云端广场 (4-6)
  { x: 280, y: 320 },  // 节点 4
  { x: 200, y: 400 },  // 节点 5 - 中央广场
  { x: 120, y: 480 },  // 节点 6

  // 金色宫殿区 (7-9)
  { x: 200, y: 560 },  // 节点 7
  { x: 280, y: 640 },  // 节点 8
  { x: 200, y: 720 },  // 节点 9

  // 天空塔 (10-12)
  { x: 120, y: 800 },  // 节点 10
  { x: 200, y: 880 },  // 节点 11
  { x: 200, y: 980 },  // 节点 12 - Boss（云端守护者）
];

// 故事标题映射
export const l4StoryTitles: Record<string, { title: string; titleCn: string; emoji: string }> = {
  'l4_001': { title: 'The Cloud Princess', titleCn: '云端公主', emoji: '👸' },
  'l4_002': { title: 'The Golden Palace', titleCn: '金色宫殿', emoji: '🏰' },
  'l4_003': { title: 'The Sky Garden', titleCn: '天空花园', emoji: '🌷' },
  'l4_004': { title: 'The Wind Dragon', titleCn: '风之龙', emoji: '🐉' },
  'l4_005': { title: 'The Lost Prince', titleCn: '失落的王子', emoji: '🤴' },
  'l4_006': { title: 'The Magic Mirror', titleCn: '魔法镜子', emoji: '🪞' },
  'l4_007': { title: 'The Cloud Festival', titleCn: '云端节日', emoji: '🎉' },
  'l4_008': { title: 'The Brave Knight', titleCn: '勇敢的骑士', emoji: '⚔️' },
  // 额外节点
  'l4_b01': { title: 'Cloud Quiz', titleCn: '云端测验', emoji: '🎯' },
  'l4_c01': { title: 'Sky Challenge', titleCn: '天空挑战', emoji: '⚡' },
  'l4_boss': { title: 'Cloud Guardian', titleCn: '云端守护者', emoji: '👑' },
};

/**
 * 生成 L4 地图节点
 */
export const generateL4MapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];

  // 主线故事节点
  const storyIds = [
    'l4_001', 'l4_002', 'l4_003', 'l4_004',
    'l4_005', 'l4_006', 'l4_007', 'l4_008',
  ];

  // Bonus 节点位置
  const bonusPositions = [4]; // 节点索引
  const bonusIds = ['l4_b01'];

  // Challenge 节点位置
  const challengePositions = [9]; // 节点索引
  const challengeIds = ['l4_c01'];

  let storyIndex = 0;
  let bonusIndex = 0;
  let challengeIndex = 0;

  for (let i = 0; i < 12; i++) {
    const pos = l4NodePositions[i];
    let nodeType: 'story' | 'boss' | 'bonus' | 'challenge' = 'story';
    let storyId = '';

    // 最后一个节点是 Boss
    if (i === 11) {
      nodeType = 'boss';
      storyId = 'l4_boss';
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

    const storyInfo = l4StoryTitles[storyId] || {
      title: `Node ${i + 1}`,
      titleCn: `节点 ${i + 1}`,
      emoji: '📖',
    };

    nodes.push({
      id: `node_l4_${String(i + 1).padStart(2, '0')}`,
      regionId: 'region_l4',
      type: nodeType,
      storyId,
      position: pos,
      prerequisites: i === 0 ? ['node_l3_boss'] : [`node_l4_${String(i).padStart(2, '0')}`],
      rewards: {
        magicPower: nodeType === 'boss' ? 70 : nodeType === 'challenge' ? 40 : 25,
        cards: nodeType === 'boss' ? ['cloud_guardian'] : [storyId.replace('l4_', '')],
      },
      unlocked: false,
      completed: false,
      title: storyInfo.title,
      titleCn: storyInfo.titleCn,
      emoji: storyInfo.emoji,
    });
  }

  // 更新区域配置的节点列表
  l4RegionConfig.nodes = nodes.map(n => n.id);

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

export default {
  l4RegionConfig,
  generateL4MapNodes,
  getNodeConnections,
  nodeIcons,
  l4StoryTitles,
};


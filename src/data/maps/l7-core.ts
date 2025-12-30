/**
 * L7 创世之核地图数据
 * 抽象几何、纯白光芒主题，6个节点
 */

import type { MapNode, MapRegion } from '@/db';

// L7 区域配置
export const l7RegionConfig: MapRegion = {
  id: 'region_l7',
  level: 7,
  name: 'Genesis Core',
  nameCn: '创世之核',
  theme: 'abstract',
  backgroundColor: '#0a0a0f',
  backgroundImage: '/images/maps/l7-core.webp',
  nodes: [],
  unlockCondition: {
    requiredLevel: 7,
    requiredNodes: ['node_l6_boss'],
  },
};

// 节点位置设计 - 中心放射状
export const l7NodePositions: Array<{ x: number; y: number }> = [
  { x: 200, y: 80 },   // 顶点
  { x: 300, y: 200 },  // 右上
  { x: 280, y: 350 },  // 右下
  { x: 120, y: 350 },  // 左下
  { x: 100, y: 200 },  // 左上
  { x: 200, y: 500 },  // Boss - 核心
];

// 故事标题映射
export const l7StoryTitles: Record<string, { title: string; titleCn: string; emoji: string }> = {
  'l7_001': { title: 'The Origin of Language', titleCn: '语言的起源', emoji: '📚' },
  'l7_002': { title: 'The Power of Words', titleCn: '文字的力量', emoji: '✍️' },
  'l7_003': { title: 'Dreams and Reality', titleCn: '梦想与现实', emoji: '🌈' },
  'l7_004': { title: 'The Final Question', titleCn: '终极之问', emoji: '❓' },
  'l7_boss': { title: 'The Genesis Guardian', titleCn: '创世守护者', emoji: '👑' },
};

/**
 * 生成 L7 地图节点
 */
export const generateL7MapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];
  const storyIds = ['l7_001', 'l7_002', 'l7_003', 'l7_004'];

  for (let i = 0; i < 6; i++) {
    const pos = l7NodePositions[i];
    let nodeType: 'story' | 'boss' | 'challenge' = 'story';
    let storyId = '';

    if (i === 5) {
      nodeType = 'boss';
      storyId = 'l7_boss';
    } else if (i === 4) {
      nodeType = 'challenge';
      storyId = 'l7_c01';
    } else if (i < storyIds.length) {
      storyId = storyIds[i];
    }

    const storyInfo = l7StoryTitles[storyId] || {
      title: `Node ${i + 1}`,
      titleCn: `节点 ${i + 1}`,
      emoji: '📖',
    };

    nodes.push({
      id: `node_l7_${String(i + 1).padStart(2, '0')}`,
      regionId: 'region_l7',
      type: nodeType,
      storyId,
      position: pos,
      prerequisites: i === 0 ? ['node_l6_boss'] : [`node_l7_${String(i).padStart(2, '0')}`],
      rewards: {
        magicPower: nodeType === 'boss' ? 150 : nodeType === 'challenge' ? 70 : 50,
        cards: nodeType === 'boss' ? ['genesis_guardian'] : [storyId.replace('l7_', '')],
      },
      unlocked: false,
      completed: false,
      title: storyInfo.title,
      titleCn: storyInfo.titleCn,
      emoji: storyInfo.emoji,
    });
  }

  l7RegionConfig.nodes = nodes.map(n => n.id);
  return nodes;
};

export default {
  l7RegionConfig,
  generateL7MapNodes,
  l7StoryTitles,
};


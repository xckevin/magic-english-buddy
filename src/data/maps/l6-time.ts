/**
 * L6 时光回廊地图数据
 * 蒸汽朋克、齿轮、沙漏主题，8个节点
 */

import type { MapNode, MapRegion } from '@/db';

// L6 区域配置
export const l6RegionConfig: MapRegion = {
  id: 'region_l6',
  level: 6,
  name: 'Time Corridor',
  nameCn: '时光回廊',
  theme: 'steampunk',
  backgroundColor: '#1a1510',
  backgroundImage: '/images/maps/l6-time.webp',
  nodes: [],
  unlockCondition: {
    requiredLevel: 6,
    requiredNodes: ['node_l5_boss'],
  },
};

// 节点位置设计 - 齿轮状路径
export const l6NodePositions: Array<{ x: number; y: number }> = [
  { x: 200, y: 60 },
  { x: 300, y: 150 },
  { x: 280, y: 280 },
  { x: 180, y: 380 },
  { x: 100, y: 280 },
  { x: 120, y: 480 },
  { x: 220, y: 580 },
  { x: 200, y: 700 },
];

// 故事标题映射
export const l6StoryTitles: Record<string, { title: string; titleCn: string; emoji: string }> = {
  'l6_001': { title: 'The Time Machine', titleCn: '时间机器', emoji: '⏰' },
  'l6_002': { title: 'The Inventor', titleCn: '发明家', emoji: '🔧' },
  'l6_003': { title: 'The Clockwork City', titleCn: '发条之城', emoji: '⚙️' },
  'l6_004': { title: 'The Hourglass', titleCn: '沙漏之谜', emoji: '⏳' },
  'l6_005': { title: 'The Steam Engine', titleCn: '蒸汽引擎', emoji: '🚂' },
  'l6_c01': { title: 'Time Challenge', titleCn: '时光挑战', emoji: '⚡' },
  'l6_boss': { title: 'Time Guardian', titleCn: '时间守护者', emoji: '👑' },
};

/**
 * 生成 L6 地图节点
 */
export const generateL6MapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];
  const storyIds = ['l6_001', 'l6_002', 'l6_003', 'l6_004', 'l6_005'];
  const challengePositions = [5];
  const challengeIds = ['l6_c01'];

  let storyIndex = 0;
  let challengeIndex = 0;

  for (let i = 0; i < 8; i++) {
    const pos = l6NodePositions[i];
    let nodeType: 'story' | 'boss' | 'challenge' = 'story';
    let storyId = '';

    if (i === 7) {
      nodeType = 'boss';
      storyId = 'l6_boss';
    } else if (challengePositions.includes(i) && challengeIndex < challengeIds.length) {
      nodeType = 'challenge';
      storyId = challengeIds[challengeIndex];
      challengeIndex++;
    } else if (storyIndex < storyIds.length) {
      storyId = storyIds[storyIndex];
      storyIndex++;
    }

    const storyInfo = l6StoryTitles[storyId] || {
      title: `Node ${i + 1}`,
      titleCn: `节点 ${i + 1}`,
      emoji: '📖',
    };

    nodes.push({
      id: `node_l6_${String(i + 1).padStart(2, '0')}`,
      regionId: 'region_l6',
      type: nodeType,
      storyId,
      position: pos,
      prerequisites: i === 0 ? ['node_l5_boss'] : [`node_l6_${String(i).padStart(2, '0')}`],
      rewards: {
        magicPower: nodeType === 'boss' ? 100 : nodeType === 'challenge' ? 55 : 40,
        cards: nodeType === 'boss' ? ['time_guardian'] : [storyId.replace('l6_', '')],
      },
      unlocked: false,
      completed: false,
      title: storyInfo.title,
      titleCn: storyInfo.titleCn,
      emoji: storyInfo.emoji,
    });
  }

  l6RegionConfig.nodes = nodes.map(n => n.id);
  return nodes;
};

export default {
  l6RegionConfig,
  generateL6MapNodes,
  l6StoryTitles,
};


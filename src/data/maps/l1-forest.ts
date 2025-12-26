/**
 * L1 萌芽之森地图数据
 * 蜿蜒路径设计，20个节点，渐进解锁
 */

import type { MapNode, MapRegion } from '@/db';

// L1 区域配置
export const l1RegionConfig: MapRegion = {
  id: 'region_l1',
  level: 1,
  name: 'Sprout Forest',
  nameCn: '萌芽之森',
  theme: 'forest',
  backgroundColor: '#0F1419',
  backgroundImage: '/images/maps/l1-forest.webp',
  nodes: [],
  unlockCondition: {
    requiredLevel: 1,
    requiredNodes: [],
  },
};

// 节点类型图标映射
export const nodeIcons: Record<string, string> = {
  story: '📖',
  boss: '👑',
  bonus: '🎁',
  challenge: '⚡',
};

// 节点位置设计 - 蜿蜒路径
// 坐标系：(0,0) 左上角，x 向右，y 向下
// 画布大小：400 x 1600 (高度根据节点数量调整)
export const l1NodePositions: Array<{ x: number; y: number }> = [
  // 起点区域 (1-3)
  { x: 200, y: 100 },   // 节点 1 - 起点
  { x: 280, y: 180 },   // 节点 2
  { x: 320, y: 280 },   // 节点 3
  
  // 第一个弯道 (4-6)
  { x: 280, y: 380 },   // 节点 4
  { x: 200, y: 440 },   // 节点 5
  { x: 120, y: 380 },   // 节点 6
  
  // 中段攀升 (7-10)
  { x: 80, y: 480 },    // 节点 7
  { x: 120, y: 580 },   // 节点 8
  { x: 200, y: 640 },   // 节点 9
  { x: 280, y: 580 },   // 节点 10 - 中间 Boss
  
  // 第二个弯道 (11-14)
  { x: 320, y: 680 },   // 节点 11
  { x: 280, y: 780 },   // 节点 12
  { x: 200, y: 840 },   // 节点 13
  { x: 120, y: 780 },   // 节点 14
  
  // 终段冲刺 (15-18)
  { x: 80, y: 880 },    // 节点 15
  { x: 120, y: 980 },   // 节点 16
  { x: 200, y: 1040 },  // 节点 17
  { x: 280, y: 1120 },  // 节点 18
  
  // 终点区域 (19-20)
  { x: 200, y: 1220 },  // 节点 19
  { x: 200, y: 1340 },  // 节点 20 - 最终 Boss
];

// 故事标题映射
export const l1StoryTitles: Record<string, { title: string; titleCn: string; emoji: string }> = {
  'l1_001': { title: 'The Magic Apple', titleCn: '魔法苹果', emoji: '🍎' },
  'l1_002': { title: 'A Little Cat', titleCn: '小猫咪', emoji: '🐱' },
  'l1_003': { title: 'Colors', titleCn: '颜色', emoji: '🌈' },
  'l1_004': { title: 'My Family', titleCn: '我的家人', emoji: '👨‍👩‍👧' },
  'l1_005': { title: 'Good Morning', titleCn: '早上好', emoji: '🌅' },
  'l1_006': { title: 'Numbers', titleCn: '数字', emoji: '🔢' },
  'l1_007': { title: 'The Dog', titleCn: '小狗', emoji: '🐶' },
  'l1_008': { title: 'The Park', titleCn: '公园', emoji: '🏞️' },
  'l1_009': { title: 'My Toys', titleCn: '我的玩具', emoji: '🧸' },
  'l1_010': { title: 'Good Night', titleCn: '晚安', emoji: '🌙' },
  // 额外 10 个节点 (bonus/challenge)
  'l1_b01': { title: 'Color Quiz', titleCn: '颜色测验', emoji: '🎨' },
  'l1_b02': { title: 'Animal Friends', titleCn: '动物朋友', emoji: '🐾' },
  'l1_b03': { title: 'Number Game', titleCn: '数字游戏', emoji: '🎯' },
  'l1_b04': { title: 'Family Fun', titleCn: '家庭乐趣', emoji: '🎪' },
  'l1_b05': { title: 'Word Match', titleCn: '单词配对', emoji: '🧩' },
  'l1_c01': { title: 'Speed Reading', titleCn: '速读挑战', emoji: '⚡' },
  'l1_c02': { title: 'Memory Master', titleCn: '记忆大师', emoji: '🧠' },
  'l1_c03': { title: 'Spelling Bee', titleCn: '拼写达人', emoji: '🐝' },
  'l1_c04': { title: 'Listening Pro', titleCn: '听力达人', emoji: '👂' },
  'l1_boss': { title: 'Forest Guardian', titleCn: '森林守护者', emoji: '👑' },
};

/**
 * 生成 L1 地图节点
 */
export const generateL1MapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];
  
  // 主线故事节点 (1-10)
  const storyIds = [
    'l1_001', 'l1_002', 'l1_003', 'l1_004', 'l1_005',
    'l1_006', 'l1_007', 'l1_008', 'l1_009', 'l1_010',
  ];
  
  // Bonus 节点位置
  const bonusPositions = [3, 6, 12, 16, 18]; // 节点索引
  const bonusIds = ['l1_b01', 'l1_b02', 'l1_b03', 'l1_b04', 'l1_b05'];
  
  // Challenge 节点位置
  const challengePositions = [5, 8, 14, 17]; // 节点索引
  const challengeIds = ['l1_c01', 'l1_c02', 'l1_c03', 'l1_c04'];
  
  let storyIndex = 0;
  let bonusIndex = 0;
  let challengeIndex = 0;
  
  for (let i = 0; i < 20; i++) {
    const pos = l1NodePositions[i];
    let nodeType: 'story' | 'boss' | 'bonus' | 'challenge' = 'story';
    let storyId = '';
    
    // 最后一个节点是 Boss
    if (i === 19) {
      nodeType = 'boss';
      storyId = 'l1_boss';
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
    
    const storyInfo = l1StoryTitles[storyId] || {
      title: `Node ${i + 1}`,
      titleCn: `节点 ${i + 1}`,
      emoji: '📖',
    };
    
    nodes.push({
      id: `node_l1_${String(i + 1).padStart(2, '0')}`,
      regionId: 'region_l1',
      type: nodeType,
      storyId,
      position: pos,
      prerequisites: i === 0 ? [] : [`node_l1_${String(i).padStart(2, '0')}`],
      rewards: {
        magicPower: nodeType === 'boss' ? 50 : nodeType === 'challenge' ? 30 : 15,
        cards: nodeType === 'boss' ? ['forest_guardian'] : [storyId.replace('l1_', '')],
      },
      unlocked: i === 0, // 只有第一个节点解锁
      completed: false,
      title: storyInfo.title,
      titleCn: storyInfo.titleCn,
      emoji: storyInfo.emoji,
    });
  }
  
  // 更新区域配置的节点列表
  l1RegionConfig.nodes = nodes.map(n => n.id);
  
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
 * 计算两节点之间的路径控制点（用于曲线）
 */
export const getPathControlPoints = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): { cp1: { x: number; y: number }; cp2: { x: number; y: number } } => {
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  
  return {
    cp1: { x: from.x + dx * 0.3, y: midY },
    cp2: { x: from.x + dx * 0.7, y: midY },
  };
};

export default {
  l1RegionConfig,
  generateL1MapNodes,
  getNodeConnections,
  getPathControlPoints,
  nodeIcons,
  l1StoryTitles,
};


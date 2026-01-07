/**
 * MapPath 组件
 * 节点之间的连接路径
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface MapPathProps {
  /** 起点坐标 */
  from: { x: number; y: number };
  /** 终点坐标 */
  to: { x: number; y: number };
  /** 终点是否已解锁 */
  unlocked?: boolean;
  /** 起点是否已完成 */
  completed?: boolean;
}

export const MapPath = memo<MapPathProps>(({
  from,
  to,
  unlocked = false,
  completed = false,
}) => {
  // 计算贝塞尔曲线控制点
  const pathData = useMemo(() => {
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // 根据方向调整控制点
    let cp1x, cp1y, cp2x, cp2y;
    
    if (Math.abs(dx) > Math.abs(dy) / 2) {
      // 更水平的路径
      cp1x = from.x + dx * 0.5;
      cp1y = from.y;
      cp2x = from.x + dx * 0.5;
      cp2y = to.y;
    } else {
      // 更垂直的路径
      cp1x = from.x;
      cp1y = midY;
      cp2x = to.x;
      cp2y = midY;
    }
    
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
  }, [from, to]);

  // 路径颜色
  const strokeColor = completed
    ? '#10B981' // 绿色 - 已完成
    : unlocked
      ? '#6B5CE7' // 紫色 - 已解锁
      : '#374151'; // 灰色 - 未解锁

  // 发光效果
  const glowColor = completed
    ? 'rgba(16, 185, 129, 0.3)'
    : unlocked
      ? 'rgba(107, 92, 231, 0.3)'
      : 'transparent';

  return (
    <g>
      {/* 发光背景 */}
      {(completed || unlocked) && (
        <motion.path
          d={pathData}
          fill="none"
          stroke={glowColor}
          strokeWidth={12}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* 主路径 */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={unlocked ? '0' : '8 8'}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* 流动粒子效果（已解锁路径） */}
      {unlocked && !completed && (
        <motion.circle
          r={3}
          fill="#A78BFA"
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'linear',
          }}
          style={{
            offsetPath: `path("${pathData}")`,
          }}
        />
      )}
    </g>
  );
});

MapPath.displayName = 'MapPath';

export default MapPath;


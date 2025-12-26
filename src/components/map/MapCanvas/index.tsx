/**
 * MapCanvas 组件
 * 可缩放、可拖动的地图画布
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { MapNode } from '@/db';
import { MapNodeComponent } from '../MapNode';
import { MapPath } from '../MapPath';
import { FogOverlay } from '../FogOverlay';
import styles from './MapCanvas.module.css';

interface MapCanvasProps {
  /** 地图节点 */
  nodes: MapNode[];
  /** 当前激活的节点 ID */
  activeNodeId?: string;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 节点点击回调 */
  onNodeClick?: (node: MapNode) => void;
  /** 是否显示迷雾 */
  showFog?: boolean;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  nodes,
  activeNodeId,
  width = 400,
  height = 1500,
  onNodeClick,
  showFog = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 拖动位置
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // 缩放
  const scale = useMotionValue(1);
  
  // 约束范围
  const constraintsRef = useRef({ top: 0, bottom: 0, left: 0, right: 0 });

  // 计算约束
  useEffect(() => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxX = 0;
      const minX = -(width * scale.get() - containerRect.width);
      const maxY = 0;
      const minY = -(height * scale.get() - containerRect.height);
      
      constraintsRef.current = {
        top: minY,
        bottom: maxY,
        left: minX,
        right: maxX,
      };
    }
  }, [width, height, scale]);

  // 自动滚动到当前激活节点
  useEffect(() => {
    if (activeNodeId && containerRef.current) {
      const activeNode = nodes.find(n => n.id === activeNodeId);
      if (activeNode) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const targetY = -(activeNode.position.y - containerRect.height / 2);
        const targetX = -(activeNode.position.x - containerRect.width / 2);
        
        // 限制在约束范围内
        const clampedY = Math.max(
          constraintsRef.current.top,
          Math.min(constraintsRef.current.bottom, targetY)
        );
        const clampedX = Math.max(
          constraintsRef.current.left,
          Math.min(constraintsRef.current.right, targetX)
        );
        
        animate(y, clampedY, { duration: 0.5 });
        animate(x, clampedX, { duration: 0.5 });
      }
    }
  }, [activeNodeId, nodes, x, y]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: MapNode) => {
    if (!isDragging) {
      onNodeClick?.(node);
    }
  }, [isDragging, onNodeClick]);

  // 拖动开始
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // 拖动结束
  const handleDragEnd = useCallback(() => {
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  // 获取节点连接
  const connections = nodes.slice(1).map((node, index) => ({
    from: nodes[index],
    to: node,
  }));

  return (
    <div ref={containerRef} className={styles.container}>
      <motion.div
        className={styles.canvas}
        style={{
          width,
          height,
          x,
          y,
          scale,
        }}
        drag
        dragConstraints={constraintsRef.current}
        dragElastic={0.1}
        dragMomentum={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 背景装饰 */}
        <div className={styles.background}>
          {/* 装饰性树木 */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={styles.tree}
              style={{
                left: `${(i * 67) % 100}%`,
                top: `${(i * 89) % 100}%`,
                opacity: 0.3 + (i % 3) * 0.2,
                transform: `scale(${0.5 + (i % 4) * 0.2})`,
              }}
            >
              🌲
            </div>
          ))}
        </div>

        {/* 路径连接 */}
        <svg className={styles.pathLayer} viewBox={`0 0 ${width} ${height}`}>
          {connections.map(({ from, to }) => (
            <MapPath
              key={`${from.id}-${to.id}`}
              from={from.position}
              to={to.position}
              unlocked={to.unlocked || false}
              completed={from.completed || false}
            />
          ))}
        </svg>

        {/* 节点层 */}
        <div className={styles.nodeLayer}>
          {nodes.map((node) => (
            <MapNodeComponent
              key={node.id}
              node={node}
              isActive={node.id === activeNodeId}
              onClick={() => handleNodeClick(node)}
            />
          ))}
        </div>

        {/* 迷雾遮罩 */}
        {showFog && (
          <FogOverlay
            nodes={nodes}
            width={width}
            height={height}
          />
        )}
      </motion.div>
    </div>
  );
};

export default MapCanvas;


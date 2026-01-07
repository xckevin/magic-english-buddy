/**
 * MapCanvas 组件
 * 马里奥风格地图画布 - 响应式网格布局
 */

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
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
  /** 画布宽度 (已弃用，自动计算) */
  width?: number;
  /** 画布高度 (已弃用，自动计算) */
  height?: number;
  /** 节点点击回调 */
  onNodeClick?: (node: MapNode) => void;
  /** 是否显示迷雾 */
  showFog?: boolean;
}

// 布局配置
const LAYOUT_CONFIG = {
  minNodesPerRow: 3,
  maxNodesPerRow: 5,
  minRowsVisible: 3,
  maxRowsVisible: 6,
  nodeMinSize: 52,
  nodeMaxSize: 80,
  horizontalPadding: 24,
  verticalPadding: 80, // 头部和底部留白
  rowGap: 0.4, // 行间距系数（相对于节点大小）
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  nodes,
  activeNodeId,
  onNodeClick,
  showFog = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // 拖动位置（只使用垂直滚动）
  const y = useMotionValue(0);
  
  // 约束范围
  const constraintsRef = useRef({ top: 0, bottom: 0, left: 0, right: 0 });
  
  // 监听容器尺寸变化
  // 兼容不支持 ResizeObserver 的浏览器（如旧版微信 WebView）
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    
    updateSize();
    
    // 优先使用 ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    } else {
      // Fallback: 使用 window resize 事件
      window.addEventListener('resize', updateSize);
      window.addEventListener('orientationchange', updateSize);
      return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
      };
    }
  }, []);

  // 计算响应式布局
  const layout = useMemo(() => {
    if (containerSize.width === 0 || nodes.length === 0) {
      return { nodesPerRow: 4, nodeSize: 56, rowHeight: 100, positions: [], canvasHeight: 0 };
    }

    const { width, height } = containerSize;
    const availableWidth = width - LAYOUT_CONFIG.horizontalPadding * 2;
    const availableHeight = height - LAYOUT_CONFIG.verticalPadding;
    
    // 计算每行节点数：根据屏幕宽度决定
    // 小屏幕（<500px）: 3个，中屏幕（500-900px）: 4个，大屏幕（>900px）: 5个
    let nodesPerRow: number;
    if (width < 500) {
      nodesPerRow = LAYOUT_CONFIG.minNodesPerRow; // 3
    } else if (width < 900) {
      nodesPerRow = 4;
    } else {
      nodesPerRow = LAYOUT_CONFIG.maxNodesPerRow; // 5
    }
    
    // 计算节点大小：确保在最小和最大之间
    const idealNodeSize = availableWidth / nodesPerRow * 0.6;
    const nodeSize = Math.min(
      LAYOUT_CONFIG.nodeMaxSize,
      Math.max(LAYOUT_CONFIG.nodeMinSize, idealNodeSize)
    );
    
    // 计算行高
    const totalRows = Math.ceil(nodes.length / nodesPerRow);
    const rowHeight = nodeSize * (1 + LAYOUT_CONFIG.rowGap) + 30; // +30 for labels
    
    // 计算画布总高度
    const canvasHeight = Math.max(
      availableHeight,
      totalRows * rowHeight + LAYOUT_CONFIG.verticalPadding
    );
    
    // 计算每个节点的位置（蛇形布局）
    const positions = nodes.map((_node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const colInRow = index % nodesPerRow;
      
      // 蛇形：偶数行从左到右，奇数行从右到左
      const col = row % 2 === 0 ? colInRow : (nodesPerRow - 1 - colInRow);
      
      // 计算水平位置
      const totalNodesWidth = nodesPerRow * nodeSize;
      const totalGapWidth = availableWidth - totalNodesWidth;
      const gap = totalGapWidth / (nodesPerRow + 1);
      const xPos = LAYOUT_CONFIG.horizontalPadding + gap + col * (nodeSize + gap) + nodeSize / 2;
      
      // 计算垂直位置
      const yPos = LAYOUT_CONFIG.verticalPadding / 2 + row * rowHeight + nodeSize / 2;
      
      return { x: xPos, y: yPos };
    });
    
    return { nodesPerRow, nodeSize, rowHeight, positions, canvasHeight };
  }, [containerSize, nodes]);

  // 计算画布尺寸
  const canvasWidth = containerSize.width;
  const canvasHeight = layout.canvasHeight;

  // 计算约束
  useEffect(() => {
    if (containerSize.width === 0) return;
    
    const minY = Math.min(0, -(canvasHeight - containerSize.height));
    const maxY = 0;
    
    constraintsRef.current = {
      top: minY,
      bottom: maxY,
      left: 0,
      right: 0,
    };
  }, [containerSize, canvasHeight]);

  // 自动滚动到当前激活节点
  useEffect(() => {
    if (activeNodeId && containerSize.width > 0 && layout.positions.length > 0) {
      const activeIndex = nodes.findIndex(n => n.id === activeNodeId);
      const pos = layout.positions[activeIndex];
      if (activeIndex >= 0 && pos) {
        const targetY = -(pos.y - containerSize.height / 2);
        
        const clampedY = Math.max(
          constraintsRef.current.top,
          Math.min(constraintsRef.current.bottom, targetY)
        );
        
        animate(y, clampedY, { duration: 0.5 });
      }
    }
  }, [activeNodeId, nodes, y, containerSize, layout.positions]);

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

  // 使用新布局位置的节点
  const layoutNodes = useMemo(() => {
    return nodes.map((node, index) => ({
      ...node,
      position: layout.positions[index] || { x: 0, y: 0 },
    }));
  }, [nodes, layout.positions]);

  // 获取节点连接
  const connections = layoutNodes.slice(1).map((node, index) => {
    const fromNode = layoutNodes[index];
    return fromNode ? { from: fromNode, to: node } : null;
  }).filter((conn): conn is { from: typeof layoutNodes[0]; to: typeof layoutNodes[0] } => conn !== null);

  // 如果还没有尺寸，显示加载
  if (containerSize.width === 0) {
    return <div ref={containerRef} className={styles.container} />;
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <motion.div
        className={styles.canvas}
        style={{
          width: canvasWidth,
          height: canvasHeight,
          x: 0,
          y,
        }}
        drag="y"
        dragConstraints={constraintsRef.current}
        dragElastic={0.1}
        dragMomentum={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 背景装饰 */}
        <div className={styles.background}>
          {/* 装饰性树木 - 分散在地图上 */}
          {[...Array(Math.ceil(canvasHeight / 200) * 3)].map((_, i) => (
            <div
              key={i}
              className={styles.tree}
              style={{
                left: `${10 + (i * 37) % 80}%`,
                top: `${(i * 200 / canvasHeight * 100) % 100}%`,
                opacity: 0.2 + (i % 3) * 0.1,
                fontSize: `${24 + (i % 3) * 8}px`,
              }}
            >
              {['🌲', '🌳', '🌴', '🍀'][i % 4]}
            </div>
          ))}
        </div>

        {/* 路径连接 */}
        <svg className={styles.pathLayer} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
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
          {layoutNodes.map((node) => (
            <MapNodeComponent
              key={node.id}
              node={node}
              isActive={node.id === activeNodeId}
              onClick={() => handleNodeClick(nodes.find(n => n.id === node.id)!)}
              size={layout.nodeSize}
            />
          ))}
        </div>

        {/* 迷雾遮罩 */}
        {showFog && (
          <FogOverlay
            nodes={layoutNodes}
            width={canvasWidth}
            height={canvasHeight}
          />
        )}
      </motion.div>
    </div>
  );
};

export default MapCanvas;


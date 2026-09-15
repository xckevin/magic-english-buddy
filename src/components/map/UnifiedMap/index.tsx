/**
 * UnifiedMap - 统一地图组件
 * 多邻国风格的垂直滚动地图，展示所有级别的节点
 *
 * 特点：
 * - 从下往上滚动（起点在底部）
 * - 自动定位到当前进度
 * - 不同类型节点有不同视觉样式
 * - 级别之间有分隔区域
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { getUserMapNodes } from '@/services/mapProgressService';
import {
  generateUnifiedMapData,
  findActiveNode,
  getLevelProgress,
  type UnifiedMapNode,
  type LevelSection,
} from '@/data/unifiedMap';
import MapNode from './MapNode';
import PathConnector from './PathConnector';
import LevelDivider from './LevelDivider';
import styles from './styles.module.css';

interface UnifiedMapProps {
  /** 节点点击回调 */
  onNodeClick: (node: UnifiedMapNode) => void;
  /** 是否显示加载状态 */
  loading?: boolean;
}

const UnifiedMap: React.FC<UnifiedMapProps> = ({ onNodeClick, loading: externalLoading }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<UnifiedMapNode[]>([]);
  const [sections, setSections] = useState<LevelSection[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasScrolledToActive, setHasScrolledToActive] = useState(false);
  const currentUserId = useAppStore(s => s.currentUserId);

  // 生成并加载地图数据
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        const mapData = generateUnifiedMapData();
        const userNodes = currentUserId ? await getUserMapNodes(currentUserId) : [];
        if (useAppStore.getState().currentUserId !== currentUserId) return;
        const mergedNodes = mapData.nodes.map(node => {
          const userNode = userNodes.find(
            saved => saved.id === node.id || saved.storyId === node.storyId
          );
          return userNode
            ? {
                ...node,
                ...userNode,
                level: node.level,
                globalIndex: node.globalIndex,
                levelIndex: node.levelIndex,
                theme: node.theme,
                isLevelStart: node.isLevelStart,
                isLevelEnd: node.isLevelEnd,
              }
            : node;
        });

        setNodes(mergedNodes);
        setSections(mapData.sections);

        // 找到当前活跃节点
        const activeNode = findActiveNode(mergedNodes);
        if (activeNode) {
          setActiveNodeId(activeNode.id);
        }
      } catch (error) {
        console.error('Failed to load unified map data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [currentUserId]);

  // 自动滚动到当前活跃节点
  useEffect(() => {
    if (!loading && activeNodeId && !hasScrolledToActive && scrollContainerRef.current) {
      // 延迟一下确保 DOM 已渲染
      const timer = setTimeout(() => {
        const activeElement = document.getElementById(`node-${activeNodeId}`);
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          setHasScrolledToActive(true);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [loading, activeNodeId, hasScrolledToActive]);

  // 快速导航到顶部（最新关卡）
  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // 快速导航到当前进度
  const scrollToActive = useCallback(() => {
    const activeElement = document.getElementById(`node-${activeNodeId}`);
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeNodeId]);

  // 快速导航到底部（起点）
  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  // 渲染节点和连接线
  const renderMapItems = useMemo(() => {
    if (nodes.length === 0) return null;

    const items: React.ReactNode[] = [];

    // 反转节点顺序（从高到低显示，但视觉上从下往上）
    const reversedNodes = [...nodes].reverse();
    const reversedSections = [...sections].reverse();

    reversedNodes.forEach((node, index) => {
      const originalIndex = nodes.length - 1 - index;

      // 检查是否需要添加级别分隔器
      const section = reversedSections.find(s => s.endIndex === originalIndex);
      if (section) {
        const progress = getLevelProgress(nodes, section.level);
        const isCurrentLevel = nodes.find(n => n.id === activeNodeId)?.level === section.level;
        const isUnlocked = nodes.some(n => n.level === section.level && n.unlocked);

        items.push(
          <LevelDivider
            key={`level-${section.level}`}
            section={section}
            progress={progress}
            isCurrentLevel={isCurrentLevel}
            isUnlocked={isUnlocked}
          />
        );
      }

      // 添加连接线（不是最后一个节点时）
      const nextNode = reversedNodes[index + 1];
      if (index < reversedNodes.length - 1 && nextNode) {
        const isActive = node.unlocked || nextNode.unlocked;
        const isCompleted = Boolean(node.completed && nextNode.completed);

        items.push(
          <PathConnector
            key={`path-${node.id}`}
            fromNode={nextNode}
            toNode={node}
            isActive={Boolean(isActive)}
            isCompleted={isCompleted}
          />
        );
      }

      // 添加节点
      items.push(
        <div key={node.id} id={`node-${node.id}`}>
          <MapNode node={node} isActive={node.id === activeNodeId} onClick={onNodeClick} />
        </div>
      );
    });

    return items;
  }, [nodes, sections, activeNodeId, onNodeClick]);

  // 背景星星装饰
  const bgStars = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => (
      <div
        key={i}
        className={styles.bgStar}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ));
  }, []);

  const isLoading = loading || externalLoading;

  return (
    <div className={styles.container}>
      {/* 背景装饰 */}
      <div className={styles.bgDecoration}>{bgStars}</div>

      {/* 顶部渐变遮罩 */}
      <div className={styles.topGradient} />

      {/* 滚动容器 */}
      <div ref={scrollContainerRef} className={styles.scrollContainer}>
        <div className={`${styles.mapContent} ${styles.mapContentReversed}`}>{renderMapItems}</div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className={styles.bottomGradient} />

      {/* 快速导航 */}
      <div className={styles.quickNav}>
        <button className={styles.quickNavBtn} onClick={scrollToTop} title="跳到顶部">
          ⬆️
        </button>
        <button className={styles.quickNavBtn} onClick={scrollToActive} title="当前进度">
          🎯
        </button>
        <button className={styles.quickNavBtn} onClick={scrollToBottom} title="跳到起点">
          ⬇️
        </button>
      </div>

      {/* 加载状态 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={styles.loadingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>正在绘制魔法地图...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedMap;
export { MapNode, PathConnector, LevelDivider };
export type { UnifiedMapNode };

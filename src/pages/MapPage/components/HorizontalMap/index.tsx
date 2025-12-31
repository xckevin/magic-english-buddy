/**
 * HorizontalMap - 横向滚动地图容器
 * 沉浸式横向卷轴地图，按区域（Level）划分场景
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { db } from '@/db';
import {
  generateUnifiedMapData,
  mergeNodeStates,
  findActiveNode,
  getNodesByLevel,
  getLevelProgress,
  levelThemeColors,
  type UnifiedMapNode,
  type LevelSection,
} from '@/data/unifiedMap';
import RegionScene from '../RegionScene';
import RegionIndicator from '../RegionIndicator';
import styles from './styles.module.css';

// ============ 滑动提示 Hook ============

const SWIPE_HINT_KEY = 'map_swipe_hint';
const MAX_TOTAL_SHOWS = 3;
const MAX_DAILY_SHOWS = 2;
const HINT_DURATION = 5000; // 5秒

interface SwipeHintData {
  totalShows: number;
  dailyShows: number;
  lastDate: string;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getSwipeHintData = (): SwipeHintData => {
  try {
    const stored = localStorage.getItem(SWIPE_HINT_KEY);
    if (stored) {
      const data = JSON.parse(stored) as SwipeHintData;
      // 如果是新的一天，重置每日计数
      if (data.lastDate !== getTodayDate()) {
        return { ...data, dailyShows: 0, lastDate: getTodayDate() };
      }
      return data;
    }
  } catch {
    // ignore parse errors
  }
  return { totalShows: 0, dailyShows: 0, lastDate: getTodayDate() };
};

const incrementSwipeHintCount = () => {
  const data = getSwipeHintData();
  const newData: SwipeHintData = {
    totalShows: data.totalShows + 1,
    dailyShows: data.dailyShows + 1,
    lastDate: getTodayDate(),
  };
  localStorage.setItem(SWIPE_HINT_KEY, JSON.stringify(newData));
};

const useSwipeHint = () => {
  const [showHint, setShowHint] = useState(false);
  const hasShownRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 只在首次挂载时检查
    if (hasShownRef.current) return;

    const data = getSwipeHintData();
    const canShow = data.totalShows < MAX_TOTAL_SHOWS && data.dailyShows < MAX_DAILY_SHOWS;

    if (canShow) {
      hasShownRef.current = true;
      
      // 延迟1秒显示
      const showTimer = setTimeout(() => {
        setShowHint(true);
        incrementSwipeHintCount();
        
        // 5秒后自动隐藏
        hideTimerRef.current = setTimeout(() => {
          setShowHint(false);
        }, HINT_DURATION);
      }, 1000);
      
      return () => {
        clearTimeout(showTimer);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      };
    }
  }, []);

  const hideHint = useCallback(() => {
    setShowHint(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  return { showHint, hideHint };
};

// ============ 组件 Props ============

interface HorizontalMapProps {
  /** 节点点击回调 */
  onNodeClick: (node: UnifiedMapNode) => void;
}

const HorizontalMap: React.FC<HorizontalMapProps> = ({ onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 地图数据
  const [nodes, setNodes] = useState<UnifiedMapNode[]>([]);
  const [sections, setSections] = useState<LevelSection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 当前区域索引
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState<string>('');
  
  // 滚动状态
  const scrollX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // 滑动提示
  const { showHint, hideHint } = useSwipeHint();

  // 加载地图数据
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        const mapData = generateUnifiedMapData();
        const dbNodes = await db.mapNodes.toArray();
        
        if (dbNodes.length === 0) {
          const initialNodes = mapData.nodes.map(node => ({
            id: node.id,
            regionId: node.regionId,
            type: node.type,
            storyId: node.storyId,
            position: node.position,
            prerequisites: node.prerequisites,
            rewards: node.rewards,
            unlocked: node.unlocked,
            completed: node.completed,
            title: node.title,
            titleCn: node.titleCn,
            emoji: node.emoji,
          }));
          await db.mapNodes.bulkPut(initialNodes);
        }
        
        const mergedNodes = dbNodes.length > 0
          ? mergeNodeStates(mapData.nodes, dbNodes)
          : mapData.nodes;
        
        setNodes(mergedNodes);
        setSections(mapData.sections);
        
        // 找到当前活跃节点并定位到对应区域
        const activeNode = findActiveNode(mergedNodes);
        if (activeNode) {
          setActiveNodeId(activeNode.id);
          setCurrentRegionIndex(activeNode.level - 1);
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMapData();
  }, []);

  // 滚动到指定区域
  const scrollToRegion = useCallback((index: number) => {
    if (!scrollRef.current) return;
    
    const regionWidth = scrollRef.current.offsetWidth;
    const targetX = -index * regionWidth;
    
    animate(scrollX, targetX, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
    
    setCurrentRegionIndex(index);
  }, [scrollX]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentRegionIndex > 0) {
        scrollToRegion(currentRegionIndex - 1);
      } else if (e.key === 'ArrowRight' && currentRegionIndex < sections.length - 1) {
        scrollToRegion(currentRegionIndex + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRegionIndex, sections.length, scrollToRegion]);

  // 处理拖拽结束
  const handleDragEnd = useCallback((
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    setIsDragging(false);
    
    if (!scrollRef.current) return;
    
    const regionWidth = scrollRef.current.offsetWidth;
    const currentX = scrollX.get();
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // 根据速度和偏移决定滚动方向
    let targetIndex = currentRegionIndex;
    
    if (Math.abs(velocity) > 500) {
      // 高速滑动
      targetIndex = velocity > 0 
        ? Math.max(0, currentRegionIndex - 1)
        : Math.min(sections.length - 1, currentRegionIndex + 1);
    } else if (Math.abs(offset) > regionWidth * 0.2) {
      // 中等距离滑动
      targetIndex = offset > 0
        ? Math.max(0, currentRegionIndex - 1)
        : Math.min(sections.length - 1, currentRegionIndex + 1);
    }
    
    scrollToRegion(targetIndex);
  }, [currentRegionIndex, sections.length, scrollToRegion, scrollX]);

  // 计算拖拽约束
  const dragConstraints = useMemo(() => {
    if (!scrollRef.current) return { left: 0, right: 0 };
    const regionWidth = scrollRef.current.offsetWidth;
    return {
      left: -(sections.length - 1) * regionWidth,
      right: 0,
    };
  }, [sections.length]);

  // 区域数据
  const regionData = useMemo(() => {
    return sections.map((section, index) => {
      const regionNodes = getNodesByLevel(nodes, section.level);
      const progress = getLevelProgress(nodes, section.level);
      const isUnlocked = regionNodes.some(n => n.unlocked);
      const isCurrent = index === currentRegionIndex;
      
      return {
        section,
        nodes: regionNodes,
        progress,
        isUnlocked,
        isCurrent,
        themeColors: levelThemeColors[section.level],
      };
    });
  }, [sections, nodes, currentRegionIndex]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <span className={styles.loadingText}>正在加载魔法地图...</span>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {/* 横向滚动区域 */}
      <div className={styles.scrollWrapper} ref={scrollRef}>
        <motion.div
          className={styles.scrollContent}
          style={{ x: scrollX }}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => {
            setIsDragging(true);
            hideHint(); // 用户开始滑动时隐藏提示
          }}
          onDragEnd={handleDragEnd}
        >
          {regionData.map((region, index) => (
            <RegionScene
              key={region.section.level}
              section={region.section}
              nodes={region.nodes}
              progress={region.progress}
              isUnlocked={region.isUnlocked}
              isCurrent={region.isCurrent}
              isActive={index === currentRegionIndex}
              activeNodeId={activeNodeId}
              onNodeClick={onNodeClick}
              index={index}
              totalRegions={sections.length}
            />
          ))}
        </motion.div>
      </div>

      {/* 区域指示器 */}
      <RegionIndicator
        sections={sections}
        currentIndex={currentRegionIndex}
        nodes={nodes}
        onRegionClick={scrollToRegion}
      />

      {/* 左右导航箭头 (PC端显示) */}
      <div className={styles.navArrows}>
        {currentRegionIndex > 0 && (
          <motion.button
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={() => scrollToRegion(currentRegionIndex - 1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ‹
          </motion.button>
        )}
        {currentRegionIndex < sections.length - 1 && (
          <motion.button
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={() => scrollToRegion(currentRegionIndex + 1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ›
          </motion.button>
        )}
      </div>

      {/* 滑动提示 (限制显示次数) */}
      <AnimatePresence>
        {showHint && !isDragging && currentRegionIndex === 0 && (
          <motion.div
            className={styles.swipeHint}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.swipeIcon}>👆</span>
            <span>左右滑动探索更多区域</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HorizontalMap;


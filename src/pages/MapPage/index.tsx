/**
 * MapPage 地图页面
 * 魔法地图探索，迷雾解锁，节点预览
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { db, type MapNode } from '@/db';
import { MapCanvas, NodePreview } from '@/components/map';
import { generateL1MapNodes, l1RegionConfig } from '@/data/maps/l1-forest';
import styles from './MapPage.module.css';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  // 地图数据
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 预览状态
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // 当前激活节点
  const [activeNodeId, setActiveNodeId] = useState<string>('');

  // 统计数据
  const [stats, setStats] = useState({
    completedNodes: 0,
    totalNodes: 0,
    magicPower: 0,
  });

  // 加载地图数据
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        // 先检查数据库中是否有地图节点
        let nodes = await db.mapNodes.where('regionId').equals('region_l1').toArray();
        
        // 如果没有数据，生成并保存
        if (nodes.length === 0) {
          const generatedNodes = generateL1MapNodes();
          await db.mapNodes.bulkPut(generatedNodes);
          nodes = generatedNodes;
        }
        
        setMapNodes(nodes);
        
        // 计算统计
        const completed = nodes.filter(n => n.completed).length;
        const total = nodes.length;
        const power = nodes
          .filter(n => n.completed)
          .reduce((sum, n) => sum + (n.rewards?.magicPower || 0), 0);
        
        setStats({
          completedNodes: completed,
          totalNodes: total,
          magicPower: power,
        });
        
        // 设置当前激活节点（第一个未完成的解锁节点）
        const currentNode = nodes.find(n => n.unlocked && !n.completed);
        if (currentNode) {
          setActiveNodeId(currentNode.id);
        } else {
          // 如果全部完成，激活最后一个
          const lastNode = nodes[nodes.length - 1];
          if (lastNode) setActiveNodeId(lastNode.id);
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // 节点点击
  const handleNodeClick = useCallback((node: MapNode) => {
    setSelectedNode(node);
    setIsPreviewOpen(true);
  }, []);

  // 关闭预览
  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setTimeout(() => setSelectedNode(null), 300);
  }, []);

  // 开始节点
  const handleStartNode = useCallback((node: MapNode) => {
    handleClosePreview();
    
    // 根据节点类型导航
    if (node.type === 'story' || node.type === 'boss') {
      navigate(`/reader/${node.storyId}`);
    } else if (node.type === 'challenge' || node.type === 'bonus') {
      navigate(`/quiz/${node.storyId}`);
    }
  }, [navigate, handleClosePreview]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>正在绘制魔法地图...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 头部状态栏 */}
      <header className={styles.header}>
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {currentUser?.buddyName?.charAt(0) || '🐣'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.greeting}>{currentUser?.name || '小魔法师'}</span>
            <span className={styles.regionName}>{l1RegionConfig.nameCn}</span>
          </div>
        </div>
        <div className={styles.statsSection}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⭐</span>
            <span className={styles.statValue}>{stats.completedNodes}/{stats.totalNodes}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✨</span>
            <span className={styles.statValue}>{stats.magicPower}</span>
          </div>
        </div>
      </header>

      {/* 地图画布 */}
      <main className={styles.mapArea}>
        <MapCanvas
          nodes={mapNodes}
          activeNodeId={activeNodeId}
          width={400}
          height={1500}
          onNodeClick={handleNodeClick}
          showFog={true}
        />
      </main>

      {/* 节点预览 */}
      <NodePreview
        node={selectedNode}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onStart={handleStartNode}
      />

      {/* 底部导航 */}
      <nav className={styles.bottomNav}>
        <button className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>🗺️</span>
          <span className={styles.navLabel}>地图</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('/scroll')}>
          <span className={styles.navIcon}>📜</span>
          <span className={styles.navLabel}>卷轴</span>
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>📚</span>
          <span className={styles.navLabel}>魔典</span>
        </button>
        <button className={styles.navItem}>
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>设置</span>
        </button>
      </nav>
    </div>
  );
};

export default MapPage;

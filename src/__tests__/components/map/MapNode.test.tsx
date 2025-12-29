/**
 * MapNode 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import { MapNodeComponent } from '@/components/map/MapNode';
import type { MapNode } from '@/db';

describe('MapNode 组件', () => {
  const mockNode: MapNode = {
    id: 'test-node-001',
    regionId: 'region_forest',
    type: 'story',
    storyId: 'l1_001',
    title: 'Test Story',
    titleCn: '测试故事',
    emoji: '📖',
    position: { x: 100, y: 200 },
    prerequisites: [],
    unlocked: true,
    completed: false,
  };

  const defaultProps = {
    node: mockNode,
    isActive: false,
    onClick: vi.fn(),
  };

  describe('渲染', () => {
    it('应该在指定位置渲染', () => {
      const { container } = render(<MapNodeComponent {...defaultProps} />);
      const node = container.firstChild as HTMLElement;

      expect(node.style.left).toBe('100px');
      expect(node.style.top).toBe('200px');
    });

    it('应该显示节点 emoji', () => {
      render(<MapNodeComponent {...defaultProps} />);
      expect(screen.getByText('📖')).toBeInTheDocument();
    });
  });

  describe('解锁状态', () => {
    it('已解锁节点应该显示标题', () => {
      render(<MapNodeComponent {...defaultProps} node={{ ...mockNode, unlocked: true }} />);
      expect(screen.getByText('测试故事')).toBeInTheDocument();
    });

    it('未解锁节点应该显示锁图标', () => {
      render(<MapNodeComponent {...defaultProps} node={{ ...mockNode, unlocked: false }} />);
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    it('未解锁节点应该显示 ???', () => {
      render(<MapNodeComponent {...defaultProps} node={{ ...mockNode, unlocked: false }} />);
      expect(screen.getByText('???')).toBeInTheDocument();
    });
  });

  describe('完成状态', () => {
    it('已完成节点应该显示完成标记', () => {
      render(<MapNodeComponent {...defaultProps} node={{ ...mockNode, completed: true }} />);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('未完成节点不应该显示完成标记', () => {
      render(<MapNodeComponent {...defaultProps} node={{ ...mockNode, completed: false }} />);
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });
  });

  describe('节点类型', () => {
    it('Boss 节点应该显示皇冠', () => {
      render(
        <MapNodeComponent
          {...defaultProps}
          node={{ ...mockNode, type: 'boss', unlocked: true }}
        />
      );
      expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('故事节点不应该显示皇冠', () => {
      render(
        <MapNodeComponent {...defaultProps} node={{ ...mockNode, type: 'story' }} />
      );
      expect(screen.queryByText('👑')).not.toBeInTheDocument();
    });

    it('挑战节点应该显示挑战标签', () => {
      render(
        <MapNodeComponent
          {...defaultProps}
          node={{ ...mockNode, type: 'challenge', unlocked: true }}
        />
      );
      expect(screen.getByText('挑战')).toBeInTheDocument();
    });

    it('奖励节点应该显示奖励标签', () => {
      render(
        <MapNodeComponent
          {...defaultProps}
          node={{ ...mockNode, type: 'bonus', unlocked: true }}
        />
      );
      expect(screen.getByText('奖励')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击已解锁节点应该触发 onClick', () => {
      const onClick = vi.fn();
      const { container } = render(
        <MapNodeComponent
          {...defaultProps}
          node={{ ...mockNode, unlocked: true }}
          onClick={onClick}
        />
      );

      fireEvent.click(container.firstChild as Element);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('点击未解锁节点不应该触发 onClick', () => {
      const onClick = vi.fn();
      const { container } = render(
        <MapNodeComponent
          {...defaultProps}
          node={{ ...mockNode, unlocked: false }}
          onClick={onClick}
        />
      );

      fireEvent.click(container.firstChild as Element);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('激活状态', () => {
    it('应该接受 isActive prop', () => {
      const { container, rerender } = render(
        <MapNodeComponent {...defaultProps} isActive={false} />
      );
      expect(container.firstChild).not.toBeNull();

      rerender(<MapNodeComponent {...defaultProps} isActive={true} />);
      expect(container.firstChild).not.toBeNull();
    });
  });
});

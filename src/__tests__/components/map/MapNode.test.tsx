/**
 * MapNode 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import { MapNode } from '@/components/map/MapNode';
import { mockMapNode } from '../../mocks';

describe('MapNode 组件', () => {
  const defaultProps = {
    node: mockMapNode,
    isUnlocked: true,
    isCompleted: false,
    isCurrent: false,
    onClick: vi.fn()
  };

  describe('渲染', () => {
    it('应该渲染节点', () => {
      render(<MapNode {...defaultProps} />);
      
      expect(screen.getByTestId('map-node')).toBeInTheDocument();
    });

    it('应该在正确位置渲染', () => {
      render(<MapNode {...defaultProps} />);
      
      const node = screen.getByTestId('map-node');
      expect(node).toHaveStyle({
        left: `${mockMapNode.position.x}px`,
        top: `${mockMapNode.position.y}px`
      });
    });
  });

  describe('状态样式', () => {
    it('已解锁应该有 unlocked 样式', () => {
      render(<MapNode {...defaultProps} isUnlocked={true} />);
      
      expect(screen.getByTestId('map-node')).toHaveClass('unlocked');
    });

    it('未解锁应该有 locked 样式', () => {
      render(<MapNode {...defaultProps} isUnlocked={false} />);
      
      expect(screen.getByTestId('map-node')).toHaveClass('locked');
    });

    it('已完成应该有 completed 样式', () => {
      render(<MapNode {...defaultProps} isCompleted={true} />);
      
      expect(screen.getByTestId('map-node')).toHaveClass('completed');
    });

    it('当前节点应该有 current 样式', () => {
      render(<MapNode {...defaultProps} isCurrent={true} />);
      
      expect(screen.getByTestId('map-node')).toHaveClass('current');
    });
  });

  describe('交互', () => {
    it('点击已解锁节点应该触发 onClick', () => {
      render(<MapNode {...defaultProps} isUnlocked={true} />);
      
      fireEvent.click(screen.getByTestId('map-node'));
      
      expect(defaultProps.onClick).toHaveBeenCalledWith(mockMapNode);
    });

    it('点击未解锁节点不应该触发 onClick', () => {
      const onClick = vi.fn();
      render(<MapNode {...defaultProps} isUnlocked={false} onClick={onClick} />);
      
      fireEvent.click(screen.getByTestId('map-node'));
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('未解锁节点应该不可点击', () => {
      render(<MapNode {...defaultProps} isUnlocked={false} />);
      
      const node = screen.getByTestId('map-node');
      expect(node).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('图标', () => {
    it('故事节点应该显示书本图标', () => {
      render(<MapNode {...defaultProps} node={{ ...mockMapNode, type: 'story' }} />);
      
      expect(screen.getByTestId('node-icon-story')).toBeInTheDocument();
    });

    it('Boss 节点应该显示特殊图标', () => {
      render(<MapNode {...defaultProps} node={{ ...mockMapNode, type: 'boss' }} />);
      
      expect(screen.getByTestId('node-icon-boss')).toBeInTheDocument();
    });

    it('宝藏节点应该显示宝箱图标', () => {
      render(<MapNode {...defaultProps} node={{ ...mockMapNode, type: 'treasure' }} />);
      
      expect(screen.getByTestId('node-icon-treasure')).toBeInTheDocument();
    });
  });

  describe('动画', () => {
    it('当前节点应该有脉冲动画', () => {
      render(<MapNode {...defaultProps} isCurrent={true} />);
      
      const node = screen.getByTestId('map-node');
      expect(node).toHaveClass('pulse');
    });

    it('已完成节点应该显示星星', () => {
      render(<MapNode {...defaultProps} isCompleted={true} />);
      
      expect(screen.getByTestId('completion-star')).toBeInTheDocument();
    });
  });

  describe('无障碍', () => {
    it('应该有适当的 ARIA 标签', () => {
      render(<MapNode {...defaultProps} />);
      
      const node = screen.getByTestId('map-node');
      expect(node).toHaveAttribute('aria-label');
    });

    it('未解锁时应该标记为禁用', () => {
      render(<MapNode {...defaultProps} isUnlocked={false} />);
      
      const node = screen.getByTestId('map-node');
      expect(node).toHaveAttribute('aria-disabled', 'true');
    });
  });
});


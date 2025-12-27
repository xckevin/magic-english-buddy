/**
 * BuddyAvatar 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/render';
import { BuddyAvatar } from '@/components/buddy/BuddyAvatar';

describe('BuddyAvatar 组件', () => {
  const defaultProps = {
    stage: 2 as const,
    mood: 'happy' as const,
    size: 'medium' as const
  };

  describe('渲染', () => {
    it('应该渲染 Buddy 头像容器', () => {
      render(<BuddyAvatar {...defaultProps} />);
      
      expect(screen.getByTestId('buddy-avatar')).toBeInTheDocument();
    });

    it('应该根据阶段显示不同形态', () => {
      const { rerender } = render(<BuddyAvatar {...defaultProps} stage={1} />);
      
      expect(screen.getByTestId('buddy-stage-1')).toBeInTheDocument();
      
      rerender(<BuddyAvatar {...defaultProps} stage={2} />);
      expect(screen.getByTestId('buddy-stage-2')).toBeInTheDocument();
      
      rerender(<BuddyAvatar {...defaultProps} stage={3} />);
      expect(screen.getByTestId('buddy-stage-3')).toBeInTheDocument();
      
      rerender(<BuddyAvatar {...defaultProps} stage={4} />);
      expect(screen.getByTestId('buddy-stage-4')).toBeInTheDocument();
    });
  });

  describe('尺寸', () => {
    it('应该支持 small 尺寸', () => {
      render(<BuddyAvatar {...defaultProps} size="small" />);
      
      const avatar = screen.getByTestId('buddy-avatar');
      expect(avatar).toHaveClass('small');
    });

    it('应该支持 medium 尺寸', () => {
      render(<BuddyAvatar {...defaultProps} size="medium" />);
      
      const avatar = screen.getByTestId('buddy-avatar');
      expect(avatar).toHaveClass('medium');
    });

    it('应该支持 large 尺寸', () => {
      render(<BuddyAvatar {...defaultProps} size="large" />);
      
      const avatar = screen.getByTestId('buddy-avatar');
      expect(avatar).toHaveClass('large');
    });
  });

  describe('心情', () => {
    it('应该根据心情显示不同动画', () => {
      const { rerender } = render(<BuddyAvatar {...defaultProps} mood="happy" />);
      
      expect(screen.getByTestId('buddy-avatar')).toHaveAttribute('data-mood', 'happy');
      
      rerender(<BuddyAvatar {...defaultProps} mood="sad" />);
      expect(screen.getByTestId('buddy-avatar')).toHaveAttribute('data-mood', 'sad');
    });

    it('饥饿状态应该有特殊样式', () => {
      render(<BuddyAvatar {...defaultProps} mood="hungry" />);
      
      const avatar = screen.getByTestId('buddy-avatar');
      expect(avatar).toHaveClass('hungry');
    });
  });

  describe('交互', () => {
    it('点击应该触发 onClick', () => {
      const handleClick = vi.fn();
      render(<BuddyAvatar {...defaultProps} onClick={handleClick} />);
      
      fireEvent.click(screen.getByTestId('buddy-avatar'));
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('点击应该播放互动动画', async () => {
      render(<BuddyAvatar {...defaultProps} interactive />);
      
      fireEvent.click(screen.getByTestId('buddy-avatar'));
      
      await waitFor(() => {
        expect(screen.getByTestId('buddy-avatar')).toHaveClass('interacting');
      });
    });
  });

  describe('动画', () => {
    it('应该加载 Lottie 动画', () => {
      render(<BuddyAvatar {...defaultProps} />);
      
      // Lottie 组件应该被渲染
      expect(screen.getByTestId('buddy-animation')).toBeInTheDocument();
    });

    it('动画应该自动播放', () => {
      render(<BuddyAvatar {...defaultProps} />);
      
      const animation = screen.getByTestId('buddy-animation');
      expect(animation).toHaveAttribute('data-playing', 'true');
    });
  });

  describe('进化指示', () => {
    it('可进化时应该显示进化指示', () => {
      render(<BuddyAvatar {...defaultProps} canEvolve />);
      
      expect(screen.getByTestId('evolve-indicator')).toBeInTheDocument();
    });

    it('不可进化时不显示指示', () => {
      render(<BuddyAvatar {...defaultProps} canEvolve={false} />);
      
      expect(screen.queryByTestId('evolve-indicator')).not.toBeInTheDocument();
    });
  });

  describe('无障碍', () => {
    it('应该有适当的 ARIA 标签', () => {
      render(<BuddyAvatar {...defaultProps} />);
      
      const avatar = screen.getByTestId('buddy-avatar');
      expect(avatar).toHaveAttribute('aria-label');
    });

    it('可交互时应该有 button 角色', () => {
      render(<BuddyAvatar {...defaultProps} onClick={vi.fn()} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});


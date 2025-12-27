/**
 * Button 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import { Button } from '@/components/common/Button';

describe('Button 组件', () => {
  describe('渲染', () => {
    it('应该正确渲染按钮文本', () => {
      render(<Button>点击我</Button>);
      
      expect(screen.getByText('点击我')).toBeInTheDocument();
    });

    it('应该渲染为 button 元素', () => {
      render(<Button>按钮</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      render(<Button className="custom-class">按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('变体样式', () => {
    it('默认应该是 primary 变体', () => {
      render(<Button>主按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('primary');
    });

    it('应该支持 secondary 变体', () => {
      render(<Button variant="secondary">次按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('secondary');
    });

    it('应该支持 ghost 变体', () => {
      render(<Button variant="ghost">幽灵按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ghost');
    });
  });

  describe('尺寸', () => {
    it('默认应该是 medium 尺寸', () => {
      render(<Button>按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('medium');
    });

    it('应该支持 small 尺寸', () => {
      render(<Button size="small">小按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('small');
    });

    it('应该支持 large 尺寸', () => {
      render(<Button size="large">大按钮</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('large');
    });
  });

  describe('交互', () => {
    it('点击应该触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('禁用状态不应该触发 onClick', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>禁用</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('禁用状态应该有 disabled 属性', () => {
      render(<Button disabled>禁用</Button>);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('加载状态', () => {
    it('加载时应该显示加载指示器', () => {
      render(<Button loading>加载中</Button>);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('加载时应该禁用点击', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>加载中</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('图标', () => {
    it('应该支持左侧图标', () => {
      render(<Button icon="star">带图标</Button>);
      
      expect(screen.getByTestId('button-icon')).toBeInTheDocument();
    });
  });

  describe('无障碍', () => {
    it('应该支持 aria-label', () => {
      render(<Button aria-label="提交表单">提交</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '提交表单');
    });

    it('禁用时应该有 aria-disabled', () => {
      render(<Button disabled>禁用</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});


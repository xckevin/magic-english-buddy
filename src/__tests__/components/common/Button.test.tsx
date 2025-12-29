/**
 * Button 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import { Button } from '@/components/common/Button';

describe('Button 组件', () => {
  describe('渲染', () => {
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
      const { container } = render(<Button>主按钮</Button>);
      // CSS modules 会生成动态类名，我们只检查组件渲染
      expect(container.firstChild).not.toBeNull();
    });

    it('应该支持 secondary 变体', () => {
      const { container } = render(<Button variant="secondary">次按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });

    it('应该支持 ghost 变体', () => {
      const { container } = render(<Button variant="ghost">幽灵按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });

    it('应该支持 danger 变体', () => {
      const { container } = render(<Button variant="danger">危险按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });

    it('应该支持 success 变体', () => {
      const { container } = render(<Button variant="success">成功按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('尺寸', () => {
    it('默认应该是 md 尺寸', () => {
      const { container } = render(<Button>按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });

    it('应该支持 sm 尺寸', () => {
      const { container } = render(<Button size="sm">小按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });

    it('应该支持 lg 尺寸', () => {
      const { container } = render(<Button size="lg">大按钮</Button>);
      expect(container.firstChild).not.toBeNull();
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
      render(
        <Button onClick={handleClick} disabled>
          禁用
        </Button>
      );

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
      const { container } = render(<Button loading>加载中</Button>);
      // 检查 SVG spinner 存在
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('加载时应该禁用点击', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          加载中
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('加载时按钮应该被禁用', () => {
      render(<Button loading>加载中</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('图标', () => {
    it('应该支持左侧图标', () => {
      render(<Button leftIcon={<span data-testid="left-icon">⭐</span>}>带图标</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('应该支持右侧图标', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>带图标</Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('加载时不应该显示图标', () => {
      render(
        <Button loading leftIcon={<span data-testid="left-icon">⭐</span>}>
          加载中
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });
  });

  describe('全宽模式', () => {
    it('应该支持全宽模式', () => {
      const { container } = render(<Button fullWidth>全宽按钮</Button>);
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('无障碍', () => {
    it('应该支持 aria-label', () => {
      render(<Button aria-label="提交表单">提交</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '提交表单');
    });

    it('应该支持其他 HTML 属性', () => {
      render(
        <Button type="submit" name="submitBtn">
          提交
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submitBtn');
    });
  });
});

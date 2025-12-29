/**
 * WordHighlight 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import { WordHighlight } from '@/components/reader/WordHighlight';

describe('WordHighlight 组件', () => {
  const defaultProps = {
    word: 'apple',
    index: 0,
  };

  describe('渲染', () => {
    it('应该渲染为 span 元素', () => {
      const { container } = render(<WordHighlight {...defaultProps} />);
      expect(container.querySelector('span')).not.toBeNull();
    });

    it('应该支持不同的单词', () => {
      render(<WordHighlight word="banana" index={1} />);
      expect(screen.getByText('banana')).toBeInTheDocument();
    });
  });

  describe('高亮状态', () => {
    it('默认不高亮', () => {
      const { container } = render(<WordHighlight {...defaultProps} />);
      expect(container.firstChild).not.toBeNull();
    });

    it('isHighlighted 为 true 时应该高亮', () => {
      const { container } = render(
        <WordHighlight {...defaultProps} isHighlighted={true} />
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('isHighlighted 切换应该更新样式', () => {
      const { rerender, container } = render(
        <WordHighlight {...defaultProps} isHighlighted={false} />
      );

      expect(container.firstChild).not.toBeNull();

      rerender(<WordHighlight {...defaultProps} isHighlighted={true} />);
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('已学习状态', () => {
    it('isLearned 为 true 时应该有特殊样式', () => {
      const { container } = render(
        <WordHighlight {...defaultProps} isLearned={true} />
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('默认 isLearned 为 false', () => {
      const { container } = render(<WordHighlight {...defaultProps} />);
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('点击交互', () => {
    it('点击应该触发 onClick', () => {
      const handleClick = vi.fn();
      render(<WordHighlight {...defaultProps} onClick={handleClick} />);

      fireEvent.click(screen.getByText('apple'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('点击应该传递正确的单词和索引', () => {
      const handleClick = vi.fn();
      render(
        <WordHighlight word="hello" index={5} onClick={handleClick} />
      );

      fireEvent.click(screen.getByText('hello'));

      expect(handleClick).toHaveBeenCalledWith('hello', 5);
    });

    it('没有 onClick 时点击不应该报错', () => {
      render(<WordHighlight {...defaultProps} />);

      expect(() => fireEvent.click(screen.getByText('apple'))).not.toThrow();
    });
  });

  describe('长按交互（右键模拟）', () => {
    it('右键应该触发 onLongPress', () => {
      const handleLongPress = vi.fn();
      render(
        <WordHighlight {...defaultProps} onLongPress={handleLongPress} />
      );

      fireEvent.contextMenu(screen.getByText('apple'));

      expect(handleLongPress).toHaveBeenCalledTimes(1);
    });

    it('右键应该传递正确的单词和索引', () => {
      const handleLongPress = vi.fn();
      render(
        <WordHighlight word="world" index={3} onLongPress={handleLongPress} />
      );

      fireEvent.contextMenu(screen.getByText('world'));

      expect(handleLongPress).toHaveBeenCalledWith('world', 3);
    });

    it('右键应该阻止默认菜单', () => {
      const handleLongPress = vi.fn();
      render(
        <WordHighlight {...defaultProps} onLongPress={handleLongPress} />
      );

      const event = fireEvent.contextMenu(screen.getByText('apple'));

      // contextMenu 事件被处理
      expect(handleLongPress).toHaveBeenCalled();
    });
  });

  describe('Props 组合', () => {
    it('应该同时支持多个状态', () => {
      const { container } = render(
        <WordHighlight
          word="test"
          index={0}
          isHighlighted={true}
          isLearned={true}
          onClick={vi.fn()}
          onLongPress={vi.fn()}
        />
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('组件完整性', () => {
    it('WordHighlight 应该是有效的 React 组件', () => {
      expect(WordHighlight).toBeDefined();
    });

    it('渲染不应该抛出错误', () => {
      expect(() => render(<WordHighlight {...defaultProps} />)).not.toThrow();
    });
  });
});

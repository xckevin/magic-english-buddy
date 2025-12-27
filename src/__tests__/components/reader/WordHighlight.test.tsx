/**
 * WordHighlight 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/render';
import { WordHighlight } from '@/components/reader/WordHighlight';

const mockText = 'Once upon a time, there was a little rabbit.';

describe('WordHighlight 组件', () => {
  describe('渲染', () => {
    it('应该渲染所有单词', () => {
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={null}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      expect(screen.getByText('Once')).toBeInTheDocument();
      expect(screen.getByText('rabbit')).toBeInTheDocument();
    });

    it('每个单词应该是可点击的', () => {
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={null}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      const words = screen.getAllByRole('button');
      expect(words.length).toBeGreaterThan(0);
    });
  });

  describe('高亮', () => {
    it('应该高亮当前活动单词', () => {
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={0}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      const firstWord = screen.getByText('Once');
      expect(firstWord).toHaveClass('active');
    });

    it('非活动单词不应该高亮', () => {
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={0}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      const otherWord = screen.getByText('upon');
      expect(otherWord).not.toHaveClass('active');
    });

    it('切换高亮索引应该更新高亮', () => {
      const { rerender } = render(
        <WordHighlight
          text={mockText}
          activeWordIndex={0}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      expect(screen.getByText('Once')).toHaveClass('active');
      
      rerender(
        <WordHighlight
          text={mockText}
          activeWordIndex={1}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      expect(screen.getByText('Once')).not.toHaveClass('active');
      expect(screen.getByText('upon')).toHaveClass('active');
    });
  });

  describe('交互', () => {
    it('点击单词应该触发 onWordClick', () => {
      const handleClick = vi.fn();
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={null}
          onWordClick={handleClick}
          onWordLongPress={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByText('Once'));
      
      expect(handleClick).toHaveBeenCalledWith('Once', 0);
    });

    it('点击应该传递正确的单词和索引', () => {
      const handleClick = vi.fn();
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={null}
          onWordClick={handleClick}
          onWordLongPress={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByText('upon'));
      
      expect(handleClick).toHaveBeenCalledWith('upon', expect.any(Number));
    });
  });

  describe('标点符号处理', () => {
    it('应该保留标点符号', () => {
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={null}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      // 标点符号应该存在于文本中
      expect(screen.getByText(/time/)).toBeInTheDocument();
    });

    it('点击时应该去除标点符号', () => {
      const handleClick = vi.fn();
      render(
        <WordHighlight
          text="Hello, world!"
          activeWordIndex={null}
          onWordClick={handleClick}
          onWordLongPress={vi.fn()}
        />
      );
      
      // 假设显示的是 "Hello" 而不是 "Hello,"
      const wordElement = screen.getByText('Hello');
      fireEvent.click(wordElement);
      
      // 回调应该接收清理后的单词
      expect(handleClick).toHaveBeenCalledWith('Hello', 0);
    });
  });

  describe('空白处理', () => {
    it('应该保留单词间的空格', () => {
      const { container } = render(
        <WordHighlight
          text={mockText}
          activeWordIndex={null}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      // 检查文本内容包含空格
      expect(container.textContent).toContain(' ');
    });
  });

  describe('动画', () => {
    it('活动单词应该有缩放效果', () => {
      render(
        <WordHighlight
          text={mockText}
          activeWordIndex={0}
          onWordClick={vi.fn()}
          onWordLongPress={vi.fn()}
        />
      );
      
      const activeWord = screen.getByText('Once');
      // Framer Motion 会添加 transform 样式
      expect(activeWord).toHaveStyle({ transform: expect.any(String) });
    });
  });
});


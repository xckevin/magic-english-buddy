/**
 * QuizContainer 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../utils/render';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import type { QuizItem } from '@/db';

const mockQuizItems: QuizItem[] = [
  {
    id: 'q1',
    type: 'image_choice',
    question: 'What color is the apple?',
    options: [
      { value: 'red', label: 'Red', image: '/images/red.webp' },
      { value: 'blue', label: 'Blue', image: '/images/blue.webp' },
      { value: 'green', label: 'Green', image: '/images/green.webp' },
    ],
    correctAnswer: 'red',
  },
  {
    id: 'q2',
    type: 'word_builder',
    question: 'Spell the word',
    targetWord: 'apple',
    hint: '🍎',
    correctAnswer: 'apple',
  },
];

describe('QuizContainer 组件', () => {
  const defaultProps = {
    questions: mockQuizItems,
    storyId: 'l1_001',
    onComplete: vi.fn(),
    onExit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('空题目列表时不应该崩溃', () => {
      const { container } = render(
        <QuizContainer {...defaultProps} questions={[]} />
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('Props', () => {
    it('应该接受 storyId', () => {
      const { container } = render(
        <QuizContainer {...defaultProps} storyId="test-story" />
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('应该接受 onExit 回调', () => {
      const onExit = vi.fn();
      const { container } = render(
        <QuizContainer {...defaultProps} onExit={onExit} />
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('应该接受 onComplete 回调', () => {
      const onComplete = vi.fn();
      const { container } = render(
        <QuizContainer {...defaultProps} onComplete={onComplete} />
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('组件完整性', () => {
    it('QuizContainer 应该是有效的 React 组件', () => {
      expect(QuizContainer).toBeDefined();
      expect(typeof QuizContainer).toBe('function');
    });

    it('渲染不应该抛出错误', () => {
      expect(() => render(<QuizContainer {...defaultProps} />)).not.toThrow();
    });
  });
});

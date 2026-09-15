import { fireEvent, render, screen } from '../../utils/render';
import { describe, expect, it, vi } from 'vitest';
import { WordBuilder } from '@/components/quiz/WordBuilder';
import { ImageChoice } from '@/components/quiz/ImageChoice';

describe('quiz content fallbacks', () => {
  it('renders legacy missing images as illustrations, preserving the answer text', () => {
    render(
      <ImageChoice
        question={{
          id: 'q',
          type: 'image_choice',
          question: 'Who helps?',
          options: [{ value: 'owl', image: '/assets/quiz/owl.webp' }],
          correctAnswer: 'owl',
        }}
        onAnswer={vi.fn()}
        onHint={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'owl', exact: true })).toHaveTextContent('🦉');
    expect(screen.queryByText('/assets/quiz/owl.webp')).not.toBeInTheDocument();
  });

  it('shuffles an answer-ordered letter bank and charges for a hint only once', () => {
    const onHint = vi.fn();
    const onAnswer = vi.fn();
    render(
      <WordBuilder
        question={{
          id: 'q',
          type: 'word_builder',
          question: 'Spell cat',
          shuffledWords: ['c', 'a', 't'],
          correctAnswer: 'cat',
        }}
        onAnswer={onAnswer}
        onHint={onHint}
      />
    );
    const letters = screen.getAllByRole('button').filter(b => /^[cat]$/.test(b.textContent ?? ''));
    expect(letters.map(b => b.textContent).join('')).not.toBe('cat');
    fireEvent.click(screen.getByRole('button', { name: /提示/ }));
    fireEvent.click(screen.getByRole('button', { name: /重置/ }));
    fireEvent.click(screen.getByRole('button', { name: /已使用提示/ }));
    expect(onHint).toHaveBeenCalledTimes(1);
    for (const letter of ['c', 'a', 't'])
      fireEvent.click(screen.getByRole('button', { name: letter, exact: true }));
    fireEvent.click(screen.getByRole('button', { name: /确认/ }));
    expect(onAnswer).toHaveBeenCalledWith('cat');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '../../utils/render';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { FillBlank } from '@/components/quiz/FillBlank';
import { ImageChoice } from '@/components/quiz/ImageChoice';
import type { QuizItem } from '@/db';

const imageQuestion: QuizItem = {
  id: 'one',
  type: 'image_choice',
  question: 'apple',
  audioQuestion: 'apple',
  options: [
    { value: 'apple', image: '🍎' },
    { value: 'banana', image: '🍌' },
  ],
  correctAnswer: 'apple',
};

describe('练习流程保护', () => {
  afterEach(() => vi.useRealTimers());

  it('一道题只能记录一次答案，反馈必须由用户继续', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn().mockResolvedValue(undefined);
    render(
      <QuizContainer
        questions={[imageQuestion]}
        storyId="story"
        onExit={vi.fn()}
        onComplete={onComplete}
      />
    );

    const options = screen
      .getAllByRole('button')
      .filter(button => button.textContent?.includes('🍎') || button.textContent?.includes('🍌'));
    fireEvent.click(options[0]);
    fireEvent.click(options[1]);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('button', { name: /继续/ })).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole('button', { name: /继续/ })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '练习进度' })).toHaveAttribute(
      'aria-valuenow',
      '1'
    );

    fireEvent.click(screen.getByRole('button', { name: /继续/ }));
    fireEvent.click(screen.getByRole('button', { name: /完成/ }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('填空选项在提交等待期间会立即锁定', async () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const question: QuizItem = {
      id: 'blank',
      type: 'fill_blank',
      question: 'I see _____.',
      correctAnswer: 'an apple',
      options: [
        { value: 'an apple', text: 'an apple' },
        { value: 'a dog', text: 'a dog' },
      ],
    };
    render(<FillBlank question={question} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: /an apple/ }));
    fireEvent.click(screen.getByRole('button', { name: /a dog/ }));
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith('an apple', true);
  });

  it('听音辨图展示单词，且提示与选择都只提交一次', async () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const onHint = vi.fn();
    render(<ImageChoice question={imageQuestion} onAnswer={onAnswer} onHint={onHint} />);

    expect(screen.getByText('apple', { selector: 'p[lang="en"]' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /提示/ }));
    fireEvent.click(screen.getByRole('button', { name: /已使用提示/ }));
    expect(onHint).toHaveBeenCalledTimes(1);

    const options = screen
      .getAllByRole('button')
      .filter(button => button.textContent?.includes('🍎') || button.textContent?.includes('🍌'));
    fireEvent.click(options[0]);
    fireEvent.click(options[1]);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith('apple');
  });

  it('restores a feedback-stage draft and persists the next-question state', () => {
    const onDraftChange = vi.fn().mockResolvedValue(undefined);
    render(
      <QuizContainer
        questions={[
          imageQuestion,
          { ...imageQuestion, id: 'two', question: 'banana', correctAnswer: 'banana' },
        ]}
        storyId="story"
        onExit={vi.fn()}
        onComplete={vi.fn()}
        initialDraft={{
          stage: 'feedback',
          currentQuestionIndex: 0,
          answers: [{ questionId: 'one', userAnswer: 'apple' }],
          hintsUsed: 1,
          hintedQuestionIds: ['one'],
          startedAt: 1_000,
        }}
        attemptStartedAt={1_000}
        onDraftChange={onDraftChange}
      />
    );

    expect(screen.getByText('太棒了！')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /继续/ }));
    expect(onDraftChange).toHaveBeenCalledWith({
      stage: 'playing',
      currentQuestionIndex: 1,
      answers: [{ questionId: 'one', userAnswer: 'apple' }],
      hintsUsed: 1,
      hintedQuestionIds: ['one'],
    });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../utils/render';
import html2canvas from 'html2canvas';
import { Certificate } from '@/components/incentive/Certificate';

vi.mock('html2canvas', () => ({ default: vi.fn() }));

const props = {
  studentName: '很长很长很长很长很长很长很长很长的学习者名字',
  buddyName: '星星', level: 3, storiesCompleted: 4, magicPower: 120, streakDays: 2, date: '2026/9/15',
};

describe('Certificate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.classList.remove('certificatePrintActive');
  });

  it('renders current-profile learning data and a long legacy name', () => {
    render(<Certificate {...props} />);
    expect(screen.getByText(props.studentName)).toBeInTheDocument();
    expect(screen.getByText('完成课程')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('disables repeated PNG exports and shows an iPhone-save preview', async () => {
    let finish: ((value: HTMLCanvasElement) => void) | undefined;
    vi.mocked(html2canvas).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,preview');
    const click = vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    render(<Certificate {...props} />);

    const save = screen.getByRole('button', { name: /保存 PNG/ });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(html2canvas).toHaveBeenCalledTimes(1);
    expect(save).toBeDisabled();
    finish?.(canvas);

    await waitFor(() => expect(screen.getByText('已生成图片')).toBeInTheDocument());
    expect(screen.getByAltText(/图片预览/)).toHaveAttribute('src', 'data:image/png;base64,preview');
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.instances[0]).toHaveProperty('download', 'magic-english-buddy-certificate-2026-9-15.png');
  });

  it('reports image errors and prints only in certificate print mode', async () => {
    vi.mocked(html2canvas).mockRejectedValueOnce(new Error('capture failed'));
    const onError = vi.fn();
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<Certificate {...props} onError={onError} />);
    fireEvent.click(screen.getByRole('button', { name: /保存 PNG/ }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith('图片没有生成成功，请稍后重试。'));
    fireEvent.click(screen.getByRole('button', { name: /打印证书/ }));
    expect(print).toHaveBeenCalledTimes(1);
    expect(document.body).toHaveClass('certificatePrintActive');
  });
});

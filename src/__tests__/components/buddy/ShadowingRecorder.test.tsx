import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ShadowingRecorder } from '@/components/buddy/ShadowingRecorder';
import { audioRecorderService } from '@/services/audioRecorderService';

describe('ShadowingRecorder', () => {
  beforeEach(() => {
    audioRecorderService.reset();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);
  });

  afterEach(() => {
    audioRecorderService.reset();
  });

  it('creates one replay audio element and calls onRecordComplete once per recording', async () => {
    const onRecordComplete = vi.fn();
    const { unmount } = render(
      <ShadowingRecorder originalText="A short sentence." onRecordComplete={onRecordComplete} />
    );

    await act(async () => {
      await expect(audioRecorderService.start()).resolves.toBe(true);
      audioRecorderService.stop();
    });

    await waitFor(() => expect(screen.getByText('录好了，可以回放')).toBeInTheDocument());
    expect(onRecordComplete).toHaveBeenCalledTimes(1);
    unmount();
  });
});

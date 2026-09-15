import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioRecorderService } from '@/services/audioRecorderService';

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void };

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
};

const makeStream = () => {
  const stop = vi.fn();
  return { stream: { getTracks: () => [{ stop }] } as unknown as MediaStream, stop };
};

describe('AudioRecorderService pending permission cleanup', () => {
  beforeEach(() => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockReset();
  });

  afterEach(() => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);
  });

  it('stops a stream that arrives after stop cancels a pending permission request', async () => {
    const request = deferred<MediaStream>();
    const getUserMedia = vi
      .mocked(navigator.mediaDevices.getUserMedia)
      .mockReturnValue(request.promise);
    const service = new AudioRecorderService();
    const result = service.start();
    service.stop();
    const { stream, stop } = makeStream();
    request.resolve(stream);

    await expect(result).resolves.toBe(false);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(service.getState().isRecording).toBe(false);
  });

  it.each(['reset', 'dispose'] as const)(
    '%s also invalidates a pending permission request',
    async method => {
      const request = deferred<MediaStream>();
      vi.mocked(navigator.mediaDevices.getUserMedia).mockReturnValue(request.promise);
      const service = new AudioRecorderService();
      const result = service.start();
      service[method]();
      const { stream, stop } = makeStream();
      request.resolve(stream);

      await expect(result).resolves.toBe(false);
      expect(stop).toHaveBeenCalledTimes(1);
    }
  );

  it('shares one outstanding permission request during rapid repeated starts', async () => {
    const request = deferred<MediaStream>();
    const getUserMedia = vi
      .mocked(navigator.mediaDevices.getUserMedia)
      .mockReturnValue(request.promise);
    const service = new AudioRecorderService();
    const first = service.start();
    const second = service.start();
    expect(second).toBe(first);
    service.stop();
    const { stream } = makeStream();
    request.resolve(stream);

    await expect(first).resolves.toBe(false);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('releases the previous recording URL when another recording starts', async () => {
    const { stream } = makeStream();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(stream);
    const service = new AudioRecorderService();
    await service.start();
    service.stop();
    const previousUrl = service.getState().audioUrl;
    expect(previousUrl).toBeTruthy();
    await service.start();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(previousUrl);
    service.dispose();
  });
});

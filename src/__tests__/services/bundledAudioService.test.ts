import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BundledSpeechPlayer, type AudioClip } from '@/services/bundledAudioService';

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void };

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
};

class FakeSource {
  buffer: AudioBuffer | null = null;
  onended: (() => void) | null = null;
  playbackRate = { setValueAtTime: vi.fn() } as unknown as AudioParam;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  currentTime = 0;
  state: AudioContextState = 'suspended';
  destination = {} as AudioDestinationNode;
  sources: FakeSource[] = [];
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  close = vi.fn(async () => {
    this.state = 'closed';
  });
  decodeAudioData = vi.fn(async () => ({ duration: 1 }) as AudioBuffer);
  createBufferSource = vi.fn(() => {
    const source = new FakeSource();
    this.sources.push(source);
    return source as unknown as AudioBufferSourceNode;
  });

  constructor() {
    FakeAudioContext.instances.push(this);
  }
}

const clip: AudioClip = {
  file: 'sample.mp3',
  duration: 1,
  words: [{ word: 'sample', index: 0, start: 0, end: 1 }],
};

describe('BundledSpeechPlayer Web Audio lifecycle', () => {
  const originalContext = window.AudioContext;
  const originalFetch = globalThis.fetch;
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancelRaf = globalThis.cancelAnimationFrame;
  let nextFrame: Parameters<typeof requestAnimationFrame>[0] | undefined;
  const frame = () => nextFrame?.(0);

  beforeEach(() => {
    FakeAudioContext.instances = [];
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
    nextFrame = undefined;
    globalThis.requestAnimationFrame = vi.fn(callback => {
      nextFrame = callback;
      return 1;
    });
    globalThis.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: originalContext });
    globalThis.fetch = originalFetch;
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancelRaf;
    vi.restoreAllMocks();
  });

  it('plays a downloaded clip without fetching it again', async () => {
    const match = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    });
    vi.stubGlobal('caches', { match });
    globalThis.fetch = vi.fn();
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, vi.fn());
    const context = FakeAudioContext.instances[0];
    await vi.waitFor(() => expect(context.createBufferSource).toHaveBeenCalledTimes(1));
    expect(match).toHaveBeenCalledWith(expect.stringContaining('/audio/sample.mp3'), {
      cacheName: 'magic-english-audio-v1',
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('streams uncached audio without saving it as an optional download', async () => {
    const put = vi.fn();
    vi.stubGlobal('caches', {
      match: vi.fn().mockResolvedValue(undefined),
      open: vi.fn().mockResolvedValue({ put }),
    });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    });
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, vi.fn());
    const context = FakeAudioContext.instances[0];
    await vi.waitFor(() => expect(context.createBufferSource).toHaveBeenCalledTimes(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/audio/sample.mp3'), {
      signal: expect.any(AbortSignal),
      cache: 'no-store',
    });
    expect(put).not.toHaveBeenCalled();
    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('stops an unresolved fetch and ignores its late response', async () => {
    const response = deferred<Response>();
    globalThis.fetch = vi.fn(() => response.promise) as typeof fetch;
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, vi.fn());
    const context = FakeAudioContext.instances[0];

    player.stop();
    response.resolve({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);

    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
    await Promise.resolve();
    expect(context.decodeAudioData).not.toHaveBeenCalled();
    expect(context.createBufferSource).not.toHaveBeenCalled();
    expect(context.close).toHaveBeenCalledTimes(1);
  });

  it('releases the source, aborts animation, and closes its fresh context on stop', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    }) as typeof fetch;
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, vi.fn());
    const context = FakeAudioContext.instances[0];

    await vi.waitFor(() => expect(context.createBufferSource).toHaveBeenCalledTimes(1));
    const source = context.sources[0];
    player.stop();

    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
    expect(source.stop).toHaveBeenCalledTimes(1);
    expect(source.disconnect).toHaveBeenCalledTimes(1);
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('does not start a decoded clip until a fetch-stage pause is resumed', async () => {
    const response = deferred<Response>();
    globalThis.fetch = vi.fn(() => response.promise) as typeof fetch;
    const events = vi.fn();
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, events);
    const context = FakeAudioContext.instances[0];

    player.pause();
    response.resolve({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);
    await vi.waitFor(() => expect(context.decodeAudioData).toHaveBeenCalledTimes(1));
    expect(context.createBufferSource).not.toHaveBeenCalled();

    player.resume();
    await vi.waitFor(() => expect(context.createBufferSource).toHaveBeenCalledTimes(1));
    expect(context.sources[0].start).toHaveBeenCalledWith(0, 0);
    expect(events).toHaveBeenCalledWith({ type: 'pause' });
    expect(events).toHaveBeenCalledWith({ type: 'resume' });
    expect(events).toHaveBeenCalledWith({ type: 'start' });

    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('applies a speed change while paused to the resumed audio source', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    }) as typeof fetch;
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, vi.fn());
    const context = FakeAudioContext.instances[0];
    await vi.waitFor(() => expect(context.sources).toHaveLength(1));

    player.pause();
    player.setRate(0.75);
    player.resume();
    await vi.waitFor(() => expect(context.state).toBe('running'));
    expect(context.sources).toHaveLength(1);
    expect(context.sources[0].playbackRate.setValueAtTime).toHaveBeenLastCalledWith(0.75, 0);

    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('pauses when the page is hidden and leaves resuming to the user', async () => {
    globalThis.fetch = vi.fn(() => new Promise<Response>(() => undefined)) as typeof fetch;
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, vi.fn());
    const context = FakeAudioContext.instances[0];
    const hidden = Object.getOwnPropertyDescriptor(document, 'hidden');

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(context.suspend).toHaveBeenCalledTimes(1);

    if (hidden) Object.defineProperty(document, 'hidden', hidden);
    else Reflect.deleteProperty(document, 'hidden');
    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('does not highlight a zero-start word before its audio is ready', async () => {
    const response = deferred<Response>();
    globalThis.fetch = vi.fn(() => response.promise);
    const events = vi.fn();
    const player = new BundledSpeechPlayer();
    const playback = player.play([clip], 1, events);
    frame();
    expect(events).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'word' }));

    response.resolve({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(4),
    } as Response);
    await vi.waitFor(() => expect(FakeAudioContext.instances[0].sources).toHaveLength(1));
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'word', wordIndex: 0, word: 'sample' });
    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('keeps word timing on the audio clock through asynchronous pause, resume and rate changes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(4),
    });
    const sentence: AudioClip = {
      ...clip,
      duration: 2,
      words: ['One', 'two,', 'three', 'four.'].map((word, index) => ({
        word, index, start: index / 2, end: (index + 1) / 2,
      })),
    };
    const events = vi.fn();
    const player = new BundledSpeechPlayer();
    const playback = player.play([sentence], 1, events);
    const context = FakeAudioContext.instances[0];
    context.decodeAudioData.mockResolvedValue({ duration: 2 } as AudioBuffer);
    await vi.waitFor(() => expect(context.sources).toHaveLength(1));
    context.currentTime = 0.4;
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'word', wordIndex: 0, word: 'One' });

    const suspended = deferred<void>();
    context.suspend.mockImplementationOnce(() => suspended.promise);
    player.pause();
    // The render thread advances before the suspend request takes effect.
    context.currentTime = 0.7;
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'pause' });
    context.state = 'suspended';
    suspended.resolve();
    await suspended.promise;

    const resumed = deferred<void>();
    context.resume.mockImplementationOnce(() => resumed.promise);
    player.resume();
    // Rendering resumes before the control-thread promise callback runs.
    context.state = 'running';
    context.currentTime = 0.8;
    resumed.resolve();
    await resumed.promise;
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'word', wordIndex: 1, word: 'two,' });

    player.setRate(1.2);
    context.currentTime = 1;
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'word', wordIndex: 2, word: 'three' });

    player.pause();
    player.setRate(0.8);
    player.resume();
    await Promise.resolve();
    context.currentTime = 1.6;
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'word', wordIndex: 3, word: 'four.' });
    expect(context.sources).toHaveLength(1);
    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('keeps repeated words and punctuation in order across paragraph buffers', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(4),
    });
    const first: AudioClip = {
      ...clip,
      words: [
        { word: 'Go,', index: 0, start: 0.1, end: 0.4 },
        { word: 'go!', index: 1, start: 0.5, end: 0.9 },
      ],
    };
    const second: AudioClip = {
      ...clip,
      words: [{ word: '"Hello!"', index: 0, start: 0.1, end: 0.7 }],
    };
    const events = vi.fn();
    const player = new BundledSpeechPlayer();
    const playback = player.play([first, second], 1.2, events);
    const context = FakeAudioContext.instances[0];
    await vi.waitFor(() => expect(context.sources).toHaveLength(1));
    context.currentTime = 0.1;
    frame();
    context.currentTime = 0.45;
    frame();
    context.currentTime = 1;
    context.sources[0].onended?.();
    await vi.waitFor(() => expect(context.sources).toHaveLength(2));
    context.currentTime = 1.1;
    frame();
    expect(events.mock.calls.filter(([event]) => event.type === 'word').map(([event]) => event))
      .toEqual([
        { type: 'word', wordIndex: 0, word: 'Go,' },
        { type: 'word', wordIndex: 1, word: 'go!' },
        { type: 'word', wordIndex: 2, word: '"Hello!"' },
      ]);
    player.stop();
    await expect(playback).rejects.toMatchObject({ name: 'AbortError' });
    frame();
    expect(events).toHaveBeenLastCalledWith({ type: 'word', wordIndex: 2, word: '"Hello!"' });
  });
});

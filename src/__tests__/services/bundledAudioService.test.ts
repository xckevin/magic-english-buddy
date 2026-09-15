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

  beforeEach(() => {
    FakeAudioContext.instances = [];
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
    globalThis.requestAnimationFrame = vi.fn(() => 1);
    globalThis.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: originalContext });
    globalThis.fetch = originalFetch;
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancelRaf;
    vi.restoreAllMocks();
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
});

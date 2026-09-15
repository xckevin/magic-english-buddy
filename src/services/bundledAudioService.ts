import manifestData from '@/data/audio/manifest.json';
import { AUDIO_CACHE_NAME, audioFileUrl } from './audioDownloadService';

export interface AudioWord {
  word: string;
  index: number;
  start: number;
  end: number;
}
export interface AudioClip {
  file: string;
  duration: number;
  words: AudioWord[];
}
interface AudioManifest {
  clips: Record<string, AudioClip>;
  stories: Record<string, string[]>;
}
const manifest: AudioManifest = manifestData;

/** Only exact text matches may use a recording; edited lessons fall back to TTS. */
export function getBundledSpeech(text: string): AudioClip[] | null {
  const word = /^\S+$/.test(text)
    ? text.normalize('NFKC').replace(/^[^\p{L}\p{N}'’-]+|[^\p{L}\p{N}'’-]+$/gu, '').toLowerCase()
    : '';
  const clip =
    manifest.clips[text] ?? (word ? manifest.clips[word === 'i' ? 'I' : word] : undefined);
  if (clip) return [clip];
  const paragraphs = manifest.stories[text];
  if (!paragraphs?.length || paragraphs.some(paragraph => !manifest.clips[paragraph])) return null;
  return paragraphs.map(paragraph => manifest.clips[paragraph]);
}

type PlaybackEvent = {
  type: 'start' | 'end' | 'pause' | 'resume' | 'word';
  wordIndex?: number;
  word?: string;
};
type PlaybackNotify = (event: PlaybackEvent) => void;

interface Playback {
  context: AudioContext;
  controller: AbortController;
  reject: (error: Error) => void;
  notify: PlaybackNotify;
  frame: number | null;
  source: AudioBufferSourceNode | null;
  buffer: AudioBuffer | null;
  paused: boolean;
  rate: number;
  clipPosition: number;
  positionAnchor: number;
  visibilityListener: () => void;
  start: () => void;
  load: () => void;
  loading: boolean;
}

function abortError(): DOMException {
  return new DOMException('Audio playback was cancelled', 'AbortError');
}

function getAudioContext(): AudioContext {
  const browserWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  const Constructor = window.AudioContext ?? browserWindow.webkitAudioContext;
  if (!Constructor) throw new Error('Web Audio is not supported in this browser');
  return new Constructor();
}

/** Plays pre-generated clips through Web Audio, preserving the click activation for Safari. */
export class BundledSpeechPlayer {
  private active: Playback | null = null;

  play(clips: AudioClip[], rate: number, notify: PlaybackNotify): Promise<void> {
    this.stop();

    let context: AudioContext;
    try {
      // This must happen while the click handler is still on the stack. The fetch and
      // decode below may complete after Safari's transient user activation expires.
      context = getAudioContext();
    } catch (error) {
      return Promise.reject(error);
    }
    const activation = context.resume();
    // Attach a rejection handler immediately, before an awaited fetch can yield.
    void activation.catch(() => undefined);

    return new Promise((resolve, reject) => {
      const playback: Playback = {
        context,
        controller: new AbortController(),
        reject,
        notify,
        frame: null,
        source: null,
        buffer: null,
        paused: false,
        rate,
        clipPosition: 0,
        positionAnchor: context.currentTime,
        visibilityListener: () => this.pause(),
        start: () => undefined,
        load: () => undefined,
        loading: false,
      };
      this.active = playback;
      let index = 0;
      let wordOffset = 0;
      let lastWord = -1;
      let started = false;

      const isCurrent = () => this.active === playback;
      const updateWord = () => {
        if (!isCurrent() || !playback.source || playback.paused || context.state !== 'running') return;
        const position = currentPosition(playback);
        const word = clips[index]?.words.find(
          item => position >= item.start && position < item.end
        );
        if (word && lastWord !== wordOffset + word.index) {
          lastWord = wordOffset + word.index;
          notify({ type: 'word', wordIndex: lastWord, word: word.word });
        }
      };
      const tick = () => {
        updateWord();
        if (isCurrent()) playback.frame = requestAnimationFrame(tick);
      };
      const fail = (error: unknown) => {
        if (!isCurrent()) return;
        this.release(playback);
        reject(error instanceof Error ? error : new Error('Audio playback failed'));
      };
      const finish = () => {
        if (!isCurrent()) return;
        this.release(playback);
        notify({ type: 'end' });
        resolve();
      };
      const detachSource = () => {
        const source = playback.source;
        playback.source = null;
        if (!source) return;
        source.onended = null;
        try {
          source.stop();
        } catch {
          /* A completed source cannot be stopped again. */
        }
        source.disconnect();
      };
      const startCurrent = () => {
        if (!isCurrent() || playback.paused || playback.source) return;
        if (!playback.buffer) {
          playback.load();
          return;
        }
        const duration = playback.buffer.duration;
        if (playback.clipPosition >= duration) {
          wordOffset += clips[index]?.words.length ?? 0;
          index += 1;
          playback.buffer = null;
          playback.clipPosition = 0;
          playback.load();
          return;
        }
        const source = playback.context.createBufferSource();
        source.buffer = playback.buffer;
        source.playbackRate.setValueAtTime(playback.rate, playback.context.currentTime);
        source.connect(playback.context.destination);
        playback.positionAnchor = playback.context.currentTime;
        playback.source = source;
        source.onended = () => {
          if (!isCurrent() || playback.source !== source) return;
          detachSource();
          wordOffset += clips[index]?.words.length ?? 0;
          index += 1;
          playback.buffer = null;
          playback.clipPosition = 0;
          if (!playback.paused) playback.load();
        };
        source.start(0, playback.clipPosition);
        if (!started) {
          started = true;
          notify({ type: 'start' });
        }
      };
      playback.start = startCurrent;
      const loadClip = async () => {
        if (playback.loading || !isCurrent()) return;
        playback.loading = true;
        try {
          const clip = clips[index];
          if (!clip) {
            finish();
            return;
          }
          const url = audioFileUrl(clip.file);
          let response: Response | undefined;
          // Downloaded audio is read directly, even before the service worker takes
          // control. Streaming a clip never opts the user into an offline download.
          if (typeof caches !== 'undefined') {
            try {
              response = await caches.match(url, { cacheName: AUDIO_CACHE_NAME });
            } catch {
              /* Storage may be disabled; online playback can still work. */
            }
          }
          if (!isCurrent()) return;
          response ??= await fetch(url, {
            signal: playback.controller.signal,
            cache: 'no-store',
          });
          if (!isCurrent()) return;
          if (!response.ok) throw new Error(`Audio unavailable (${response.status})`);
          const data = await response.arrayBuffer();
          if (!isCurrent()) return;
          const buffer = await playback.context.decodeAudioData(data);
          if (!isCurrent()) return;
          playback.buffer = buffer;
          await activation;
          if (!isCurrent()) return;
          startCurrent();
        } finally {
          playback.loading = false;
        }
      };
      playback.load = () => {
        void loadClip().catch(fail);
      };

      playback.visibilityListener = () => {
        if (document.hidden) this.pause();
      };
      document.addEventListener('visibilitychange', playback.visibilityListener);
      playback.frame = requestAnimationFrame(tick);
      playback.load();
    });
  }

  private release(playback: Playback): void {
    if (this.active === playback) this.active = null;
    playback.controller.abort();
    document.removeEventListener('visibilitychange', playback.visibilityListener);
    if (playback.frame !== null) cancelAnimationFrame(playback.frame);
    const source = playback.source;
    playback.source = null;
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* The source may already have ended. */
      }
      source.disconnect();
    }
    void playback.context.close().catch(() => undefined);
  }

  stop(): void {
    const playback = this.active;
    if (!playback) return;
    this.release(playback);
    playback.reject(abortError());
  }

  pause(): void {
    const playback = this.active;
    if (!playback || playback.paused) return;
    // The context clock freezes with its audio sources. Keep the same anchor:
    // suspend/resume promises can settle after the render thread changes state.
    playback.paused = true;
    void playback.context.suspend().catch(() => undefined);
    playback.notify({ type: 'pause' });
  }

  resume(): void {
    const playback = this.active;
    if (!playback || !playback.paused) return;
    playback.paused = false;
    playback.notify({ type: 'resume' });
    void playback.context
      .resume()
      .then(() => {
        if (this.active !== playback || playback.paused) return;
        playback.start();
      })
      .catch(error => {
        if (this.active !== playback) return;
        this.release(playback);
        playback.reject(error instanceof Error ? error : new Error('Audio could not resume'));
      });
  }

  setRate(rate: number): void {
    const playback = this.active;
    if (!playback) return;
    if (playback.source) {
      playback.clipPosition = currentPosition(playback);
      playback.positionAnchor = playback.context.currentTime;
    }
    playback.source?.playbackRate.setValueAtTime(rate, playback.context.currentTime);
    playback.rate = rate;
  }
}

function currentPosition(playback: Playback): number {
  return (
    playback.clipPosition + (playback.context.currentTime - playback.positionAnchor) * playback.rate
  );
}

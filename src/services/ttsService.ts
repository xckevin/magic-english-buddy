/**
 * TTS 服务
 * 使用 Web Speech API 实现文本转语音
 * 支持单词级别高亮同步、语速控制、暂停/恢复
 */

import { BundledSpeechPlayer, getBundledSpeech } from './bundledAudioService';

export type TTSOwner = 'reader' | 'shadowing' | 'dictionary' | 'quiz' | 'default';

type TTSEventCallback = (event: TTSEvent) => void;

export interface TTSEvent {
  type: 'start' | 'end' | 'word' | 'pause' | 'resume' | 'error';
  /** Identifies the screen that initiated this utterance. */
  owner: TTSOwner;
  wordIndex?: number;
  word?: string;
  charIndex?: number;
  error?: string;
}

interface TTSOptions {
  rate?: number; // 语速 0.1-10，默认 1
  pitch?: number; // 音调 0-2，默认 1
  volume?: number; // 音量 0-1，默认 1
  lang?: string; // 语言，默认 'en-US'
  voice?: string; // 指定语音名称
}

export interface SpeakOptions {
  owner?: TTSOwner;
}

interface ActivePlayback {
  sessionId: number;
  owner: TTSOwner;
  utterance: SpeechSynthesisUtterance;
  resolve: () => void;
  reject: (reason: Error) => void;
}

export const isTTSAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const cancelledError = (): DOMException =>
  new DOMException('Speech playback was cancelled', 'AbortError');

interface WordBoundary {
  word: string;
  start: number; // 字符起始位置
  end: number; // 字符结束位置
  index: number; // 单词索引
}

export class TTSService {
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isPlaying = false;
  private isPaused = false;
  private currentWordIndex = 0;
  private wordBoundaries: WordBoundary[] = [];
  private listeners: Set<TTSEventCallback> = new Set();
  private activePlayback: ActivePlayback | null = null;
  private nextSessionId = 0;
  private bundledPlayer = new BundledSpeechPlayer();
  private bundledOwner: TTSOwner | null = null;
  private bundledSession = 0;
  private options: TTSOptions = {
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: 'en-US',
  };

  constructor() {
    // 安全检查：某些浏览器/环境可能不支持 speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();

      // 某些浏览器需要等待 voiceschanged 事件
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  /**
   * 加载可用语音
   */
  private loadVoices(): void {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices();
  }

  /**
   * 获取可用的英语语音列表
   */
  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en') || voice.lang.startsWith('EN'));
  }

  /**
   * 获取推荐的语音
   */
  getRecommendedVoice(): SpeechSynthesisVoice | null {
    const englishVoices = this.getEnglishVoices();

    // 优先选择：1. 本地高质量语音 2. 美式英语 3. 任意英语
    const localVoice = englishVoices.find(v => v.localService && v.lang === 'en-US');
    if (localVoice) return localVoice;

    const usVoice = englishVoices.find(v => v.lang === 'en-US');
    if (usVoice) return usVoice;

    return englishVoices[0] || null;
  }

  /**
   * 解析文本的单词边界
   */
  private parseWordBoundaries(text: string): WordBoundary[] {
    const boundaries: WordBoundary[] = [];
    const words = text.split(/(\s+)/);
    let charIndex = 0;
    let wordIndex = 0;

    for (const segment of words) {
      if (segment.trim()) {
        boundaries.push({
          word: segment,
          start: charIndex,
          end: charIndex + segment.length,
          index: wordIndex,
        });
        wordIndex++;
      }
      charIndex += segment.length;
    }

    return boundaries;
  }

  /**
   * 根据字符位置查找当前单词索引
   */
  private findWordIndexByCharIndex(charIndex: number): number {
    for (const boundary of this.wordBoundaries) {
      if (charIndex >= boundary.start && charIndex < boundary.end) {
        return boundary.index;
      }
    }
    return this.currentWordIndex;
  }

  /**
   * 设置 TTS 选项
   */
  setOptions(options: Partial<TTSOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 获取当前语速
   */
  getRate(): number {
    return this.options.rate || 1;
  }

  /**
   * 设置语速
   */
  setRate(rate: number): void {
    this.options.rate = Math.max(0.5, Math.min(2, rate));
    if (this.bundledOwner) {
      this.bundledPlayer.setRate(this.options.rate);
      return;
    }

    // 如果正在播放，需要重新开始
    if (this.isPlaying && this.utterance) {
      const currentText = this.utterance.text;
      const owner = this.activePlayback?.owner ?? 'default';
      this.stop();
      void this.speak(currentText, { owner }).catch(() => undefined);
    }
  }

  /**
   * 订阅事件
   */
  subscribe(callback: TTSEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 触发事件
   */
  private emit(event: TTSEvent): void {
    this.listeners.forEach(callback => callback(event));
  }

  private isActive(sessionId: number): boolean {
    return this.activePlayback?.sessionId === sessionId;
  }

  /**
   * Web Speech exposes one global queue. Cancel its active utterance and settle
   * the corresponding promise ourselves, because cancel() does not provide a
   * completion callback that callers can await reliably.
   */
  private cancelActivePlayback(): void {
    this.bundledOwner = null;
    this.bundledSession = 0;
    this.bundledPlayer.stop();
    const active = this.activePlayback;
    this.activePlayback = null;
    if (active) active.reject(cancelledError());
    this.synthesis?.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentWordIndex = 0;
    this.utterance = null;
  }

  /**
   * 播放文本
   */
  speak(text: string, options: SpeakOptions = {}): Promise<void> {
    const clips = getBundledSpeech(text);
    if (!clips) return this.speakNative(text, options);
    this.cancelActivePlayback();
    const owner = options.owner ?? 'default';
    const sessionId = ++this.nextSessionId;
    this.bundledOwner = owner;
    this.bundledSession = sessionId;
    return this.bundledPlayer.play(clips, this.getRate(), event => {
      if (this.bundledSession !== sessionId) return;
      if (event.type === 'start') { this.isPlaying = true; this.isPaused = false; }
      if (event.type === 'end') { this.isPlaying = false; this.isPaused = false; }
      if (event.type === 'pause') this.isPaused = true;
      if (event.type === 'resume') this.isPaused = false;
      if (event.wordIndex !== undefined) this.currentWordIndex = event.wordIndex;
      this.emit({ ...event, owner });
    }).catch(error => {
      if (isTTSAbortError(error) || this.bundledSession !== sessionId) throw error;
      // A missing/corrupt cached asset can still be read by the system voice.
      this.bundledOwner = null;
      this.isPlaying = false;
      this.isPaused = false;
      return this.speakNative(text, options);
    }).finally(() => {
      if (this.bundledSession === sessionId) {
        this.bundledOwner = null;
        this.bundledSession = 0;
      }
    });
  }

  private speakNative(text: string, { owner = 'default' }: SpeakOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查 TTS 是否可用
      if (!this.synthesis) {
        reject(new Error('TTS not supported'));
        return;
      }

      // SpeechSynthesis has one global queue, so a newer request supersedes the old one.
      this.cancelActivePlayback();

      // 解析单词边界
      this.wordBoundaries = this.parseWordBoundaries(text);
      this.currentWordIndex = 0;

      // 创建新的 utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;

      // 应用选项
      utterance.rate = this.options.rate || 1;
      utterance.pitch = this.options.pitch || 1;
      utterance.volume = this.options.volume || 1;
      utterance.lang = this.options.lang || 'en-US';

      // 设置语音
      const voice = this.getRecommendedVoice();
      if (voice) {
        utterance.voice = voice;
      }

      const sessionId = ++this.nextSessionId;
      this.activePlayback = { sessionId, owner, utterance, resolve, reject };

      // 事件处理
      utterance.onstart = () => {
        if (!this.isActive(sessionId)) return;
        this.isPlaying = true;
        this.isPaused = false;
        this.emit({ type: 'start', owner });
      };

      utterance.onend = () => {
        if (!this.isActive(sessionId)) return;
        this.activePlayback = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.emit({ type: 'end', owner });
        resolve();
      };

      utterance.onerror = event => {
        if (!this.isActive(sessionId)) return;
        this.activePlayback = null;
        this.isPlaying = false;
        this.isPaused = false;
        const errorMsg = event.error || 'Unknown TTS error';
        this.emit({ type: 'error', owner, error: errorMsg });
        reject(new Error(errorMsg));
      };

      // 单词边界事件（不是所有浏览器都支持）
      utterance.onboundary = event => {
        if (!this.isActive(sessionId)) return;
        if (event.name === 'word') {
          const wordIndex = this.findWordIndexByCharIndex(event.charIndex);
          this.currentWordIndex = wordIndex;
          const boundary = this.wordBoundaries[wordIndex];

          this.emit({
            type: 'word',
            owner,
            wordIndex,
            word: boundary?.word,
            charIndex: event.charIndex,
          });
        }
      };

      // 开始播放
      this.synthesis.speak(utterance);
    });
  }

  /**
   * 播放单个单词
   */
  speakWord(word: string, options: SpeakOptions = {}): Promise<void> {
    const originalRate = this.options.rate;
    this.options.rate = (this.options.rate || 1) * 0.9;
    const playback = this.speak(word, { owner: options.owner ?? 'dictionary' });
    this.options.rate = originalRate;
    return playback;
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.bundledOwner) { this.bundledPlayer.pause(); return; }
    if (!this.synthesis) return;
    if (this.isPlaying && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
      this.emit({ type: 'pause', owner: this.activePlayback?.owner ?? 'default' });
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.bundledOwner) { this.bundledPlayer.resume(); return; }
    if (!this.synthesis) return;
    if (this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
      this.emit({ type: 'resume', owner: this.activePlayback?.owner ?? 'default' });
    }
  }

  /**
   * 停止播放
   */
  stop(owner?: TTSOwner): void {
    if (owner && this.activePlayback?.owner !== owner && this.bundledOwner !== owner) return;
    this.cancelActivePlayback();
  }

  /**
   * 切换播放/暂停
   */
  toggle(): void {
    if (this.isPaused) {
      this.resume();
    } else if (this.isPlaying) {
      this.pause();
    }
  }

  /**
   * 获取播放状态
   */
  getStatus(): { isPlaying: boolean; isPaused: boolean; currentWordIndex: number } {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentWordIndex: this.currentWordIndex,
    };
  }

  /**
   * 检查是否支持 TTS
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && !!window.speechSynthesis;
  }
}

// 单例导出
export const ttsService = new TTSService();
export default ttsService;

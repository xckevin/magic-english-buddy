/**
 * TTS 服务
 * 使用 Web Speech API 实现文本转语音
 * 支持单词级别高亮同步、语速控制、暂停/恢复
 */

type TTSEventCallback = (event: TTSEvent) => void;

interface TTSEvent {
  type: 'start' | 'end' | 'word' | 'pause' | 'resume' | 'error';
  wordIndex?: number;
  word?: string;
  charIndex?: number;
  error?: string;
}

interface TTSOptions {
  rate?: number;      // 语速 0.1-10，默认 1
  pitch?: number;     // 音调 0-2，默认 1
  volume?: number;    // 音量 0-1，默认 1
  lang?: string;      // 语言，默认 'en-US'
  voice?: string;     // 指定语音名称
}

interface WordBoundary {
  word: string;
  start: number;  // 字符起始位置
  end: number;    // 字符结束位置
  index: number;  // 单词索引
}

class TTSService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isPlaying = false;
  private isPaused = false;
  private currentWordIndex = 0;
  private wordBoundaries: WordBoundary[] = [];
  private listeners: Set<TTSEventCallback> = new Set();
  private options: TTSOptions = {
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: 'en-US',
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // 某些浏览器需要等待 voiceschanged 事件
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  /**
   * 加载可用语音
   */
  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
  }

  /**
   * 获取可用的英语语音列表
   */
  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => 
      voice.lang.startsWith('en') || voice.lang.startsWith('EN')
    );
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
    
    // 如果正在播放，需要重新开始
    if (this.isPlaying && this.utterance) {
      const currentText = this.utterance.text;
      this.stop();
      this.speak(currentText);
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

  /**
   * 播放文本
   */
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 停止之前的播放
      this.stop();

      // 解析单词边界
      this.wordBoundaries = this.parseWordBoundaries(text);
      this.currentWordIndex = 0;

      // 创建新的 utterance
      this.utterance = new SpeechSynthesisUtterance(text);
      
      // 应用选项
      this.utterance.rate = this.options.rate || 1;
      this.utterance.pitch = this.options.pitch || 1;
      this.utterance.volume = this.options.volume || 1;
      this.utterance.lang = this.options.lang || 'en-US';

      // 设置语音
      const voice = this.getRecommendedVoice();
      if (voice) {
        this.utterance.voice = voice;
      }

      // 事件处理
      this.utterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
        this.emit({ type: 'start' });
      };

      this.utterance.onend = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.emit({ type: 'end' });
        resolve();
      };

      this.utterance.onerror = (event) => {
        this.isPlaying = false;
        this.isPaused = false;
        const errorMsg = event.error || 'Unknown TTS error';
        this.emit({ type: 'error', error: errorMsg });
        reject(new Error(errorMsg));
      };

      // 单词边界事件（不是所有浏览器都支持）
      this.utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const wordIndex = this.findWordIndexByCharIndex(event.charIndex);
          this.currentWordIndex = wordIndex;
          const boundary = this.wordBoundaries[wordIndex];
          
          this.emit({
            type: 'word',
            wordIndex,
            word: boundary?.word,
            charIndex: event.charIndex,
          });
        }
      };

      // 开始播放
      this.synthesis.speak(this.utterance);
    });
  }

  /**
   * 播放单个单词
   */
  speakWord(word: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 取消之前的播放但不重置状态
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = (this.options.rate || 1) * 0.9; // 单词稍慢
      utterance.pitch = this.options.pitch || 1;
      utterance.volume = this.options.volume || 1;
      utterance.lang = this.options.lang || 'en-US';

      const voice = this.getRecommendedVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Word TTS failed'));

      this.synthesis.speak(utterance);
    });
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
      this.emit({ type: 'pause' });
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
      this.emit({ type: 'resume' });
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    this.synthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentWordIndex = 0;
    this.utterance = null;
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
    return 'speechSynthesis' in window;
  }
}

// 单例导出
export const ttsService = new TTSService();
export default ttsService;


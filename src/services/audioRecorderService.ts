/**
 * AudioRecorderService - 音频录制服务
 * 支持影子跟读的录音功能
 */

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;

  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  };

  private listeners: Set<(state: RecordingState) => void> = new Set();

  /**
   * 检查浏览器是否支持录音功能
   * 兼容旧浏览器和微信 WebView
   */
  isSupported(): boolean {
    return (
      typeof MediaRecorder !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices !== 'undefined' &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: (state: RecordingState) => void): () => void {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  /**
   * 通知状态变化
   */
  private notify(): void {
    this.listeners.forEach(callback => callback({ ...this.state }));
  }

  /**
   * 检查麦克风权限
   */
  async checkPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 开始录音
   */
  async start(): Promise<boolean> {
    // 检查浏览器支持
    if (!this.isSupported()) {
      console.warn('AudioRecorder: 当前浏览器不支持录音功能');
      return false;
    }

    try {
      // 获取麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // 创建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType(),
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      // 收集音频数据
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // 录音结束
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.getSupportedMimeType() 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        this.state = {
          ...this.state,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl,
        };
        this.notify();

        // 清理流
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
      };

      // 开始录音
      this.mediaRecorder.start(100); // 每 100ms 收集一次数据

      // 更新时长
      this.durationInterval = setInterval(() => {
        this.state = {
          ...this.state,
          duration: Math.floor((Date.now() - this.startTime) / 1000),
        };
        this.notify();
      }, 1000);

      this.state = {
        ...this.state,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      };
      this.notify();

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * 停止录音
   */
  stop(): void {
    if (this.mediaRecorder && this.state.isRecording) {
      this.mediaRecorder.stop();
      
      if (this.durationInterval) {
        clearInterval(this.durationInterval);
        this.durationInterval = null;
      }
    }
  }

  /**
   * 暂停录音
   */
  pause(): void {
    if (this.mediaRecorder && this.state.isRecording && !this.state.isPaused) {
      this.mediaRecorder.pause();
      this.state = { ...this.state, isPaused: true };
      this.notify();
    }
  }

  /**
   * 恢复录音
   */
  resume(): void {
    if (this.mediaRecorder && this.state.isPaused) {
      this.mediaRecorder.resume();
      this.state = { ...this.state, isPaused: false };
      this.notify();
    }
  }

  /**
   * 重置
   */
  reset(): void {
    this.stop();
    
    if (this.state.audioUrl) {
      URL.revokeObjectURL(this.state.audioUrl);
    }

    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    };
    this.notify();
  }

  /**
   * 获取当前状态
   */
  getState(): RecordingState {
    return { ...this.state };
  }

  /**
   * 获取支持的 MIME 类型
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }
}

// 单例
export const audioRecorderService = new AudioRecorderService();

export default audioRecorderService;


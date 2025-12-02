import Tesseract, { Worker, createWorker } from 'tesseract.js';

type LoadingStatus = 'idle' | 'loading' | 'ready' | 'error';

interface WorkerState {
  worker: Worker | null;
  status: LoadingStatus;
  progress: number;
  error: string | null;
}

type StatusCallback = (state: WorkerState) => void;

/**
 * Tesseract Worker 单例管理器
 * 支持预加载、状态监听、Worker 复用
 */
class TesseractWorkerManager {
  private worker: Worker | null = null;
  private status: LoadingStatus = 'idle';
  private progress: number = 0;
  private error: string | null = null;
  private listeners: Set<StatusCallback> = new Set();
  private initPromise: Promise<Worker> | null = null;

  /**
   * 获取当前状态
   */
  getState(): WorkerState {
    return {
      worker: this.worker,
      status: this.status,
      progress: this.progress,
      error: this.error,
    };
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: StatusCallback): () => void {
    this.listeners.add(callback);
    // 立即通知当前状态
    callback(this.getState());
    // 返回取消订阅函数
    return () => this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器
   */
  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  /**
   * 更新状态
   */
  private updateStatus(status: LoadingStatus, progress?: number, error?: string | null): void {
    this.status = status;
    if (progress !== undefined) this.progress = progress;
    if (error !== undefined) this.error = error;
    this.notify();
  }

  /**
   * 预加载 Worker 和语言模型
   * 可以在应用启动时调用
   */
  async preload(): Promise<Worker> {
    // 如果已经在加载中，返回同一个 Promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // 如果已经加载完成，直接返回
    if (this.worker && this.status === 'ready') {
      return this.worker;
    }

    this.initPromise = this.initWorker();
    return this.initPromise;
  }

  /**
   * 初始化 Worker
   */
  private async initWorker(): Promise<Worker> {
    this.updateStatus('loading', 0, null);

    try {
      const worker = await createWorker('eng', Tesseract.OEM.LSTM_ONLY, {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            this.updateStatus('loading', Math.round(m.progress * 30));
          } else if (m.status === 'initializing tesseract') {
            this.updateStatus('loading', 30 + Math.round(m.progress * 20));
          } else if (m.status === 'loading language traineddata') {
            this.updateStatus('loading', 50 + Math.round(m.progress * 50));
          }
        },
        // 可选：使用更快的 CDN
        // workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        // corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
      });

      this.worker = worker;
      this.updateStatus('ready', 100, null);
      return worker;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载失败';
      this.updateStatus('error', 0, errorMsg);
      this.initPromise = null;
      throw err;
    }
  }

  /**
   * 获取 Worker（如果未加载则触发加载）
   */
  async getWorker(): Promise<Worker> {
    return this.preload();
  }

  /**
   * 执行 OCR 识别
   */
  async recognize(
    image: string | File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<Tesseract.RecognizeResult> {
    const worker = await this.getWorker();

    // 设置识别进度回调
    if (onProgress) {
      // Tesseract v5+ 的进度通过 recognize 的第三个参数获取
      // 但由于 worker 已经初始化，我们需要用其他方式
    }

    const result = await worker.recognize(image, {}, {
      text: true,
      blocks: false,
      hocr: false,
      tsv: false,
    });

    return result;
  }

  /**
   * 检查是否已加载完成
   */
  isReady(): boolean {
    return this.status === 'ready' && this.worker !== null;
  }

  /**
   * 检查是否正在加载
   */
  isLoading(): boolean {
    return this.status === 'loading';
  }

  /**
   * 销毁 Worker（通常不需要调用）
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initPromise = null;
      this.updateStatus('idle', 0, null);
    }
  }
}

// 导出单例实例
export const tesseractWorker = new TesseractWorkerManager();

// 导出类型
export type { LoadingStatus, WorkerState };


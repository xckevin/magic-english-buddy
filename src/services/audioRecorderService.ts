/**
 * AudioRecorderService - one microphone recording session at a time.
 *
 * `getUserMedia()` cannot be aborted directly. A request generation makes an
 * unanswered permission prompt harmless: a stream that arrives after stop,
 * reset, or dispose has every track stopped immediately.
 */
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private requestGeneration = 0;
  private pendingStart: Promise<boolean> | null = null;
  private activeSession: number | null = null;
  private nextSession = 0;

  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  };

  private listeners = new Set<(state: RecordingState) => void>();

  isSupported(): boolean {
    return (
      typeof MediaRecorder !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia
    );
  }

  subscribe(callback: (state: RecordingState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  private clearDurationTimer(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  private stopTracks(stream: MediaStream | null): void {
    stream?.getTracks().forEach(track => track.stop());
  }

  private releaseStream(stream: MediaStream | null = this.stream): void {
    this.stopTracks(stream);
    if (this.stream === stream) this.stream = null;
  }

  private cancelPendingStart(): void {
    // The promise stays pending until the browser resolves permission. Its
    // request id no longer matches, so its eventual stream is released.
    this.requestGeneration += 1;
    this.pendingStart = null;
  }

  async checkPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stopTracks(stream);
      return true;
    } catch {
      return false;
    }
  }

  start(): Promise<boolean> {
    if (!this.isSupported()) return Promise.resolve(false);
    if (this.state.isRecording || this.state.isPaused) return Promise.resolve(true);
    if (this.pendingStart) return this.pendingStart;

    const requestId = ++this.requestGeneration;
    const request = navigator.mediaDevices
      .getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      .then(stream => {
        if (requestId !== this.requestGeneration) {
          this.stopTracks(stream);
          return false;
        }

        this.pendingStart = null;
        return this.beginRecording(stream);
      })
      .catch(() => {
        if (requestId === this.requestGeneration) this.pendingStart = null;
        return false;
      });

    this.pendingStart = request;
    return request;
  }

  private beginRecording(stream: MediaStream): boolean {
    const sessionId = ++this.nextSession;
    try {
      const recorder = new MediaRecorder(stream, { mimeType: this.getSupportedMimeType() });
      this.mediaRecorder = recorder;
      this.stream = stream;
      this.activeSession = sessionId;
      this.audioChunks = [];
      this.startTime = Date.now();

      recorder.ondataavailable = event => {
        if (this.activeSession === sessionId && event.data.size > 0)
          this.audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const shouldKeepRecording = this.activeSession === sessionId;
        this.releaseStream(stream);
        if (!shouldKeepRecording) return;
        this.clearDurationTimer();

        const audioBlob = new Blob(this.audioChunks, { type: this.getSupportedMimeType() });
        this.activeSession = null;
        this.mediaRecorder = null;
        this.state = {
          ...this.state,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl: URL.createObjectURL(audioBlob),
        };
        this.notify();
      };

      // A recorder can fail after permission has been granted (for example when
      // its input track changes). Without this, the UI remains in “recording”
      // state and the microphone stream/timer may never be released.
      recorder.onerror = () => {
        if (this.activeSession !== sessionId) return;
        this.clearDurationTimer();
        this.releaseStream(stream);
        this.activeSession = null;
        this.mediaRecorder = null;
        this.state = {
          ...this.state,
          isRecording: false,
          isPaused: false,
          audioBlob: null,
          audioUrl: null,
          error: '录音已中断，请重新开始。',
        };
        this.notify();
      };

      recorder.start(100);
      this.durationInterval = setInterval(() => {
        if (this.activeSession !== sessionId) return;
        this.state = { ...this.state, duration: Math.floor((Date.now() - this.startTime) / 1000) };
        this.notify();
      }, 1000);
      if (this.state.audioUrl) URL.revokeObjectURL(this.state.audioUrl);
      this.state = {
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
        error: null,
      };
      this.notify();
      return true;
    } catch {
      this.releaseStream(stream);
      this.mediaRecorder = null;
      this.activeSession = null;
      return false;
    }
  }

  /** Finish an active recording, or invalidate a pending permission request. */
  stop(): void {
    this.cancelPendingStart();
    this.clearDurationTimer();
    if (
      this.mediaRecorder &&
      this.activeSession !== null &&
      this.mediaRecorder.state !== 'inactive'
    ) {
      this.mediaRecorder.stop();
      return;
    }
    if (!this.mediaRecorder) this.releaseStream();
  }

  pause(): void {
    if (this.mediaRecorder && this.state.isRecording && !this.state.isPaused) {
      this.mediaRecorder.pause();
      this.state = { ...this.state, isPaused: true };
      this.notify();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.state.isPaused) {
      this.mediaRecorder.resume();
      this.state = { ...this.state, isPaused: false };
      this.notify();
    }
  }

  /** Discard both a pending request and any in-progress recording. */
  reset(): void {
    this.cancelPendingStart();
    this.clearDurationTimer();
    this.activeSession = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') this.mediaRecorder.stop();
    this.mediaRecorder = null;
    this.releaseStream();
    if (this.state.audioUrl) URL.revokeObjectURL(this.state.audioUrl);
    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
    };
    this.notify();
  }

  /** Lifecycle alias used when an owning recording panel unmounts. */
  dispose(): void {
    this.reset();
  }

  getState(): RecordingState {
    return { ...this.state };
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
  }
}

export const audioRecorderService = new AudioRecorderService();
export default audioRecorderService;

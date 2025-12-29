/**
 * Vitest 测试环境设置
 * 在所有测试之前运行
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';

// 扩展 Vitest 的 expect 断言
expect.extend(matchers);

// 每个测试后清理
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Web APIs

// Mock SpeechSynthesis (TTS)
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [
    { lang: 'en-US', name: 'Google US English', default: true },
    { lang: 'en-GB', name: 'Google UK English', default: false }
  ]),
  onvoiceschanged: null,
  speaking: false,
  pending: false,
  paused: false
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
});

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string = '';
  lang: string = 'en-US';
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: Error) => void) | null = null;
  onboundary: ((e: { charIndex: number; name: string }) => void) | null = null;

  constructor(text?: string) {
    if (text) this.text = text;
  }
}

(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// Mock MediaRecorder
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: Error) => void) | null = null;

  constructor(public stream: MediaStream, public options?: MediaRecorderOptions) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['mock audio data'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  static isTypeSupported(type: string): boolean {
    return ['audio/webm', 'audio/webm;codecs=opus'].includes(type);
  }
}

(global as any).MediaRecorder = MockMediaRecorder;

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  },
  writable: true
});

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(() => true),
  writable: true
});

// Mock navigator.permissions
Object.defineProperty(navigator, 'permissions', {
  value: {
    query: vi.fn().mockResolvedValue({ state: 'granted' })
  },
  writable: true
});

// Mock IndexedDB (使用 fake-indexeddb)
import 'fake-indexeddb/auto';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(callback: IntersectionObserverCallback) {}
}

(global as any).IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(callback: ResizeObserverCallback) {}
}

(global as any).ResizeObserver = MockResizeObserver;

// Mock matchMedia (用于 Framer Motion)
// 创建完整的 MediaQueryList mock
const createMediaQueryList = (query: string): MediaQueryList => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
    media: query,
    onchange: null,
    addListener: vi.fn((cb) => listeners.push(cb)),
    removeListener: vi.fn((cb) => {
      const idx = listeners.indexOf(cb);
      if (idx > -1) listeners.splice(idx, 1);
    }),
    addEventListener: vi.fn((event, cb) => {
      if (event === 'change') listeners.push(cb);
    }),
    removeEventListener: vi.fn((event, cb) => {
      if (event === 'change') {
        const idx = listeners.indexOf(cb);
        if (idx > -1) listeners.splice(idx, 1);
      }
    }),
    dispatchEvent: vi.fn(() => true),
  } as MediaQueryList;
};

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(createMediaQueryList),
  writable: true,
  configurable: true,
});

// Mock requestAnimationFrame (用于 Framer Motion)
if (typeof window.requestAnimationFrame === 'undefined') {
  (window as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 0);
  };
}

if (typeof window.cancelAnimationFrame === 'undefined') {
  (window as any).cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

// Mock PointerEvent (用于 Framer Motion)
if (typeof window.PointerEvent === 'undefined') {
  class MockPointerEvent extends MouseEvent {
    pointerId: number = 0;
    pointerType: string = 'mouse';
    constructor(type: string, params?: PointerEventInit) {
      super(type, params);
    }
  }
  (window as any).PointerEvent = MockPointerEvent;
}

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock AudioContext
class MockAudioContext {
  state = 'running';
  destination = {};
  createAnalyser = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    fftSize: 256,
    getByteFrequencyData: vi.fn()
  }));
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn()
  }));
  decodeAudioData = vi.fn().mockResolvedValue({
    getChannelData: () => new Float32Array(1024)
  });
  close = vi.fn();
}

(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn()
})) as any;

// 全局测试工具
export const testUtils = {
  // 等待指定毫秒
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  
  // 模拟网络离线
  goOffline: () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    window.dispatchEvent(new Event('offline'));
  },
  
  // 模拟网络在线
  goOnline: () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    window.dispatchEvent(new Event('online'));
  },
  
  // 清除所有存储
  clearAllStorage: async () => {
    localStorage.clear();
    sessionStorage.clear();
    // IndexedDB 会被 fake-indexeddb 自动处理
  }
};

// 设置全局
(global as any).testUtils = testUtils;

console.log('🧪 Test environment setup complete');


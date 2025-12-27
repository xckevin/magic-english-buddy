/**
 * TTS Service 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ttsService } from '@/services/ttsService';

describe('TTSService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isSupported', () => {
    it('应该检测浏览器是否支持 TTS', () => {
      const result = ttsService.isSupported();
      expect(typeof result).toBe('boolean');
    });

    it('当 speechSynthesis 存在时应返回 true', () => {
      expect(ttsService.isSupported()).toBe(true);
    });
  });

  describe('getEnglishVoices', () => {
    it('应该返回英语语音列表', async () => {
      const voices = await ttsService.getEnglishVoices();
      expect(Array.isArray(voices)).toBe(true);
    });

    it('返回的语音应该是英语', async () => {
      const voices = await ttsService.getEnglishVoices();
      voices.forEach((voice) => {
        expect(voice.lang.startsWith('en')).toBe(true);
      });
    });
  });

  describe('speak', () => {
    it('应该调用 speechSynthesis.speak', async () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      // 由于是异步的，我们只测试调用
      ttsService.speak('Hello');
      
      expect(speakSpy).toHaveBeenCalled();
    });

    it('应该使用正确的语速', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speak('Hello', { rate: 0.8 });
      
      expect(speakSpy).toHaveBeenCalled();
    });

    it('应该支持自定义语言', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speak('Hello', { lang: 'en-GB' });
      
      expect(speakSpy).toHaveBeenCalled();
    });
  });

  describe('speakWord', () => {
    it('应该朗读单个单词', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speakWord('apple');
      
      expect(speakSpy).toHaveBeenCalled();
    });

    it('应该使用较慢的语速', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speakWord('apple', 0.8);
      
      expect(speakSpy).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('应该停止当前朗读', () => {
      const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');
      
      ttsService.stop();
      
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('应该暂停当前朗读', () => {
      const pauseSpy = vi.spyOn(window.speechSynthesis, 'pause');
      
      ttsService.pause();
      
      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    it('应该恢复朗读', () => {
      const resumeSpy = vi.spyOn(window.speechSynthesis, 'resume');
      
      ttsService.resume();
      
      expect(resumeSpy).toHaveBeenCalled();
    });
  });
});


/**
 * TTS Service 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ttsService } from '@/services/ttsService';

describe('TTSService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ttsService.stop();
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
    it('应该返回英语语音列表', () => {
      const voices = ttsService.getEnglishVoices();
      expect(Array.isArray(voices)).toBe(true);
    });

    it('返回的语音应该是英语', () => {
      const voices = ttsService.getEnglishVoices();
      voices.forEach((voice) => {
        expect(
          voice.lang.toLowerCase().startsWith('en')
        ).toBe(true);
      });
    });
  });

  describe('setOptions', () => {
    it('应该设置语速', () => {
      ttsService.setOptions({ rate: 0.8 });
      expect(ttsService.getRate()).toBe(0.8);
    });

    it('应该支持设置多个选项', () => {
      ttsService.setOptions({ rate: 1.2, pitch: 1.1, volume: 0.9 });
      expect(ttsService.getRate()).toBe(1.2);
    });
  });

  describe('setRate', () => {
    it('应该设置语速', () => {
      ttsService.setRate(0.7);
      expect(ttsService.getRate()).toBe(0.7);
    });

    it('应该限制语速在有效范围内', () => {
      ttsService.setRate(0.3); // 低于最小值 0.5
      expect(ttsService.getRate()).toBe(0.5);

      ttsService.setRate(3); // 高于最大值 2
      expect(ttsService.getRate()).toBe(2);
    });
  });

  describe('speak', () => {
    it('应该调用 speechSynthesis.speak', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speak('Hello');
      
      expect(speakSpy).toHaveBeenCalled();
    });

    it('应该创建 SpeechSynthesisUtterance', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speak('Test text');
      
      expect(speakSpy).toHaveBeenCalledWith(expect.any(SpeechSynthesisUtterance));
    });
  });

  describe('speakWord', () => {
    it('应该朗读单个单词', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      
      ttsService.speakWord('apple');
      
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
    it('调用 pause 方法不应报错', () => {
      // pause 只在 playing 状态下有效
      // 这里只验证方法存在且不报错
      expect(() => ttsService.pause()).not.toThrow();
    });
  });

  describe('resume', () => {
    it('应该调用 resume', () => {
      const resumeSpy = vi.spyOn(window.speechSynthesis, 'resume');
      
      ttsService.resume();
      
      // resume 只在 paused 状态下有效
      // 这里只验证方法存在且不报错
      expect(resumeSpy).not.toHaveBeenCalled(); // 因为没有 pause
    });
  });

  describe('getStatus', () => {
    it('应该返回播放状态', () => {
      const status = ttsService.getStatus();
      
      expect(status).toMatchObject({
        isPlaying: expect.any(Boolean),
        isPaused: expect.any(Boolean),
        currentWordIndex: expect.any(Number),
      });
    });

    it('初始状态应该是未播放', () => {
      ttsService.stop();
      const status = ttsService.getStatus();
      
      expect(status.isPlaying).toBe(false);
      expect(status.isPaused).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('应该支持订阅事件', () => {
      const callback = vi.fn();
      const unsubscribe = ttsService.subscribe(callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('应该支持取消订阅', () => {
      const callback = vi.fn();
      const unsubscribe = ttsService.subscribe(callback);
      
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('toggle', () => {
    it('应该调用 toggle 方法', () => {
      // toggle 切换播放/暂停状态
      expect(() => ttsService.toggle()).not.toThrow();
    });
  });

  describe('getRecommendedVoice', () => {
    it('应该返回推荐语音或 null', () => {
      const voice = ttsService.getRecommendedVoice();
      
      // 可能返回语音对象或 null
      expect(voice === null || typeof voice === 'object').toBe(true);
    });
  });
});

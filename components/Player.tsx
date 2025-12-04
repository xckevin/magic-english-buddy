import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextDisplay } from './TextDisplay';
import { Controls } from './Controls';
import { useWebSpeech } from '../hooks/useWebSpeech';
import { WordToken, DebugInfo } from '../types';
import { Bug, AlertTriangle, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'magic-english-buddy-text';

const DebugOverlay: React.FC<{ info: DebugInfo }> = ({ info }) => (
  <div className="fixed bottom-40 md:bottom-32 left-2 md:left-4 p-3 md:p-4 bg-black/90 text-green-400 font-mono text-[10px] md:text-xs rounded-lg shadow-xl z-[103] max-w-[280px] md:max-w-xs pointer-events-none opacity-90">
    <div className="flex items-center gap-2 mb-2 border-b border-green-400/30 pb-1">
      <Bug size={12} className="md:w-3.5 md:h-3.5" /> <span>TTS Debugger</span>
    </div>
    <div className="grid grid-cols-[70px_1fr] md:grid-cols-[80px_1fr] gap-x-2 gap-y-1">
      <span className="text-slate-400">Status:</span>
      <span className="font-bold text-white">{info.playbackState}</span>

      <span className="text-slate-400">Voice:</span>
      <span className="truncate text-blue-300" title={info.voiceName}>{info.voiceName || '-'}</span>

      <span className="text-slate-400">Type:</span>
      <span className={info.isLocalVoice ? "text-green-400" : "text-red-400"}>
        {info.isLocalVoice ? "Local (Good)" : "Network (May fail)"}
      </span>

      <span className="text-slate-400">Char Idx:</span>
      <span>{info.charIndex}</span>

      <span className="text-slate-400">Token:</span>
      <span className="text-yellow-300 truncate">"{info.matchedTokenText}"</span>

      <span className="text-slate-400">Tokens:</span>
      <span>{info.totalTokens}</span>

      <span className="text-slate-400">Last Evt:</span>
      <span>{info.lastEventTime}</span>
    </div>
  </div>
);

export const Player: React.FC = () => {
  const navigate = useNavigate();
  
  // 从 sessionStorage 读取文本
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [tokens, setTokens] = useState<WordToken[]>([]);
  const [speed, setSpeed] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [controlsHeight, setControlsHeight] = useState(100);
  const { t } = useTranslation();

  // 从 sessionStorage 加载文本
  useEffect(() => {
    try {
      const savedText = sessionStorage.getItem(STORAGE_KEY);
      if (savedText) {
        setText(savedText);
      }
    } catch (e) {
      // sessionStorage 不可用
    }
    setIsLoading(false);
  }, []);

  // 如果没有文本，重定向到首页
  useEffect(() => {
    if (!isLoading && !text) {
      navigate('/', { replace: true });
    }
  }, [isLoading, text, navigate]);

  // Check for debug flag in URL
  const allowDebug = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('debug') === 'true';
    }
    return false;
  }, []);

  // Initialize Voices
  useEffect(() => {
    const loadVoices = () => {
      let avail = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));

      // Sort voices: Local Service voices first!
      // This is critical because remote voices often don't support onboundary events.
      avail.sort((a, b) => {
        if (a.localService === b.localService) return 0;
        return a.localService ? -1 : 1;
      });

      setVoices(avail);

      if (avail.length > 0) {
        const currentExists = avail.find(v => v.name === selectedVoiceName);
        if (!selectedVoiceName || !currentExists) {
          // Priority: 
          // 1. Local Microsoft/System voices (very reliable for events)
          // 2. Any Local voice
          // 3. Fallback
          const preferred = avail.find(v => v.localService && (v.name.includes('Microsoft') || v.name.includes('Samantha'))) ||
            avail.find(v => v.localService) ||
            avail[0];
          setSelectedVoiceName(preferred?.name || '');
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceName]);

  const selectedVoice = voices.find(v => v.name === selectedVoiceName) || null;

  const {
    isSpeaking,
    isPaused,
    highlightIndex,
    debugInfo,
    play,
    pause,
    stop,
    speakSingleWord,
    speakText,
    isAvailable
  } = useWebSpeech({
    text,
    speed,
    tokens,
    selectedVoice,
    onEnd: () => { }
  });

  const handleSelection = (selectedText: string) => {
    if (selectedText.trim()) {
      if (isSpeaking) stop();
      speakText(selectedText);
    }
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 无文本状态
  if (!text) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 space-y-3 md:space-y-4">
        <AlertTriangle size={40} className="md:w-12 md:h-12 text-amber-400" />
        <p className="text-slate-500 text-base md:text-lg">{t('player.no_text')}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 md:px-6 md:py-3 bg-brand text-white rounded-lg md:rounded-xl font-bold text-sm md:text-base hover:bg-brand-dark transition-colors"
        >
          {t('app.back')}
        </button>
      </div>
    );
  }

  // Check if TTS is available
  const ttsUnavailable = !isAvailable;

  return (
    <>
      {/* 
        Padding bottom dynamically adjusted based on Controls height 
        to ensure fixed Controls never obscure the text content. 
      */}
      <div
        className="animate-fade-in relative"
        style={{ paddingBottom: `${controlsHeight + 24}px` }}
      >

        {/* TTS Unavailable Warning */}
        {ttsUnavailable && (
          <div className="mb-4 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <VolumeX size={20} className="text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-sm md:text-base">
              {t('player.tts_unavailable', '您的浏览器不支持语音合成功能，朗读功能将不可用。')}
            </p>
          </div>
        )}

        {/* Debug Toggle - Only visible if ?debug=true */}
        {allowDebug && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="absolute -top-8 md:-top-10 right-0 text-[10px] md:text-xs text-slate-300 hover:text-slate-500 font-mono"
          >
            [{showDebug ? t('player.debug_hide') : t('player.debug_show')}]
          </button>
        )}

        {/* Display Area */}
        <div className="relative">
          <TextDisplay
            rawText={text}
            highlightIndex={highlightIndex}
            onTokensGenerated={setTokens}
            onWordClick={(word) => {
              speakSingleWord(word);
            }}
            onTextSelected={handleSelection}
          />

          {/* Simple Guide */}
          <div className="mt-4 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 text-center">
            <div className="bg-white/60 backdrop-blur-sm p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-[10px] md:text-sm text-slate-600 shadow-sm">
              <span className="block font-bold text-brand mb-0.5 md:mb-1 text-xs md:text-base">{t('player.guide_interactive_title')}</span>
              <span className="hidden md:inline">{t('player.guide_interactive_desc')}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-[10px] md:text-sm text-slate-600 shadow-sm">
              <span className="block font-bold text-fun-pink mb-0.5 md:mb-1 text-xs md:text-base">{t('player.guide_click_title')}</span>
              <span className="hidden md:inline">{t('player.guide_click_desc')}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-[10px] md:text-sm text-slate-600 shadow-sm">
              <span className="block font-bold text-fun-purple mb-0.5 md:mb-1 text-xs md:text-base">{t('player.guide_select_title')}</span>
              <span className="hidden md:inline">{t('player.guide_select_desc')}</span>
            </div>
          </div>
        </div>
      </div>

      {showDebug && <DebugOverlay info={debugInfo} />}

      {/* Fixed Controls */}
      <Controls
        isPlaying={isSpeaking}
        isPaused={isPaused}
        speed={speed}
        voices={voices}
        selectedVoiceName={selectedVoiceName}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onSpeedChange={setSpeed}
        onVoiceChange={setSelectedVoiceName}
        onHeightChange={setControlsHeight}
        disabled={ttsUnavailable}
      />
    </>
  );
};

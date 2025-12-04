import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlayCircle, PenTool, Eraser, Library, Book, Check, ScanLine } from 'lucide-react';
import { generateStory } from '../services/geminiService';
import { useTranslation } from 'react-i18next';
import { PRESETS, PresetStory } from '../data/presets';
import { CameraCapture } from './CameraCapture';
import clsx from 'clsx';

const STORAGE_KEY = 'magic-english-buddy-text';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'write' | 'generate' | 'preset'>('write');
  const [activeCategory, setActiveCategory] = useState<PresetStory['category'] | 'all'>('all');
  const [englishOnly, setEnglishOnly] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const { t } = useTranslation();

  // 从 sessionStorage 恢复文本
  useEffect(() => {
    try {
      const savedText = sessionStorage.getItem(STORAGE_KEY);
      if (savedText) {
        setText(savedText);
      }
    } catch (e) {
      // sessionStorage 不可用时忽略
    }
  }, []);

  // 过滤非英文字符，保留英文字母、数字和常见标点
  const filterEnglishOnly = (input: string): string => {
    // 保留英文字母、数字、常见标点符号、空格和换行
    // 匹配英文单词、数字、标点和空白字符
    return input
      .replace(/[^\w\s.,!?;:'"()\-\n\r]/g, ' ') // 替换非英文字符为空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .replace(/\n\s*\n/g, '\n') // 清理多余的换行
      .trim();
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const story = await generateStory(topic, difficulty);
      setText(story);
      setMode('write'); // Switch to write mode so they can see/edit it
    } catch (e) {
      alert(t('home.error_gen'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (content: string) => {
    setText(content);
    setMode('write');
  };

  const handleOcrTextExtracted = (extractedText: string) => {
    setText((prev) => {
      // 如果已有文本，追加到末尾
      if (prev.trim()) {
        return prev + '\n\n' + extractedText;
      }
      return extractedText;
    });
    setShowCamera(false);
  };

  const handleStartPractice = () => {
    if (!text.trim()) return;
    const finalText = englishOnly ? filterEnglishOnly(text) : text;
    
    // 保存到 sessionStorage（兼容性更好）
    try {
      sessionStorage.setItem(STORAGE_KEY, finalText);
    } catch (e) {
      // sessionStorage 不可用时忽略
    }
    
    navigate('/player');
  };

  const filteredPresets = activeCategory === 'all'
    ? PRESETS
    : PRESETS.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Section */}
      <div className="text-center space-y-2 md:space-y-4 py-4 md:py-8">
        <h2 className="text-2xl md:text-5xl font-display font-bold text-slate-800">
          {t('home.hero_title')}
        </h2>
        <p className="text-sm md:text-lg text-slate-600 max-w-lg mx-auto px-2">
          {t('home.hero_subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-brand/5 border border-white overflow-hidden">

        {/* Toggle Header */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setMode('write')}
            className={clsx(
              "flex-1 py-3 md:py-4 font-bold text-center transition-colors flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap text-sm md:text-base",
              mode === 'write' ? "bg-white text-brand border-b-4 border-brand" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <PenTool size={16} className="md:w-[18px] md:h-[18px]" />
            {t('home.tab_write')}
          </button>
          <button
            onClick={() => setMode('preset')}
            className={clsx(
              "flex-1 py-3 md:py-4 font-bold text-center transition-colors flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap text-sm md:text-base",
              mode === 'preset' ? "bg-white text-fun-green border-b-4 border-fun-green" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <Library size={16} className="md:w-[18px] md:h-[18px]" />
            {t('home.tab_preset')}
          </button>
          <button
            onClick={() => setMode('generate')}
            className={clsx(
              "flex-1 py-3 md:py-4 font-bold text-center transition-colors flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap text-sm md:text-base",
              mode === 'generate' ? "bg-white text-fun-pink border-b-4 border-fun-pink" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
            {t('home.tab_generate')}
          </button>
        </div>

        <div className="p-4 md:p-8">
          {mode === 'write' && (
            <div className="space-y-3 md:space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('home.placeholder_write')}
                  className="w-full h-40 md:h-64 p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none resize-none text-base md:text-lg text-slate-700 leading-relaxed transition-all"
                />
                {/* OCR 扫描按钮 */}
                <button
                  onClick={() => setShowCamera(true)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-fun-purple to-fun-pink text-white text-xs md:text-sm font-bold rounded-lg shadow-lg shadow-fun-purple/20 hover:shadow-xl hover:shadow-fun-purple/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <ScanLine size={14} className="md:w-4 md:h-4" />
                  {t('home.ocr_scan')}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setText('')}
                  className="text-slate-400 hover:text-red-400 font-bold text-xs md:text-sm flex items-center gap-1 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Eraser size={14} className="md:w-4 md:h-4" /> {t('home.clear')}
                </button>

                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer select-none group">
                  <div
                    onClick={() => setEnglishOnly(!englishOnly)}
                    className={clsx(
                      "w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center transition-all",
                      englishOnly
                        ? "bg-brand border-brand text-white"
                        : "border-slate-300 bg-white group-hover:border-brand/50"
                    )}
                  >
                    {englishOnly && <Check size={12} className="md:w-3.5 md:h-3.5" strokeWidth={3} />}
                  </div>
                  <span className="text-slate-500 text-xs md:text-sm font-medium">{t('home.english_only')}</span>
                </label>

                <span className="text-slate-300 text-xs md:text-sm font-bold">{text.length} {t('home.chars')}</span>
              </div>
            </div>
          )}

          {mode === 'preset' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border-2",
                    activeCategory === 'all'
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  All
                </button>
                {(['fable', 'daily', 'science', 'fun'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={clsx(
                      "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border-2",
                      activeCategory === cat
                        ? "bg-fun-green text-white border-fun-green shadow-lg shadow-fun-green/20"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {t(`home.cat_${cat}`)}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-h-[280px] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                {filteredPresets.map(story => (
                  <button
                    key={story.id}
                    onClick={() => handleSelectPreset(story.content)}
                    className="text-left p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-slate-100 hover:border-fun-green hover:bg-green-50/50 transition-all group relative"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm md:text-base text-slate-700 group-hover:text-fun-green pr-4 md:pr-6">{story.title}</h3>
                      <Book size={14} className="md:w-4 md:h-4 text-slate-300 group-hover:text-fun-green shrink-0 mt-0.5 md:mt-1" />
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-400 mt-1.5 md:mt-2 line-clamp-2">
                      {story.content}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'generate' && (
            <div className="space-y-4 md:space-y-6 py-2 md:py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">{t('home.topic_label')}</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t('home.topic_placeholder')}
                  className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-fun-pink focus:ring-4 focus:ring-fun-pink/10 outline-none text-base md:text-lg"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">{t('home.difficulty_label')}</label>
                <div className="flex gap-2 md:gap-4">
                  {['beginner', 'intermediate'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level as any)}
                      className={clsx(
                        "flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base border-2 transition-all capitalize",
                        difficulty === level
                          ? "border-fun-pink bg-fun-pink/10 text-fun-pink"
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {t(`home.diff_${level}`)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-fun-pink to-fun-purple text-white font-bold text-base md:text-lg shadow-xl shadow-fun-pink/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <span className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Sparkles size={20} className="md:w-6 md:h-6" />
                )}
                {isGenerating ? t('home.btn_generating') : t('home.btn_generate')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Button Area */}
      {mode === 'write' && (
        <div className="flex justify-center pt-2 md:pt-0">
          <button
            onClick={handleStartPractice}
            disabled={!text.trim()}
            className="group relative px-6 py-3 md:px-8 md:py-4 bg-brand hover:bg-brand-dark text-white rounded-full font-display font-bold text-lg md:text-xl shadow-xl shadow-brand/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <span>{t('home.btn_start')}</span>
              <PlayCircle size={24} className="md:w-7 md:h-7 group-hover:rotate-90 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onTextExtracted={handleOcrTextExtracted}
          onClose={() => setShowCamera(false)}
        />
      )}

    </div>
  );
};

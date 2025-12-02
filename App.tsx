import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home } from './components/Home';
import { Player } from './components/Player';
import { BookOpen, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { preloadTesseract } from './services/ocrService';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isPlayerPage = location.pathname === '/player';

  const handleBackToHome = () => {
    navigate('/');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans selection:bg-fun-pink selection:text-white pb-6 md:pb-10">
      {/* Global Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-brand-light px-3 py-2.5 md:p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer group"
            onClick={handleBackToHome}
          >
            <div className="bg-brand text-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg shadow-brand/20 transition-transform group-hover:scale-110 group-hover:rotate-[-5deg]">
              <BookOpen size={20} className="md:w-6 md:h-6" />
            </div>
            <h1 className="text-base md:text-2xl font-display font-bold text-brand-dark tracking-tight">
              {t('app.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl bg-slate-50 hover:bg-white text-slate-600 font-bold text-xs md:text-sm transition-colors border border-transparent hover:border-slate-200"
            >
              <Languages size={16} className="md:w-[18px] md:h-[18px]" />
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>

            {isPlayerPage && (
              <button
                onClick={handleBackToHome}
                className="text-xs md:text-sm font-bold text-slate-500 hover:text-brand bg-slate-100 hover:bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all"
              >
                {t('app.back')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-3 md:p-6 md:mt-4">
        <Outlet />
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-fun-pink via-fun-yellow to-brand pointer-events-none z-40"></div>
    </div>
  );
};

const App: React.FC = () => {
  // 预加载 Tesseract OCR 引擎
  useEffect(() => {
    preloadTesseract();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<Player />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;

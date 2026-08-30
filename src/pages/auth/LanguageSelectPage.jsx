import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const LANGUAGES = [
  {
    code: 'mr',
    name: 'मराठी',
    sub: 'Marathi',
    symbol: 'म',
  },
  {
    code: 'en',
    name: 'English',
    sub: 'English',
    symbol: 'A',
  },
  {
    code: 'hi',
    name: 'हिंदी',
    sub: 'Hindi',
    symbol: 'ह',
  },
];

export default function LanguageSelectPage({ onSelectLanguage, onBack }) {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'mr');

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('wari_language', langCode);
  };

  const handleContinue = () => {
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('wari_language', selectedLang);
    localStorage.setItem('wari_language_selected', 'true');
    if (onSelectLanguage) {
      onSelectLanguage(selectedLang);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Background Image with Warm Sunlight Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/language_bg.jpg')`,
        }}
      >
        {/* Soft golden overlay filter */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/25 via-transparent to-amber-950/40 pointer-events-none" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-5 pb-2">
        <button
          onClick={onBack || (() => {})}
          className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-center text-amber-950 dark:text-amber-200 shadow-md hover:bg-white transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-bold text-amber-950 dark:text-amber-100 font-heading tracking-wide drop-shadow-sm">
          {t('language_select.page_title')}
        </h1>

        <div className="w-10" />
      </header>

      {/* Center Language Card (Exact design from user's image) */}
      <main className="relative z-20 flex items-center justify-center px-5 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[360px] bg-[#fbf7ee]/95 dark:bg-[#1a1510]/95 backdrop-blur-xl rounded-[28px] p-6 shadow-2xl border-2 border-amber-300/70 dark:border-amber-600/40 relative"
        >
          {/* Top Emblem: Flag & "अ" Circle */}
          <div className="flex flex-col items-center -mt-12 mb-3">
            {/* Saffron Flag */}
            <div className="text-xl mb-0.5 animate-bounce">🚩</div>

            {/* Dark Circle with Devanagari "अ" */}
            <div className="w-14 h-14 rounded-full bg-[#3d2417] dark:bg-[#25150c] text-white flex items-center justify-center text-2xl font-bold font-heading shadow-lg border-2 border-amber-300/50">
              अ
            </div>

            {/* Ornate Flourish Divider */}
            <div className="flex items-center gap-2 mt-3 text-amber-800/60 dark:text-amber-400/60 text-xs">
              <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-700/50" />
              <span>❖</span>
              <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-700/50" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-5">
            <h2 className="text-lg font-extrabold text-[#2d1b11] dark:text-amber-100 font-heading">
              {t('language_select.card_title')}
            </h2>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/70 mt-1 font-medium leading-relaxed">
              {t('language_select.card_subtitle')}
            </p>
          </div>

          {/* Language Options (Radio List) */}
          <div className="space-y-2.5 mb-5">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-[#3b2114] text-white border-[#3b2114] shadow-lg shadow-amber-950/30'
                      : 'bg-white/80 dark:bg-white/5 text-[#2d1b11] dark:text-amber-100 border-amber-200/70 dark:border-amber-900/40 hover:border-amber-400'
                  }`}
                >
                  {/* Left: Symbol Box & Name */}
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`text-xl font-bold font-heading transition-colors ${
                        isSelected ? 'text-amber-300' : 'text-[#3b2114] dark:text-amber-200'
                      }`}
                    >
                      {lang.symbol}
                    </span>
                    <div>
                      <div className="text-sm font-bold leading-tight">
                        {lang.name}
                      </div>
                      <div
                        className={`text-[11px] font-medium transition-colors ${
                          isSelected ? 'text-amber-200/80' : 'text-amber-900/60 dark:text-amber-400/60'
                        }`}
                      >
                        {lang.sub}
                      </div>
                    </div>
                  </div>

                  {/* Right: Radio Circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/20'
                        : 'border-amber-700/40 dark:border-amber-400/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Continue Action Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-orange-600/30 active:scale-[0.98]"
          >
            <span>{t('language_select.continue_btn')}</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </main>

      {/* Bottom Sacred Chant */}
      <footer className="relative z-20 pb-6 pt-2 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-amber-300/30 shadow-lg">
          <p className="text-sm md:text-base font-extrabold text-amber-200 font-heading tracking-widest drop-shadow-md">
            {t('language_select.chant')}
          </p>
        </div>
      </footer>
    </div>
  );
}

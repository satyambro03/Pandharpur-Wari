import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1.5 rounded-lg transition-all duration-200 ${
          compact
            ? 'p-2 hover:bg-black/5 dark:hover:bg-white/10'
            : 'px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-wari-border dark:border-slate-700 hover:border-wari-saffron shadow-sm'
        }`}
      >
        <Globe size={compact ? 18 : 14} className="text-wari-text-secondary dark:text-slate-400" />
        {!compact && (
          <span className="text-wari-text dark:text-slate-200">
            {LANGUAGES.find(l => l.code === i18n.language)?.label || 'English'}
          </span>
        )}
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-wari-border dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`w-full px-4 py-2 text-sm text-left transition-colors ${
              i18n.language === lang.code
                ? 'bg-wari-saffron/10 text-wari-saffron font-semibold'
                : 'text-wari-text dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}

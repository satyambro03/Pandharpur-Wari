import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Map, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'home', icon: Home, labelKey: 'nav.home' },
  { key: 'map', icon: Map, labelKey: 'nav.map' },
  { key: 'helpline', icon: Phone, labelKey: 'nav.helpline' },
  { key: 'profile', icon: User, labelKey: 'nav.profile' },
];

export default function BottomNav({ active, onChange }) {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-3 mb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-wari-border/50 dark:border-slate-700/50">
        <div className="flex items-center justify-around py-1.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="relative flex flex-col items-center py-2 px-4 min-w-[64px] transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 w-8 h-1 bg-wari-saffron rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-wari-saffron' : 'text-wari-text-secondary dark:text-slate-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${
                    isActive ? 'text-wari-saffron' : 'text-wari-text-secondary dark:text-slate-500'
                  }`}
                >
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Map, Bell, FileText, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import TacticalMapPage from './TacticalMapPage';
import SOSAlertsPage from './SOSAlertsPage';
import SitRepPage from './SitRepPage';
import StationInfoPage from './StationInfoPage';

const TABS = [
  { key: 'map', icon: Map, labelKey: 'nav.tactical_map' },
  { key: 'sos', icon: Bell, labelKey: 'nav.sos_alerts' },
  { key: 'sitrep', icon: FileText, labelKey: 'nav.sitrep' },
  { key: 'station', icon: User, labelKey: 'nav.station' },
];

export default function TacticalLayout() {
  const { t } = useTranslation();
  const { role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('map');

  const renderPage = () => {
    switch (activeTab) {
      case 'map': return <TacticalMapPage key="tmap" />;
      case 'sos': return <SOSAlertsPage key="sos" />;
      case 'sitrep': return <SitRepPage key="sitrep" />;
      case 'station': return <StationInfoPage key="station" />;
      default: return <TacticalMapPage />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            onClick={() => setActiveTab('map')}
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left active:scale-95"
            title="Go to Map"
          >
            <div className={`w-2 h-2 rounded-full ${role === 'police' ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`} />
            <span className="text-sm font-bold text-white font-heading">
              {role === 'police' ? '🛡️ Police' : '💜 Volunteer'} — {t('app_name')}
            </span>
          </button>
          <div className="flex items-center gap-1">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
        <div className="flex items-center justify-around py-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex flex-col items-center py-1.5 px-4 min-w-[64px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tacticalNavIndicator"
                    className="absolute -top-0.5 w-8 h-1 bg-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={isActive ? 'text-blue-400' : 'text-slate-500'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  {t(tab.labelKey)}
                </span>
                {tab.key === 'sos' && (
                  <span className="absolute -top-1 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center animate-pulse">!</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CrowdMap from '../../components/CrowdMap';
import { POI_CATEGORIES } from '../../lib/mockData';
import { useCrowdDensity } from '../../hooks/useCrowdDensity';
import { ChevronUp, ChevronDown, Navigation, Clock, Route } from 'lucide-react';

export default function MapPage() {
  const { t } = useTranslation();
  const { routes } = useCrowdDensity();
  const [activeCategories, setActiveCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCategory = (key) => {
    setActiveCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const greenRoutes = routes.filter(r => r.status === 'green');
  const totalDistance = routes.length * 50; // Approx 50km per segment

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)]">
      {/* Map */}
      <div className="flex-1 relative">
        <CrowdMap activeCategories={activeCategories} fullscreen />

        {/* Legend overlay */}
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg px-3 py-2 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-1 rounded-full bg-green-500" />
            <span className="text-wari-text dark:text-slate-300">{t('map.low_crowd')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-1 rounded-full bg-orange-500" />
            <span className="text-wari-text dark:text-slate-300">{t('map.moderate_crowd')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-1 rounded-full bg-red-500" />
            <span className="text-wari-text dark:text-slate-300">{t('map.heavy_crowd')}</span>
          </div>
        </div>
      </div>

      {/* POI Layer Toggles */}
      <div className="bg-white dark:bg-slate-900 border-t border-wari-border dark:border-slate-800 px-3 py-2">
        <div className="text-[10px] font-semibold text-wari-text-secondary dark:text-slate-400 mb-1.5 uppercase tracking-wide">
          {t('map.poi_layers')}
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {POI_CATEGORIES.map(cat => {
            const isActive = activeCategories.includes(cat.key);
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-wari-border dark:border-slate-700 text-wari-text-secondary dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
                style={isActive ? { backgroundColor: cat.color } : {}}
              >
                {t(`poi.${cat.key}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Drawer */}
      <motion.div
        className="bg-white dark:bg-slate-900 border-t border-wari-border dark:border-slate-800 rounded-t-2xl"
        animate={{ height: drawerOpen ? 'auto' : 48 }}
      >
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full flex items-center justify-center py-2"
        >
          <div className="w-10 h-1 bg-wari-border dark:bg-slate-700 rounded-full" />
        </button>

        {drawerOpen && (
          <motion.div
            className="px-4 pb-4 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-sm font-bold text-wari-text dark:text-white">{t('map.route_info')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-wari-bg dark:bg-slate-800 rounded-xl p-3 text-center">
                <Navigation size={18} className="text-wari-saffron mx-auto mb-1" />
                <div className="text-lg font-bold text-wari-text dark:text-white">~{totalDistance}</div>
                <div className="text-[10px] text-wari-text-secondary dark:text-slate-400">{t('map.km')} {t('map.distance')}</div>
              </div>
              <div className="bg-wari-bg dark:bg-slate-800 rounded-xl p-3 text-center">
                <Clock size={18} className="text-wari-saffron mx-auto mb-1" />
                <div className="text-lg font-bold text-wari-text dark:text-white">~18</div>
                <div className="text-[10px] text-wari-text-secondary dark:text-slate-400">{t('home.day')}s Total</div>
              </div>
            </div>

            {greenRoutes.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-semibold mb-1">
                  <Route size={14} />
                  {t('map.recommended')}
                </div>
                {greenRoutes.map(r => (
                  <div key={r.route_id} className="text-xs text-green-600 dark:text-green-300">
                    ✓ {r.route_name} ({r.crowd_count} {t('home.people')})
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

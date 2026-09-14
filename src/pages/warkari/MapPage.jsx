import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import CrowdMap from '../../components/CrowdMap';
import { WARI_ROUTE_OPTIONS, POI_CATEGORIES } from '../../lib/mockData';
import { usePOI } from '../../hooks/usePOI';
import {
  Search,
  X,
  Navigation,
  Clock,
  Route,
  ChevronUp,
  ChevronDown,
  Compass,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function MapPage() {
  const { t } = useTranslation();
  const { pois } = usePOI();

  const [selectedRouteId, setSelectedRouteId] = useState('dnyaneshwar');
  const [activeCategories, setActiveCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Active Route Option
  const activeRoute = useMemo(() => {
    return WARI_ROUTE_OPTIONS.find((r) => r.id === selectedRouteId) || WARI_ROUTE_OPTIONS[0];
  }, [selectedRouteId]);

  // Density Breakdown for the active route
  const densityStats = useMemo(() => {
    const segments = activeRoute.segments || [];
    const green = segments.filter((s) => s.status === 'green').length;
    const orange = segments.filter((s) => s.status === 'orange').length;
    const red = segments.filter((s) => s.status === 'red').length;
    const total = segments.length || 1;
    return {
      greenPct: Math.round((green / total) * 100),
      orangePct: Math.round((orange / total) * 100),
      redPct: Math.round((red / total) * 100),
      greenCount: green,
      orangeCount: orange,
      redCount: red,
    };
  }, [activeRoute]);

  const toggleCategory = (key) => {
    if (key === 'all') {
      setActiveCategories([]);
      return;
    }
    setActiveCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Count active facilities matching filter & search
  const totalPOIsMatching = useMemo(() => {
    return pois.filter((p) => {
      const matchesCat = activeCategories.length === 0 || activeCategories.includes(p.category);
      const matchesSearch =
        !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.landmark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nameKey && t(p.nameKey).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    }).length;
  }, [pois, activeCategories, searchQuery, t]);

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] relative select-none">
      {/* Top Multi-Route Selection & Search Header */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-2.5 space-y-2 z-10 shadow-sm">
        {/* Multi-Route Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar">
          {WARI_ROUTE_OPTIONS.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => {
                  setSelectedRouteId(route.id);
                  setSelectedSegment(null);
                }}
                className={`flex-1 min-w-[155px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: route.color }}
                />
                <span className="truncate">
                  {route.nameKey ? t(route.nameKey) : route.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('map.search_placeholder') || 'Search hospital, water, food, parking, safety...'}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-wari-saffron/40 border border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Facility Category Chips (Google Maps Quick Filters) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {/* All Facilities Chip */}
          <button
            type="button"
            onClick={() => toggleCategory('all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${
              activeCategories.length === 0
                ? 'bg-gradient-to-r from-wari-saffron to-orange-600 text-white border-transparent shadow-orange-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span>🚩</span>
            <span>{t('map.all_facilities') || 'All Facilities'}</span>
          </button>

          {POI_CATEGORIES.map((cat) => {
            const isActive = activeCategories.includes(cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => toggleCategory(cat.key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${
                  isActive
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                style={isActive ? { backgroundColor: cat.color } : {}}
              >
                <span>{cat.emoji}</span>
                <span>{t(cat.labelKey) || cat.key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Display */}
      <div className="flex-1 relative">
        <CrowdMap
          selectedRouteId={selectedRouteId}
          activeCategories={activeCategories}
          searchQuery={searchQuery}
          fullscreen
          onPOISelect={(poi) => {
            setSelectedPOI(poi);
            setSelectedSegment(null);
          }}
          onSegmentSelect={(seg) => {
            setSelectedSegment(seg);
            setSelectedPOI(null);
          }}
        />

        {/* Live Distance & Time Metrics Floating Overlay */}
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-1.5 pointer-events-auto max-w-[210px]">
          <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {activeRoute.origin} ➔ {activeRoute.destination}
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-orange-500/10 text-wari-saffron">
              {activeRoute.durationDays} Days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeRoute.distanceKm} km
              </div>
              <div className="text-[9px] font-semibold text-slate-400">Total Distance</div>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                ~{activeRoute.walkingHours} hrs
              </div>
              <div className="text-[9px] font-semibold text-slate-400">Walking Time</div>
            </div>
          </div>

          {/* Crowd Density Gauge Bar */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 dark:text-slate-300">
              <span>Live Crowd Density</span>
              <span className="text-emerald-600">{densityStats.greenPct}% Safe</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
              <div style={{ width: `${densityStats.greenPct}%` }} className="bg-green-500 h-full" />
              <div style={{ width: `${densityStats.orangePct}%` }} className="bg-orange-500 h-full" />
              <div style={{ width: `${densityStats.redPct}%` }} className="bg-red-500 h-full" />
            </div>
          </div>
        </div>

        {/* Live Facility Count Badge */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {totalPOIsMatching} {t('map.facility_count') || 'facilities on map'}
          </span>
        </div>

        {/* Selected POI Floating Bottom Card */}
        <AnimatePresence>
          {selectedPOI && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 z-[1001] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-wari-saffron p-4 pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-wari-saffron border border-orange-500/20">
                      {t(`poi.${selectedPOI.category}`) || selectedPOI.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedPOI.capacity_status !== 'full'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {t(`poi.${selectedPOI.capacity_status}`) || selectedPOI.capacity_status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedPOI.nameKey ? t(selectedPOI.nameKey) : selectedPOI.name}
                  </h3>

                  {selectedPOI.landmark && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{selectedPOI.landmark}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPOI(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                {selectedPOI.contact ? (
                  <a
                    href={`tel:${selectedPOI.contact}`}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center no-underline"
                  >
                    <Phone size={13} className="text-emerald-600" />
                    <span>
                      {t('helpline.call')} ({selectedPOI.contact})
                    </span>
                  </a>
                ) : (
                  <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-medium text-center flex items-center justify-center">
                    Free Seva
                  </div>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPOI.latitude},${selectedPOI.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-wari-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/25 text-center no-underline"
                >
                  <Compass size={14} />
                  <span>{t('map.open_directions') || 'Google Maps'}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Route Segment Card */}
        <AnimatePresence>
          {selectedSegment && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 z-[1001] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-orange-500 p-4 pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Segment Details
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedSegment.status === 'green'
                          ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                          : selectedSegment.status === 'orange'
                          ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                          : 'bg-red-500/15 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {selectedSegment.status === 'green' && (t('map.low_crowd') || 'Low Crowd')}
                      {selectedSegment.status === 'orange' && (t('map.moderate_crowd') || 'Moderate Crowd')}
                      {selectedSegment.status === 'red' && (t('map.heavy_crowd') || 'Heavy Crowd')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedSegment.nameKey ? t(selectedSegment.nameKey) : selectedSegment.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
                    <span>📍 {selectedSegment.distanceKm} km</span>
                    <span>⏱️ ~{selectedSegment.walkingHours} hrs</span>
                    <span>👥 {selectedSegment.crowd_count?.toLocaleString()} Pilgrims</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSegment(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Route Information & Segment Breakdown Drawer */}
      <motion.div
        className="bg-white dark:bg-slate-900 border-t border-wari-border dark:border-slate-800 rounded-t-3xl shadow-xl z-10"
        animate={{ height: drawerOpen ? 'auto' : 44 }}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full flex flex-col items-center justify-center py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <span>{t('map.route_info')} & Segments</span>
            {drawerOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </span>
        </button>

        {drawerOpen && (
          <motion.div
            className="px-4 pb-4 space-y-3 max-h-[45vh] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Top Summary Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-2.5 text-center border border-slate-100 dark:border-slate-800">
                <Navigation size={16} className="text-wari-saffron mx-auto mb-0.5" />
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{activeRoute.distanceKm} km</div>
                <div className="text-[9px] text-slate-400 font-semibold">{t('map.distance')}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-2.5 text-center border border-slate-100 dark:border-slate-800">
                <Clock size={16} className="text-wari-saffron mx-auto mb-0.5" />
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">~{activeRoute.walkingHours} hrs</div>
                <div className="text-[9px] text-slate-400 font-semibold">{activeRoute.durationDays} {t('home.day')}s</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-2.5 text-center border border-slate-100 dark:border-slate-800">
                <Activity size={16} className="text-emerald-500 mx-auto mb-0.5" />
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{densityStats.greenPct}%</div>
                <div className="text-[9px] text-slate-400 font-semibold">Smooth Path</div>
              </div>
            </div>

            {/* Segment by Segment Breakdown */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilgrimage Segments & Live Crowd
              </h4>
              {activeRoute.segments.map((seg, idx) => (
                <div
                  key={seg.id}
                  onClick={() => setSelectedSegment(seg)}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {seg.nameKey ? t(seg.nameKey) : seg.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {seg.distanceKm} km • ~{seg.walkingHours} hrs
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        seg.status === 'green'
                          ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                          : seg.status === 'orange'
                          ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                          : 'bg-red-500/15 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {seg.crowd_count} {t('home.people')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Calendar, Lightbulb, ChevronRight, Flag, ChevronDown, Check, X, Compass, Clock, Radio } from 'lucide-react';
import { useCrowdDensity } from '../../hooks/useCrowdDensity';
import { WARI_STOPS, WARI_MILESTONES, SAFETY_TIPS } from '../../lib/mockData';

const STATUS_COLORS = { green: 'bg-green-500', orange: 'bg-orange-500', red: 'bg-red-500' };
const STATUS_BG = { green: 'bg-green-50 dark:bg-green-900/20', orange: 'bg-orange-50 dark:bg-orange-900/20', red: 'bg-red-50 dark:bg-red-900/20' };
const STATUS_TEXT = { green: 'text-green-700 dark:text-green-400', orange: 'text-orange-700 dark:text-orange-400', red: 'text-red-700 dark:text-red-400' };

export default function HomePage() {
  const { t } = useTranslation();
  const { routes } = useCrowdDensity();

  // State for interactive From and Destination selection
  const [fromStop, setFromStop] = useState('alandi');
  const [destStop, setDestStop] = useState('pandharpur');
  const [selectorType, setSelectorType] = useState(null); // 'from' | 'destination' | null

  // Palkhi started status: false = Not Yet Scheduled / Yatra Not Started, true = Live Active Location
  const [isPalkhiStarted, setIsPalkhiStarted] = useState(false);
  const currentMilestone = WARI_MILESTONES[7]; // Phaltan (Day 8)
  const totalPilgrims = routes.reduce((sum, r) => sum + (r.crowd_count || 0), 0);

  // Dynamic point-to-point filtered milestones between fromStop and destStop
  const filteredMilestones = React.useMemo(() => {
    const fromIdx = WARI_MILESTONES.findIndex((m) => m.id === fromStop);
    const toIdx = WARI_MILESTONES.findIndex((m) => m.id === destStop);

    if (fromIdx === -1 || toIdx === -1) {
      return WARI_MILESTONES;
    }

    if (fromIdx <= toIdx) {
      return WARI_MILESTONES.slice(fromIdx, toIdx + 1);
    } else {
      // User selected a reverse direction journey
      return WARI_MILESTONES.slice(toIdx, fromIdx + 1).reverse();
    }
  }, [fromStop, destStop]);

  const isCustomFiltered = fromStop !== 'alandi' || destStop !== 'pandharpur';

  const handleSwapStops = () => {
    setFromStop(destStop);
    setDestStop(fromStop);
  };

  const handleResetFullRoute = () => {
    setFromStop('alandi');
    setDestStop('pandharpur');
  };

  const getStopName = (stopId) => {
    const stop = WARI_STOPS.find(s => s.id === stopId);
    return stop ? t(stop.nameKey) : stopId;
  };

  const getRouteTitle = (route) => {
    if (route.nameKey) {
      return t(route.nameKey);
    }
    const cleanId = route.route_id?.replace('seg_', '');
    const key = `routes.${cleanId}`;
    const translated = t(key);
    return translated !== key ? translated : route.route_name;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 select-none">
      {/* ── Place Selector Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selectorType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setSelectorType(null)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl border border-wari-border dark:border-slate-800 max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-wari-border dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="text-wari-saffron" size={20} />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    {selectorType === 'from' ? t('home.select_from') : t('home.select_destination')}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectorType(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Stops List */}
              <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
                {WARI_STOPS.map((stop) => {
                  const isSelected = (selectorType === 'from' ? fromStop : destStop) === stop.id;
                  return (
                    <button
                      key={stop.id}
                      onClick={() => {
                        if (selectorType === 'from') {
                          setFromStop(stop.id);
                        } else {
                          setDestStop(stop.id);
                        }
                        setSelectorType(null);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                        isSelected
                          ? 'bg-wari-saffron/15 text-wari-saffron border-2 border-wari-saffron font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-orange-50/50 dark:hover:bg-slate-800 border border-transparent font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={16} className={isSelected ? 'text-wari-saffron' : 'text-slate-400'} />
                        <span className="text-sm">{t(stop.nameKey)}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-wari-saffron" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Card (Orange rectangle) ────────────────────────────── */}
      <motion.div
        className="bg-gradient-to-br from-wari-saffron to-amber-500 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-sm" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full blur-sm" />

        {/* Title */}
        <h2 className="text-lg font-bold font-heading relative z-10 flex items-center gap-2">
          <span>🚩</span>
          <span>{t('home.pilgrimage_title')}</span>
        </h2>

        {/* Interactive From -> Destination Selection Row */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mt-3.5 relative z-10">
          {/* From Button */}
          <button
            type="button"
            onClick={() => setSelectorType('from')}
            className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all px-3 py-2 rounded-2xl text-left border border-white/25 shadow-sm"
          >
            <div className="text-[10px] uppercase font-semibold text-white/80 tracking-wider">
              {t('home.from')}:
            </div>
            <div className="text-xs font-bold truncate flex items-center justify-between gap-1 mt-0.5">
              <span>{getStopName(fromStop)}</span>
              <ChevronDown size={12} className="opacity-80 flex-shrink-0" />
            </div>
          </button>

          {/* Swap / Arrow Button */}
          <button
            type="button"
            onClick={handleSwapStops}
            title="Swap locations"
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 active:scale-90 transition-all flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30"
          >
            <ChevronRight size={15} className="text-white" />
          </button>

          {/* Destination Button */}
          <button
            type="button"
            onClick={() => setSelectorType('destination')}
            className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all px-3 py-2 rounded-2xl text-left border border-white/25 shadow-sm"
          >
            <div className="text-[10px] uppercase font-semibold text-white/80 tracking-wider">
              {t('home.to')}:
            </div>
            <div className="text-xs font-bold truncate flex items-center justify-between gap-1 mt-0.5">
              <span>{getStopName(destStop)}</span>
              <ChevronDown size={12} className="opacity-80 flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Current Palkhi Location Banner (Conditional: Live Started vs Not Yet Scheduled) */}
        <div className="mt-4 bg-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3 relative z-10 border border-white/20 shadow-inner">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            {isPalkhiStarted ? (
              <MapPin size={20} className="text-white" />
            ) : (
              <Clock size={20} className="text-white/90" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-white/80 flex items-center gap-1.5">
              <span>{t('home.current_location')}</span>
              {isPalkhiStarted && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="text-sm font-extrabold truncate">
              {isPalkhiStarted
                ? t(currentMilestone.nameKey)
                : (t('home.palkhi_not_started') || 'Not Yet Scheduled / Yatra Not Started')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPalkhiStarted(!isPalkhiStarted)}
            title="Click to toggle Live/Pending status"
            className="text-xs font-bold bg-white/25 hover:bg-white/35 active:scale-95 transition-all px-2.5 py-1 rounded-xl shadow-sm text-center flex-shrink-0 cursor-pointer"
          >
            {isPalkhiStarted ? (
              `${t('home.day')} ${currentMilestone.day}`
            ) : (
              t('home.status_not_started') || 'Not Started'
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Live Crowd Summary ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-md border border-wari-border dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Users size={16} className="text-wari-saffron" />
          <span>{t('home.crowd_summary')}</span>
        </h3>

        <div className="space-y-2">
          {routes.map((route, i) => (
            <motion.div
              key={route.route_id}
              className={`flex items-center gap-3 p-3 rounded-2xl ${STATUS_BG[route.status]} border border-transparent transition-all`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[route.status]} flex-shrink-0 shadow-sm`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {getRouteTitle(route)}
                </div>
              </div>
              <div className={`text-xs font-extrabold ${STATUS_TEXT[route.status]}`}>
                {route.crowd_count?.toLocaleString()} <span className="font-medium text-[11px]">{t('home.people')}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          <strong className="text-slate-900 dark:text-white font-bold">{totalPilgrims.toLocaleString()}</strong> {t('home.people')}
        </div>
      </div>

      {/* ── Yatra Schedule Timeline (Point-to-Point) ─────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-md border border-wari-border dark:border-slate-800">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={16} className="text-wari-saffron" />
            <span>{t('home.point_to_point_schedule') || t('home.schedule_title')}</span>
          </h3>

          {isCustomFiltered && (
            <button
              type="button"
              onClick={handleResetFullRoute}
              className="text-[11px] font-bold text-wari-saffron hover:underline bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20"
            >
              {t('home.view_full_schedule')}
            </button>
          )}
        </div>

        {/* Selected Route Range Indicator */}
        <div className="mb-4 p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-orange-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 truncate">
            <span className="text-amber-600">🚩 {getStopName(fromStop)}</span>
            <span className="text-slate-400">➔</span>
            <span className="text-rose-600">🏁 {getStopName(destStop)}</span>
          </div>
          <div className="text-[11px] font-bold px-2 py-0.5 bg-white dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm">
            {filteredMilestones.length} {t('home.stops_count')}
          </div>
        </div>

        <div className="relative pl-1">
          {/* Vertical Timeline Track */}
          <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-4">
            {filteredMilestones.map((ms, index) => {
              const isFirst = index === 0;
              const isLast = index === filteredMilestones.length - 1 && filteredMilestones.length > 1;
              const isCurrentHalt = isPalkhiStarted && ms.id === currentMilestone.id;

              return (
                <div key={`${ms.id}-${index}`} className="flex items-start gap-3 relative group">
                  {/* Node Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm transition-transform group-hover:scale-110 ${
                      isFirst
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                        : isLast
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950'
                        : isCurrentHalt
                        ? 'bg-wari-saffron text-white ring-4 ring-orange-100 dark:ring-orange-950 animate-pulse'
                        : ms.isPalkhi
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950'
                        : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isFirst ? (
                      <span className="text-[10px] font-black">1</span>
                    ) : isLast ? (
                      <Flag size={11} />
                    ) : isCurrentHalt || ms.isPalkhi ? (
                      <Flag size={11} />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Milestone Details */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                        {t(ms.nameKey)}
                      </span>

                      {/* Badges */}
                      {isFirst && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                          {t('home.start_point')}
                        </span>
                      )}
                      {isLast && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold">
                          {t('home.destination_point')}
                        </span>
                      )}
                      {isCurrentHalt && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold">
                          🚩 {t('home.current_palkhi_here')}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                      <span>{t(ms.dateKey)}</span>
                      <span>•</span>
                      <span>{t('home.day')} {ms.day}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Key Safety Tips ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-md border border-wari-border dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Lightbulb size={16} className="text-wari-saffron" />
          <span>{t('home.safety_tips_title')}</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {SAFETY_TIPS.map((tip) => (
            <div
              key={tip.id}
              className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-1"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {t(tip.titleKey)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {t(tip.descKey)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Announcements Banner ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-3.5 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1.5">
          <span>📢</span>
          <span>{t('home.announcements')}</span>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-300 overflow-hidden font-medium">
          <div className="animate-marquee whitespace-nowrap">
            {t('home.announcements')}: {t('map.recommended')} • {t('helpline.sos_title')} • {t('home.pilgrimage_title')}
          </div>
        </div>
      </div>
    </div>
  );
}

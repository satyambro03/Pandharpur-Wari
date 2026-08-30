import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSAlerts } from '../../hooks/useSOSAlerts';
import { MapPin, Phone, Clock, CheckCircle2, Truck, AlertCircle, Bell } from 'lucide-react';

const STATUS_STYLES = {
  pending: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', icon: AlertCircle },
  in_progress: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', icon: Truck },
  resolved: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', icon: CheckCircle2 },
};

export default function SOSAlertsPage() {
  const { t } = useTranslation();
  const { alerts, loading, updateAlert } = useSOSAlerts();

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Bell size={16} className="text-red-400" />
        {t('tactical.sos_stream_title')}
        {alerts.filter(a => a.status === 'pending').length > 0 && (
          <span className="px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-bold animate-pulse">
            {alerts.filter(a => a.status === 'pending').length}
          </span>
        )}
      </h2>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">{t('common.loading')}</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{t('tactical.no_alerts')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert, i) => {
              const style = STATUS_STYLES[alert.status] || STATUS_STYLES.pending;
              const StatusIcon = style.icon;
              const time = new Date(alert.created_at).toLocaleString();

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-4 ${style.bg}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={style.text} />
                      <span className="text-sm font-semibold text-white">{alert.user_name || 'Anonymous'}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${style.bg} ${style.text} border ${style.bg}`}>
                      {t(`tactical.${alert.status}`)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-slate-300 mb-3">
                    {alert.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-500" />
                        <a href={`tel:${alert.phone}`} className="hover:text-blue-400">{alert.phone}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-slate-500" />
                      <span className="font-mono text-[10px]">{alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-500" />
                      <span>{time}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {alert.status !== 'resolved' && (
                    <div className="flex gap-2">
                      {alert.status === 'pending' && (
                        <button
                          onClick={() => updateAlert(alert.id, 'in_progress')}
                          className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Truck size={12} /> {t('tactical.dispatch')}
                        </button>
                      )}
                      <button
                        onClick={() => updateAlert(alert.id, 'resolved')}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={12} /> {t('tactical.resolved')}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

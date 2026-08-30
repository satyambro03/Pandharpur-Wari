import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Shield, BadgeCheck, MapPin, Clock, LogOut, User } from 'lucide-react';

export default function StationInfoPage() {
  const { t } = useTranslation();
  const { user, role, logout } = useAuth();

  const isPolice = role === 'police';

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <User size={16} className="text-blue-400" />
        {t('tactical.station_title')}
      </h2>

      {/* Profile Card */}
      <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isPolice ? 'bg-blue-500/20' : 'bg-purple-500/20'
          }`}>
            {isPolice ? (
              <Shield size={28} className="text-blue-400" />
            ) : (
              <BadgeCheck size={28} className="text-purple-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name || 'Officer'}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isPolice ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
            }`}>
              {isPolice ? 'Police Officer' : 'Volunteer'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <BadgeCheck size={16} className="text-slate-500 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('tactical.badge_id')}</div>
              <div className="text-white font-mono">{user?.badgeId || user?.volunteerId || 'N/A'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-slate-500 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('tactical.assigned_sector')}</div>
              <div className="text-white">{user?.sector || 'Pandharpur Zone A'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-slate-500 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('tactical.shift_timing')}</div>
              <div className="text-white">{user?.shift || '06:00 – 14:00'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-medium text-sm hover:bg-red-500/10 flex items-center justify-center gap-2 transition-all"
      >
        <LogOut size={16} />
        {t('profile.logout')}
      </button>
    </div>
  );
}

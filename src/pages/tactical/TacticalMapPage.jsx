import React from 'react';
import { useTranslation } from 'react-i18next';
import CrowdMap from '../../components/CrowdMap';
import { useCrowdDensity } from '../../hooks/useCrowdDensity';
import { AlertTriangle, Users } from 'lucide-react';

const STATUS_COLORS = { green: 'text-green-400', orange: 'text-orange-400', red: 'text-red-400' };
const STATUS_BG = { green: 'bg-green-500/10', orange: 'bg-orange-500/10', red: 'bg-red-500/10' };
const STATUS_DOT = { green: 'bg-green-500', orange: 'bg-orange-500', red: 'bg-red-500' };

export default function TacticalMapPage() {
  const { t } = useTranslation();
  const { routes } = useCrowdDensity();
  const hotZones = routes.filter(r => r.status === 'orange' || r.status === 'red');

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)]">
      {/* Map */}
      <div className="flex-1 relative">
        <CrowdMap fullscreen darkTiles activeCategories={[]} showUserLocation={false} />
      </div>

      {/* Congestion panel */}
      <div className="bg-slate-900 border-t border-slate-800 p-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-orange-400" />
          {t('tactical.congestion_zones')}
        </h3>
        {hotZones.length === 0 ? (
          <p className="text-xs text-slate-500">All routes clear</p>
        ) : (
          <div className="space-y-1.5">
            {hotZones.map(zone => (
              <div key={zone.route_id} className={`flex items-center gap-2 p-2 rounded-lg ${STATUS_BG[zone.status]}`}>
                <div className={`w-2 h-2 rounded-full ${STATUS_DOT[zone.status]} animate-pulse`} />
                <span className="text-xs text-white flex-1">{zone.route_name}</span>
                <span className={`text-xs font-bold ${STATUS_COLORS[zone.status]}`}>
                  <Users size={10} className="inline mr-0.5" />
                  {zone.crowd_count?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Send, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const INCIDENT_TYPES = ['roadblock', 'medical_emergency', 'missing_person', 'crowd_surge'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const SEVERITY_COLORS = { low: 'border-green-500', medium: 'border-yellow-500', high: 'border-orange-500', critical: 'border-red-500' };

export default function SitRepPage() {
  const { t } = useTranslation();
  const [type, setType] = useState('roadblock');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [coords, setCoords] = useState(null);

  const captureLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 17.6778, lng: 75.3267 })
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    // In production, this would write to a `situation_reports` table
    console.log('SitRep submitted:', { type, severity, description, coords });

    setSubmitted(true);
    setDescription('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <FileText size={16} className="text-blue-400" />
        {t('tactical.sitrep_title')}
      </h2>

      <div className="space-y-5">
        {/* Incident Type */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">{t('tactical.incident_type')}</label>
          <div className="grid grid-cols-2 gap-2">
            {INCIDENT_TYPES.map(it => (
              <button
                key={it}
                onClick={() => setType(it)}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all border ${
                  type === it
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {t(`tactical.${it}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">{t('tactical.severity')}</label>
          <div className="flex gap-2">
            {SEVERITIES.map(s => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border-2 ${
                  severity === s
                    ? `${SEVERITY_COLORS[s]} bg-slate-800`
                    : 'border-slate-700 bg-slate-800/50 text-slate-500'
                }`}
              >
                {t(`tactical.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <button
            onClick={captureLocation}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <MapPin size={14} />
            {coords ? `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Capture GPS Location'}
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">{t('tactical.description')}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none placeholder:text-slate-600"
            placeholder="Describe the situation..."
          />
        </div>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            submitted
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {submitted ? (
            <>
              <CheckCircle2 size={16} /> {t('tactical.report_submitted')}
            </>
          ) : (
            <>
              <Send size={16} /> {t('tactical.submit_report')}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

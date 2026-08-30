import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function SOSButton() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSOS = async () => {
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');

    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve({ lat: 17.6778, lng: 75.3267 }), // fallback to Pandharpur
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

      if (supabase) {
        await supabase.from('sos_alerts').insert({
          user_name: user?.name || 'Anonymous Warkari',
          phone: user?.phone || 'Unknown',
          latitude: pos.lat,
          longitude: pos.lng,
          status: 'pending',
        });
      }

      setStatus('sent');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('SOS Error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Pulse rings */}
      <div className="relative">
        {status === 'idle' && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/20 sos-ring" />
            <div className="absolute inset-0 rounded-full bg-red-500/10 sos-ring" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        <motion.button
          onClick={handleSOS}
          whileTap={{ scale: 0.95 }}
          className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
            status === 'sent'
              ? 'bg-green-500'
              : status === 'sending'
              ? 'bg-red-400 animate-pulse'
              : status === 'error'
              ? 'bg-orange-500'
              : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
          }`}
        >
          {status === 'sent' ? (
            <CheckCircle2 size={48} className="text-white mb-1" />
          ) : status === 'error' ? (
            <AlertTriangle size={48} className="text-white mb-1" />
          ) : (
            <AlertTriangle size={48} className="text-white mb-1" />
          )}
          <span className="text-white font-bold text-sm text-center px-4">
            {status === 'sending'
              ? t('helpline.sos_sending')
              : status === 'sent'
              ? t('helpline.sos_sent')
              : t('helpline.sos_button')}
          </span>
        </motion.button>
      </div>

      {status === 'sent' && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium text-center"
        >
          {t('helpline.sos_sent_desc')}
        </motion.p>
      )}
    </div>
  );
}

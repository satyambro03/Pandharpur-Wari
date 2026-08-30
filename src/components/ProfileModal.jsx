import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, Camera } from 'lucide-react';

export default function ProfileModal({ open, onClose }) {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateProfile({ avatar: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ name, address });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-wari-text dark:text-white font-heading">{t('profile.edit_profile')}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <X size={18} className="text-wari-text-secondary dark:text-slate-400" />
            </button>
          </div>

          {/* Avatar Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-wari-saffron/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-wari-saffron to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                    {name ? name[0]?.toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-wari-saffron rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"
              >
                <Camera size={14} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400">{t('profile.full_name')}</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-wari-border dark:border-slate-600 bg-wari-bg dark:bg-slate-900 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400">{t('profile.address')}</span>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-wari-border dark:border-slate-600 bg-wari-bg dark:bg-slate-900 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50"
              />
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${saved
              ? 'bg-green-500 text-white'
              : 'bg-wari-saffron hover:bg-orange-600 text-white active:scale-[0.98]'
              }`}
          >
            {saved ? `✓ ${t('profile.saved')}` : t('profile.save')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

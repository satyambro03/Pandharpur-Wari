import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Save, LogOut, User, Phone, MapPin, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const fileRef = useRef(null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [saved, setSaved] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfile({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ name, phone, address, emergencyContact });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-wari-text dark:text-white font-heading mb-6">{t('profile.title')}</h2>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-wari-saffron/20 shadow-lg">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-wari-saffron to-amber-600 flex items-center justify-center text-white text-3xl font-bold">
                {name ? name[0]?.toUpperCase() : '?'}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-1 right-1 w-9 h-9 bg-wari-saffron rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors border-2 border-white dark:border-slate-900"
          >
            <Camera size={16} className="text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400 flex items-center gap-1">
            <User size={12} /> {t('profile.full_name')}
          </span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-wari-border dark:border-slate-600 bg-white dark:bg-slate-800 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400 flex items-center gap-1">
            <Phone size={12} /> {t('profile.contact')}
          </span>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-wari-border dark:border-slate-600 bg-white dark:bg-slate-800 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400 flex items-center gap-1">
            <MapPin size={12} /> {t('profile.address')}
          </span>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-wari-border dark:border-slate-600 bg-white dark:bg-slate-800 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400 flex items-center gap-1">
            <AlertCircle size={12} /> {t('profile.emergency_contact')}
          </span>
          <input
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-wari-border dark:border-slate-600 bg-white dark:bg-slate-800 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50"
          />
        </label>

        {/* Language Preference */}
        <div>
          <span className="text-xs font-medium text-wari-text-secondary dark:text-slate-400 flex items-center gap-1 mb-1">
            <Globe size={12} /> {t('profile.language_pref')}
          </span>
          <div className="flex gap-2">
            {[{ code: 'en', label: 'English' }, { code: 'mr', label: 'मराठी' }, { code: 'hi', label: 'हिंदी' }].map(lang => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  i18n.language === lang.code
                    ? 'bg-wari-saffron text-white border-wari-saffron'
                    : 'bg-white dark:bg-slate-800 text-wari-text dark:text-slate-300 border-wari-border dark:border-slate-700 hover:border-wari-saffron'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        whileTap={{ scale: 0.98 }}
        className={`w-full mt-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-wari-saffron hover:bg-orange-600 text-white'
        }`}
      >
        <Save size={16} />
        {saved ? `✓ ${t('profile.saved')}` : t('profile.save')}
      </motion.button>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full mt-3 py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all"
      >
        <LogOut size={16} />
        {t('profile.logout')}
      </button>
    </div>
  );
}

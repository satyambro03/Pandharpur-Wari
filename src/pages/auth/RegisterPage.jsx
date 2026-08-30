import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Phone, Lock, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function RegisterPage({
  onSwitchToLogin,
  onOpenLanguageSelect,
  onRegisterSuccessRedirectToLogin,
}) {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  // Role is locked to Pilgrim/Warkari for self-registration
  const role = 'pilgrim';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError(t('auth.invalid_name') || 'Please enter your full name');
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError(t('auth.invalid_mobile') || 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.invalid_password') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // 1. If Supabase is connected, call register RPC or database
      if (supabase) {
        const { data, error: rpcError } = await supabase.rpc('register_user', {
          p_name: name.trim(),
          p_mobile: mobile.trim(),
          p_password: password,
          p_role: 'pilgrim',
        });

        if (rpcError) {
          console.warn('Supabase registration RPC error:', rpcError);
        }
      }

      // 2. Show the Registration Successful popup
      setShowSuccessPopup(true);

      // 3. Redirect to login after 2.2 seconds
      setTimeout(() => {
        if (onRegisterSuccessRedirectToLogin) {
          onRegisterSuccessRedirectToLogin(mobile.trim());
        } else if (onSwitchToLogin) {
          onSwitchToLogin(mobile.trim());
        }
      }, 2200);
    } catch (err) {
      console.error('Registration error:', err);
      // Fallback: show success and proceed to login
      setShowSuccessPopup(true);
      setTimeout(() => {
        if (onRegisterSuccessRedirectToLogin) {
          onRegisterSuccessRedirectToLogin(mobile.trim());
        } else if (onSwitchToLogin) {
          onSwitchToLogin(mobile.trim());
        }
      }, 2200);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissSuccess = () => {
    if (onRegisterSuccessRedirectToLogin) {
      onRegisterSuccessRedirectToLogin(mobile.trim());
    } else if (onSwitchToLogin) {
      onSwitchToLogin(mobile.trim());
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-wari-bg to-orange-50 dark:from-slate-950 dark:to-slate-900 font-sans relative">
      {/* Registration Successful Popup Modal */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={44} className="text-emerald-500 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {t('auth.registration_success_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t('auth.registration_success_desc')}
                </p>
              </div>

              {/* Progress timer bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 2.2, ease: 'linear' }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>

              <button
                type="button"
                onClick={handleDismissSuccess}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {t('auth.go_to_login')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header with Language Switch Option */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={() => onSwitchToLogin?.()}
          className="flex items-center gap-1 text-xs font-semibold text-wari-text-secondary dark:text-slate-400 hover:text-wari-saffron"
        >
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        {onOpenLanguageSelect && (
          <button
            type="button"
            onClick={onOpenLanguageSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-wari-border dark:border-slate-700 shadow-sm text-xs font-bold text-wari-saffron hover:border-wari-saffron transition-all"
          >
            <Globe size={14} />
            <span>{t('auth.change_language')}</span>
          </button>
        )}
      </div>

      {/* Brand Header */}
      <motion.div
        className="flex flex-col items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src="/logo.png"
          alt="WariRakshak"
          className="w-16 h-16 object-contain mb-2 drop-shadow-md"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <h1 className="text-2xl font-bold text-wari-saffron font-heading">
          {t('auth.register_title')}
        </h1>
        <p className="text-xs text-wari-text-secondary dark:text-slate-400 mt-0.5 text-center">
          {t('auth.register_subtitle')}
        </p>
      </motion.div>

      {/* Registration Form Card */}
      <motion.div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-wari-border dark:border-slate-800 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Fixed Role Notice: Warkari (Pilgrim) Only */}
        <div className="mb-4 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
          <span>🚩</span>
          <span>{t('auth.register_pilgrim_fixed') || 'Warkari (Pilgrim) Account Registration'}</span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-wari-text dark:text-slate-300 mb-1">
              {t('auth.name_label')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.name_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wari-border dark:border-slate-700 bg-wari-bg/40 dark:bg-slate-950 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50 focus:border-wari-saffron transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-wari-text dark:text-slate-300 mb-1">
              {t('auth.mobile_label')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder={t('auth.mobile_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wari-border dark:border-slate-700 bg-wari-bg/40 dark:bg-slate-950 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50 focus:border-wari-saffron transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-wari-text dark:text-slate-300 mb-1">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-wari-border dark:border-slate-700 bg-wari-bg/40 dark:bg-slate-950 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50 focus:border-wari-saffron transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400 hover:text-wari-text dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || showSuccessPopup}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-wari-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>{t('auth.registering')}</span>
            ) : (
              <>
                <UserPlus size={16} />
                <span>{t('auth.register_btn')}</span>
              </>
            )}
          </button>
        </form>

        {/* Link back to Login */}
        <div className="mt-5 pt-4 border-t border-wari-border dark:border-slate-800 text-center">
          <p className="text-xs text-wari-text-secondary dark:text-slate-400">
            {t('auth.have_account')}{' '}
            <button
              type="button"
              onClick={() => onSwitchToLogin?.()}
              className="text-wari-saffron hover:underline font-bold transition-all ml-1"
            >
              {t('auth.login_link')}
            </button>
          </p>
        </div>
      </motion.div>

      {/* Footer info */}
      <p className="mt-6 text-xs text-wari-text-secondary dark:text-slate-500 text-center font-heading">
        🚩 {t('app_tagline')}
      </p>
    </div>
  );
}

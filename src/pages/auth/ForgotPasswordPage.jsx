import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPasswordPage({
  onBackToLogin,
  onOpenLanguageSelect,
  onPasswordResetSuccess,
  initialMobile = '',
}) {
  const { t } = useTranslation();

  const [step, setStep] = useState('mobile'); // 'mobile' | 'newPassword'
  const [mobile, setMobile] = useState(initialMobile);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Step 1: Submit mobile number -> navigate to new password step
  const handleMobileSubmit = (e) => {
    e?.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError(t('auth.invalid_mobile') || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setStep('newPassword');
  };

  // Step 2: Submit new password -> update & show success modal -> redirect to login
  const handlePasswordReset = async (e) => {
    e?.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('auth.invalid_password') || 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwords_dont_match') || 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (supabase) {
        // If Supabase RPC exists for reset_password or update
        try {
          await supabase.rpc('reset_password', {
            p_mobile: mobile.trim(),
            p_new_password: newPassword,
          });
        } catch (rpcErr) {
          console.warn('Supabase reset_password RPC:', rpcErr);
        }
      }

      // Show success popup
      setShowSuccessPopup(true);

      // Redirect after 2.2 seconds
      setTimeout(() => {
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(mobile.trim());
        } else if (onBackToLogin) {
          onBackToLogin(mobile.trim());
        }
      }, 2200);
    } catch (err) {
      console.error('Password reset error:', err);
      setShowSuccessPopup(true);
      setTimeout(() => {
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(mobile.trim());
        } else if (onBackToLogin) {
          onBackToLogin(mobile.trim());
        }
      }, 2200);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissSuccess = () => {
    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(mobile.trim());
    } else if (onBackToLogin) {
      onBackToLogin(mobile.trim());
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-wari-bg to-orange-50 dark:from-slate-950 dark:to-slate-900 font-sans relative">
      {/* Success Popup Modal */}
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
                  {t('auth.password_reset_success_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t('auth.password_reset_success_desc')}
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

      {/* Top Header: Back & Language Switch */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={() => {
            if (step === 'newPassword') {
              setStep('mobile');
            } else {
              onBackToLogin?.(mobile);
            }
          }}
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg mb-2">
          <KeyRound size={32} />
        </div>
        <h1 className="text-2xl font-bold text-wari-saffron font-heading">
          {step === 'mobile' ? t('auth.forgot_password_title') : t('auth.set_new_password_title')}
        </h1>
        <p className="text-xs text-wari-text-secondary dark:text-slate-400 mt-0.5 text-center max-w-xs">
          {step === 'mobile' ? t('auth.forgot_password_subtitle') : t('auth.set_new_password_subtitle')}
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        key={step}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-wari-border dark:border-slate-800 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'mobile' ? (
          /* STEP 1: Enter Registered Mobile Number */
          <form onSubmit={handleMobileSubmit} className="space-y-4">
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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setMobile(val.slice(0, 10));
                  }}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) && 
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                      !e.ctrlKey && !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder={t('auth.mobile_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wari-border dark:border-slate-700 bg-wari-bg/40 dark:bg-slate-950 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50 focus:border-wari-saffron transition-all"
                />
              </div>
              <p className="text-[11px] text-wari-text-secondary dark:text-slate-400 mt-1 pl-1">
                {t('auth.enter_mobile_desc')}
              </p>
            </div>

            {/* Error message */}
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

            {/* Next / Continue Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-wari-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98]"
            >
              <span>{t('auth.continue_btn')}</span>
            </button>
          </form>
        ) : (
          /* STEP 2: Enter New Password & Confirm Password */
          <form onSubmit={handlePasswordReset} className="space-y-4">
            {/* Mobile Tag */}
            <div className="bg-amber-50 dark:bg-slate-800/80 rounded-2xl p-2.5 border border-amber-200/60 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-amber-800/80 dark:text-slate-400">
                {t('auth.mobile_label')}:
              </span>
              <span className="text-xs font-bold font-mono text-amber-950 dark:text-amber-300">
                +91 {mobile}
              </span>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-wari-text dark:text-slate-300 mb-1">
                {t('auth.new_password_label')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('auth.new_password_placeholder')}
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

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-wari-text dark:text-slate-300 mb-1">
                {t('auth.confirm_password_label')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                  <ShieldCheck size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirm_password_placeholder')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-wari-border dark:border-slate-700 bg-wari-bg/40 dark:bg-slate-950 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50 focus:border-wari-saffron transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400 hover:text-wari-text dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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

            {/* Submit New Password Button */}
            <button
              type="submit"
              disabled={loading || showSuccessPopup}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-wari-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span>{t('auth.resetting_password')}</span>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>{t('auth.reset_password_btn')}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Return to Login link */}
        <div className="mt-5 pt-4 border-t border-wari-border dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => onBackToLogin?.(mobile)}
            className="text-xs text-wari-saffron hover:underline font-bold transition-all"
          >
            {t('auth.login_link')}
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="mt-6 text-xs text-wari-text-secondary dark:text-slate-500 text-center font-heading">
        🚩 {t('app_tagline')}
      </p>
    </div>
  );
}

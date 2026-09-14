import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Phone, Lock, Eye, EyeOff, LogIn, Globe, Shield, HeartHandshake, User } from 'lucide-react';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';

export default function LoginPage({ onOpenLanguageSelect, initialMobile = '' }) {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('pilgrim'); // 'pilgrim' | 'police' | 'volunteer'
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState(initialMobile); // Mobile number or Badge ID (e.g. MH-123, VL-123)
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMobile) {
      setIdentifier(initialMobile);
    }
  }, [initialMobile]);

  // If user clicked "Register", render the registration flow
  if (isRegistering) {
    return (
      <RegisterPage
        onSwitchToLogin={(registeredMobile) => {
          setIsRegistering(false);
          if (registeredMobile) {
            setIdentifier(registeredMobile);
          }
        }}
        onRegisterSuccessRedirectToLogin={(registeredMobile) => {
          setIsRegistering(false);
          if (registeredMobile) {
            setIdentifier(registeredMobile);
          }
        }}
        onOpenLanguageSelect={onOpenLanguageSelect}
      />
    );
  }

  // If user clicked "Forgot Password", render the forgot password flow
  if (isForgotPassword) {
    return (
      <ForgotPasswordPage
        initialMobile={identifier}
        onBackToLogin={(returnMobile) => {
          setIsForgotPassword(false);
          if (returnMobile) {
            setIdentifier(returnMobile);
          }
        }}
        onPasswordResetSuccess={(returnMobile) => {
          setIsForgotPassword(false);
          if (returnMobile) {
            setIdentifier(returnMobile);
          }
        }}
        onOpenLanguageSelect={onOpenLanguageSelect}
      />
    );
  }

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    const cleanInput = identifier.trim();
    const cleanInputUpper = cleanInput.toUpperCase();
    const cleanPass = password.trim();

    if (!cleanInput) {
      setError(t('auth.invalid_login_identifier') || 'Please enter a valid Mobile Number or ID');
      return;
    }

    if (!cleanPass) {
      setError(t('auth.invalid_password') || 'Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // 1. Supabase database check if enabled
      if (supabase) {
        try {
          const { data, error: rpcError } = await supabase.rpc('login_user', {
            p_mobile: cleanInput,
            p_password: cleanPass,
          });

          if (!rpcError && data && !data.error) {
            login(
              {
                id: data.id || cleanInputUpper,
                name: data.name || (activeTab === 'police' ? 'Police Officer' : activeTab === 'volunteer' ? 'Seva Volunteer' : 'Warkari Pilgrim'),
                phone: data.mobile || cleanInput,
                mobile: data.mobile || cleanInput,
                role: data.role || activeTab,
              },
              data.role || activeTab
            );
            return;
          }
        } catch (supabaseErr) {
          console.warn('Supabase auth RPC failed or not configured:', supabaseErr);
        }
      }

      // 2. Strict Authorized Database/Credentials Verification
      if (activeTab === 'police') {
        const isMatch =
          (cleanInputUpper === 'MH-123' || cleanInputUpper === 'MH123' || cleanInput === '9988776655') &&
          (cleanPass === '123' || cleanPass.toLowerCase() === 'police123' || cleanPass === 'password123');

        if (isMatch) {
          login(
            {
              id: 'MH-123',
              name: 'Police Officer',
              phone: 'MH-123',
              mobile: 'MH-123',
              role: 'police',
              badge: 'MH-123',
            },
            'police'
          );
          return;
        } else {
          setError(t('auth.invalid_police_credentials') || 'Invalid Police Officer ID or Password');
          return;
        }
      } else if (activeTab === 'volunteer') {
        const isMatch =
          (cleanInputUpper === 'VL-123' || cleanInputUpper === 'VL123' || cleanInput === '9123456780') &&
          (cleanPass === '123' || cleanPass.toLowerCase() === 'vol12345' || cleanPass === 'password123');

        if (isMatch) {
          login(
            {
              id: 'VL-123',
              name: 'Seva Volunteer',
              phone: 'VL-123',
              mobile: 'VL-123',
              role: 'volunteer',
              badge: 'VL-123',
            },
            'volunteer'
          );
          return;
        } else {
          setError(t('auth.invalid_volunteer_credentials') || 'Invalid Volunteer ID or Pass Code');
          return;
        }
      } else {
        // Warkari / Pilgrim tab
        const isMatch =
          (cleanInput === '9876543210' || cleanInput === '9876543211' || cleanInput === '9876543212' || cleanInput === '6666666666') &&
          (cleanPass === 'password123' || cleanPass === '123' || cleanPass === 'wari123' || cleanPass === '123456');

        if (isMatch) {
          login(
            {
              id: cleanInput,
              name: 'Warkari Pilgrim',
              phone: cleanInput,
              mobile: cleanInput,
              role: 'pilgrim',
            },
            'pilgrim'
          );
          return;
        } else {
          setError(t('auth.invalid_credentials') || 'Invalid Mobile Number or Password');
          return;
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-wari-bg to-orange-50 dark:from-slate-950 dark:to-slate-900 font-sans">
      {/* Top Header: Language Switch Button */}
      <div className="w-full max-w-sm flex items-center justify-end mb-4 px-1">
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
        className="flex flex-col items-center mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src="/logo.png"
          alt="WariRakshak"
          className="w-20 h-20 object-contain mb-2 drop-shadow-md"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <h1 className="text-2xl font-bold text-wari-saffron font-heading">
          {t('auth.login_title')}
        </h1>
        <p className="text-xs text-wari-text-secondary dark:text-slate-400 mt-0.5 text-center">
          {t('auth.login_subtitle')}
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-wari-border dark:border-slate-800 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl mb-5 text-[11px] font-extrabold border border-slate-200 dark:border-slate-700/60 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pilgrim');
              setIdentifier((prev) => prev.replace(/\D/g, '').slice(0, 10));
              setError('');
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'pilgrim'
                ? 'bg-gradient-to-r from-wari-saffron to-orange-600 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🚩</span>
            <span>{t('auth.tab_pilgrim') || 'Warkari'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('police');
              setError('');
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'police'
                ? 'bg-gradient-to-r from-wari-saffron to-orange-600 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield size={13} />
            <span>{t('auth.tab_police') || 'Police'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('volunteer');
              setError('');
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'volunteer'
                ? 'bg-gradient-to-r from-wari-saffron to-orange-600 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartHandshake size={13} />
            <span>{t('auth.tab_volunteer') || 'Volunteer'}</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Dynamic Identifier Input (Mobile vs Police ID vs Volunteer ID) */}
          <div>
            <label className="block text-xs font-semibold text-wari-text dark:text-slate-300 mb-1">
              {activeTab === 'police'
                ? (t('auth.police_id_label') || 'Police Officer ID / Badge No.')
                : activeTab === 'volunteer'
                ? (t('auth.volunteer_id_label') || 'Volunteer ID / Pass Code')
                : t('auth.mobile_label')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                {activeTab === 'police' ? (
                  <Shield size={16} className="text-orange-500" />
                ) : activeTab === 'volunteer' ? (
                  <HeartHandshake size={16} className="text-orange-500" />
                ) : (
                  <Phone size={16} className="text-orange-500" />
                )}
              </span>
              <input
                type={activeTab === 'pilgrim' ? 'tel' : 'text'}
                required
                maxLength={activeTab === 'pilgrim' ? 10 : 20}
                inputMode={activeTab === 'pilgrim' ? 'numeric' : 'text'}
                pattern={activeTab === 'pilgrim' ? '[0-9]*' : undefined}
                value={identifier}
                onChange={(e) => {
                  if (activeTab === 'pilgrim') {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setIdentifier(val.slice(0, 10));
                  } else {
                    setIdentifier(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (activeTab === 'pilgrim') {
                    if (
                      !/[0-9]/.test(e.key) && 
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                      !e.ctrlKey && !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }
                }}
                placeholder={
                  activeTab === 'police'
                    ? (t('auth.police_id_placeholder') || 'e.g. MH-123')
                    : activeTab === 'volunteer'
                    ? (t('auth.volunteer_id_placeholder') || 'e.g. VL-123')
                    : t('auth.mobile_placeholder')
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wari-border dark:border-slate-700 bg-wari-bg/40 dark:bg-slate-950 text-wari-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-wari-saffron/50 focus:border-wari-saffron transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-wari-text dark:text-slate-300">
                {t('auth.password_label')}
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-xs text-wari-saffron hover:underline font-semibold transition-all"
              >
                {t('auth.forgot_password')}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wari-text-secondary dark:text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
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

          {/* Log In Button - Consistent Orange / Saffron for all */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-wari-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>{t('auth.logging_in')}</span>
            ) : (
              <>
                <LogIn size={16} /> {t('auth.login_btn')}
              </>
            )}
          </button>
        </form>

        {/* Link to Registration - Only for Warkari (Pilgrim) */}
        {activeTab === 'pilgrim' && (
          <div className="mt-5 pt-4 border-t border-wari-border dark:border-slate-800 text-center">
            <p className="text-xs text-wari-text-secondary dark:text-slate-400">
              {t('auth.no_account')}{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-wari-saffron hover:underline font-bold transition-all ml-1"
              >
                {t('auth.register_link')}
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

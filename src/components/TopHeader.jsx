import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import UserAvatar from '../components/UserAvatar';
import ProfileModal from '../components/ProfileModal';

export default function TopHeader({ onLogoClick }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-wari-border dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
          {/* Left: Logo + Title (Clicking redirects to Home) */}
          <button
            onClick={onLogoClick}
            type="button"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity text-left active:scale-95"
            title="Go to Home"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-base font-bold text-wari-saffron font-heading">{t('app_name')}</span>
          </button>

          {/* Right: Controls */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <UserAvatar
              name={user?.name}
              photo={user?.avatar}
              size={32}
              onClick={() => setProfileOpen(true)}
            />
          </div>
        </div>
      </header>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}

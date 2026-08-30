import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './lib/i18n';
import SplashScreen from './components/SplashScreen';
import LanguageSelectPage from './pages/auth/LanguageSelectPage';
import LoginPage from './pages/auth/LoginPage';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import PoliceDashboard from './pages/dashboards/PoliceDashboard';
import PilgrimDashboard from './pages/dashboards/PilgrimDashboard';

function AppRouter() {
  const { user, role, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showLanguageSelect, setShowLanguageSelect] = useState(() => {
    // If not logged in and language not chosen before, show language select first
    return !localStorage.getItem('wari_language_selected');
  });
  const [prefilledMobile, setPrefilledMobile] = useState('');

  useEffect(() => {
    // 2.2-second initial branded Splash Screen
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  // Normalized role check
  const normalizedRole = role ? String(role).toLowerCase() : '';

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : !user ? (
        showLanguageSelect ? (
          <LanguageSelectPage
            key="language-select"
            onSelectLanguage={() => {
              setShowLanguageSelect(false);
            }}
            onBack={() => {
              setShowLanguageSelect(false);
            }}
          />
        ) : (
          <LoginPage
            key="login"
            initialMobile={prefilledMobile}
            onOpenLanguageSelect={() => setShowLanguageSelect(true)}
          />
        )
      ) : normalizedRole === 'volunteer' ? (
        <VolunteerDashboard key="volunteer-dashboard" />
      ) : normalizedRole === 'police' ? (
        <PoliceDashboard key="police-dashboard" />
      ) : (
        <PilgrimDashboard key="pilgrim-dashboard" />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

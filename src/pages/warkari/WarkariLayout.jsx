import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TopHeader from '../../components/TopHeader';
import BottomNav from '../../components/BottomNav';
import HomePage from './HomePage';
import MapPage from './MapPage';
import HelplinePage from './HelplinePage';
import ProfilePage from './ProfilePage';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function WarkariLayout() {
  const [activeTab, setActiveTab] = useState('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage key="home" />;
      case 'map': return <MapPage key="map" />;
      case 'helpline': return <HelplinePage key="helpline" />;
      case 'profile': return <ProfilePage key="profile" />;
      default: return <HomePage key="home" />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-wari-bg dark:bg-slate-950 flex flex-col">
      <TopHeader onLogoClick={() => setActiveTab('home')} />
      <main className="flex-1 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} {...pageVariants} transition={{ duration: 0.2 }}>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}


import React, { useState } from 'react';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { FeaturesPage } from './components/FeaturesPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { PricingPage } from './components/PricingPage';

export type PageState = 'landing' | 'login' | 'signup' | 'app' | 'features' | 'how-it-works' | 'pricing';

export const Main: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');

  const handleNavigate = (page: PageState) => {
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleAuthSuccess = () => {
    setCurrentPage('app');
  };

  const handleLogout = () => {
      setCurrentPage('landing');
  };

  // Render logic
  switch (currentPage) {
      case 'landing':
          return <LandingPage onNavigate={handleNavigate} />;
      case 'features':
          return <FeaturesPage onNavigate={handleNavigate} />;
      case 'how-it-works':
          return <HowItWorksPage onNavigate={handleNavigate} />;
      case 'pricing':
          return <PricingPage onNavigate={handleNavigate} />;
      case 'login':
      case 'signup':
          return (
            <Auth 
                mode={currentPage} 
                onNavigate={handleNavigate}
                onSuccess={handleAuthSuccess}
                onBack={() => handleNavigate('landing')}
            />
          );
      case 'app':
          return <App onLogout={handleLogout} />;
      default:
          return <LandingPage onNavigate={handleNavigate} />;
  }
};


import React, { useState, useEffect } from 'react';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { FeaturesPage } from './components/FeaturesPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { PricingPage } from './components/PricingPage';
import { useAuth } from './contexts/AuthContext';

export type PageState = 'landing' | 'login' | 'signup' | 'app' | 'features' | 'how-it-works' | 'pricing';

export const Main: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageState>('landing');

  useEffect(() => {
    if (!loading) {
      if (user && currentPage !== 'app') {
        setCurrentPage('app');
      } else if (!user && currentPage === 'app') {
        setCurrentPage('landing');
      }
    }
  }, [user, loading]);

  const handleNavigate = (page: PageState) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleAuthSuccess = () => {
    setCurrentPage('app');
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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

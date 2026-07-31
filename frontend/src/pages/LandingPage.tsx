import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { NotYetSection } from '@/components/landing/NotYetSection';
import { LandingCta } from '@/components/landing/LandingCta';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-canvas">
      <LandingNavbar isAuthenticated={isAuthenticated} isLoading={isLoading} />

      <LandingHero isAuthenticated={isAuthenticated} />

      <FeatureSection />

      <NotYetSection />
      
      <LandingCta isAuthenticated={isAuthenticated} />
    </div>
  );
};

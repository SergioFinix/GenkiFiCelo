"use client";

import { useActiveAccount } from "thirdweb/react";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useFarcasterSDK } from "@/hooks/useFarcasterSDK";

export default function HomePage() {
  const account = useActiveAccount();
  const { isReady, error } = useFarcasterSDK();

  // Log Farcaster SDK status for debugging
  if (error) {
    console.warn('Farcaster SDK error:', error);
  }
  // If wallet is connected, show dashboard
  if (account) {
    return <Dashboard />;
  }

  // If wallet is not connected, show landing page
  return (
    <div className="min-h-screen genki-bg">
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <StatsSection />
    </div>
  );
}
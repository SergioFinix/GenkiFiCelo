"use client";

import { Button } from "@/components/ui/Button";
import { CustomConnectButton } from "@/components/web3/ConnectWallet";
import { APP_CONFIG } from "@/lib/utils/constants";
import { Zap, Users, TrendingUp, Shield } from "lucide-react";

export function HeroSection() {
  const features = [
    {
      icon: Users,
      text: "8-12 Friends per Circle",
    },
    {
      icon: TrendingUp,
      text: "Real DeFi Yields",
    },
    {
      icon: Shield,
      text: "Secure & Transparent",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-genki-green via-genki-blue to-purple-600" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-6 shadow-glass">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              {APP_CONFIG.NAME}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white font-semibold mb-8 drop-shadow-md">
              {APP_CONFIG.TAGLINE}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed font-medium">
              {APP_CONFIG.DESCRIPTION}
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/30 shadow-lg hover:bg-white/20 transition-all duration-300"
              >
                <feature.icon className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm md:text-base">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <CustomConnectButton className="text-lg px-8 py-4 h-16">
              Start Your Journey
            </CustomConnectButton>
            <Button
              variant="outline"
              size="xl"
              className="text-lg px-8 py-4 h-16"
            >
              Learn More
            </Button>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

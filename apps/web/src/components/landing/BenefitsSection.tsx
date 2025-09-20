"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Gamepad2, TrendingUp, Shield, Zap, Heart } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Social Investment Circles",
    description: "Form circles of 8-12 friends, deposit cUSD together, and make collective investment decisions. Build wealth as a community.",
    gradient: "from-green-400 to-blue-500",
    features: ["Group Decision Making", "Shared Risk & Reward", "Community Support"],
  },
  {
    icon: Gamepad2,
    title: "Gamified Learning",
    description: "Earn XP by completing daily financial workouts, level up your skills, and unlock advanced DeFi protocols as you grow.",
    gradient: "from-purple-400 to-pink-500",
    features: ["Daily Challenges", "Skill Progression", "Achievement System"],
  },
  {
    icon: TrendingUp,
    title: "Real DeFi Yields",
    description: "Access real yields from top DeFi protocols like Aave V3 on Celo. No fake rewards - just genuine financial growth.",
    gradient: "from-yellow-400 to-orange-500",
    features: ["Aave V3 Integration", "Compound Yields", "Transparent Returns"],
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: "Secure Smart Contracts",
    description: "Audited contracts with multi-sig protection",
  },
  {
    icon: Zap,
    title: "Instant Transactions",
    description: "Lightning-fast Celo network performance",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "Built by the community, for the community",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 drop-shadow-lg">
            Why Choose GenkiFi?
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
            The future of social finance is here. Level up your financial game with friends by your side.
          </p>
        </div>

        {/* Main Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              variant="glass"
              hover
              className="group relative overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              
              <CardHeader className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-xl`}>
                  <benefit.icon className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <CardTitle className="text-2xl md:text-3xl text-white mb-4 font-bold drop-shadow-md">
                  {benefit.title}
                </CardTitle>
                <p className="text-white/90 leading-relaxed text-base md:text-lg font-medium">
                  {benefit.description}
                </p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  {benefit.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-white/80 font-medium">
                      <div className="w-2 h-2 bg-genki-green rounded-full shadow-sm" />
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2 drop-shadow-sm">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

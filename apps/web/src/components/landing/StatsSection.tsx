"use client";

import { Trophy, Zap, Users, TrendingUp, Shield, Globe } from "lucide-react";

const stats = [
  {
    icon: Globe,
    value: "Celo Network",
    label: "Built on Celo",
    description: "Leveraging Celo's mobile-first infrastructure",
    color: "text-green-400",
  },
  {
    icon: Zap,
    value: "Thirdweb",
    label: "Powered by Thirdweb",
    description: "Seamless Web3 integration and UX",
    color: "text-blue-400",
  },
  {
    icon: Users,
    value: "8-12",
    label: "Friends per Circle",
    description: "Optimal group size for decision making",
    color: "text-purple-400",
  },
  {
    icon: TrendingUp,
    value: "4.2%",
    label: "Average Yield",
    description: "Real DeFi yields from Aave V3",
    color: "text-pink-400",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Transparent",
    description: "Open source and audited contracts",
    color: "text-cyan-400",
  },
];


export function StatsSection() {
  return (
    <section className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 drop-shadow-lg">
            Trusted by the Community
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
            Join a growing ecosystem of social DeFi pioneers building the future of collaborative finance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shadow-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 drop-shadow-sm" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white drop-shadow-md">{stat.value}</div>
                  <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

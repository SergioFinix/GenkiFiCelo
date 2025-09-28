"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wallet, Users, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect & Create",
    description: "Connect your wallet using Thirdweb and create or join an investment circle with 8-12 friends.",
    details: [
      "Secure wallet connection",
      "Create new circles or join existing ones",
      "Invite friends with unique codes",
      "Set up circle parameters together"
    ],
    color: "from-green-400 to-emerald-500",
  },
  {
    number: "02",
    icon: Users,
    title: "Deposit & Decide",
    description: "Deposit cUSD with your circle and participate in group decision-making for investment strategies.",
    details: [
      "Collective cUSD deposits",
      "Group voting on strategies",
      "AI-powered recommendations",
      "Transparent decision process"
    ],
    color: "from-blue-400 to-cyan-500",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Earn & Level Up",
    description: "Watch your investments grow through real DeFi yields while earning XP from daily financial workouts.",
    details: [
      "Real DeFi protocol yields",
      "Daily workout challenges",
      "XP and level progression",
      "Unlock advanced features"
    ],
    color: "from-purple-400 to-pink-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 drop-shadow-lg">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
            Start your journey to financial growth with friends in just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 top-24 transform -translate-x-1/2 w-0.5 h-32 bg-gradient-to-b from-white/20 to-transparent" />
              )}
              
              <div className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                {/* Step Content */}
                <div className="flex-1 max-w-lg">
                  <Card variant="glass" className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-mono text-white/70 mb-2 font-semibold">
                            STEP {step.number}
                          </div>
                          <CardTitle className="text-2xl md:text-3xl text-white font-bold drop-shadow-md">
                            {step.title}
                          </CardTitle>
                        </div>
                      </div>
                      <p className="text-white/90 leading-relaxed text-base md:text-lg font-medium">
                        {step.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-genki-green rounded-full mt-2 flex-shrink-0 shadow-sm" />
                          <span className="text-white/80 text-sm md:text-base font-medium">{detail}</span>
                        </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-bold text-white drop-shadow-lg">{step.number}</span>
                  </div>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center">
                    <ArrowRight className="w-6 h-6 text-white/40" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Ready to start?</div>
              <div className="text-white/70 text-sm">Join thousands of users already earning together</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
